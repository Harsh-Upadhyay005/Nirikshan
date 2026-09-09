"""
load_data.py — Table6_Engineered.csv se data padhke normalized Postgres
schema mein daalta hai. Ye ek-baar-chalane wali script hai (ya jab bhi
naya monthly report aaye, tab dobara).

Run: python3 load_data.py
"""
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2] if "__file__" in dir() else Path(".")
DB_CONFIG = dict(
    dbname="nirikshan", user="nirikshan_user", password="localdev123",
    host="localhost", port=5432,
)
REPORT_MONTH = "2026-04-01"  # this CSV is the April 2026 report

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

df = pd.read_csv(PROJECT_ROOT / "data" / "processed" / "Table6_Engineered.csv")
print(f"Loaded {len(df)} rows from CSV")


def upsert_lookup(table, names):
    """Insert each unique name once, return {name: id} mapping."""
    unique_names = sorted(set(n for n in names if pd.notna(n)))
    execute_values(
        cur,
        f"INSERT INTO {table} (name) VALUES %s ON CONFLICT (name) DO NOTHING",
        [(n,) for n in unique_names],
    )
    conn.commit()
    cur.execute(f"SELECT name, id FROM {table}")
    return dict(cur.fetchall())


# --- Step 1: populate lookup tables first (projects reference these) ---
ministry_map = upsert_lookup("ministries", df["Ministry"])
category_map = upsert_lookup("categories", df["Category"])
agency_map = upsert_lookup("agencies", df["Agency"])
state_map = upsert_lookup("states", df["state_clean"])  # state_clean, not raw
print(f"Lookup tables: {len(ministry_map)} ministries, {len(category_map)} categories, "
      f"{len(agency_map)} agencies, {len(state_map)} states")

# --- Step 2: insert projects (static info) ---
project_id_map = {}
for _, row in df.iterrows():
    cur.execute("""
        INSERT INTO projects (project_code, project_name, ministry_id, category_id,
                               agency_id, legacy_ocms_code, pmgid, is_multi_state,
                               approval_date, start_date, target_doc, original_cost_cr)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (project_code) DO UPDATE SET project_name = EXCLUDED.project_name
        RETURNING id
    """, (
        int(row["Project Code"]), row["Project Name"], ministry_map[row["Ministry"]],
        category_map[row["Category"]], agency_map[row["Agency"]],
        row["Legacy OCMS Code"] if pd.notna(row["Legacy OCMS Code"]) else None,
        str(row["PMGID"]) if pd.notna(row["PMGID"]) else None,
        bool(row["is_multi_state"]),
        row["approval_date"] if pd.notna(row["approval_date"]) else None,
        row["start_date"], row["target_doc"] if pd.notna(row["target_doc"]) else None,
        float(row["Original Cost (Rs. Crore)"]),
    ))
    project_id_map[row["Project Code"]] = cur.fetchone()[0]
conn.commit()
print(f"Inserted {len(project_id_map)} projects")

# --- Step 3: project_states (many-to-many, only meaningful info for the
# multi-state rows — single-state projects get exactly one link too) ---
state_links = [(project_id_map[row["Project Code"]], state_map[row["state_clean"]])
               for _, row in df.iterrows()]
execute_values(cur, "INSERT INTO project_states (project_id, state_id) VALUES %s ON CONFLICT DO NOTHING",
               state_links)
conn.commit()
print(f"Linked {len(state_links)} project-state relationships")

# --- Step 4: snapshots (this month's time-varying data) ---
snapshot_rows = []
for _, row in df.iterrows():
    snapshot_rows.append((
        project_id_map[row["Project Code"]], REPORT_MONTH,
        row["revised_doc"] if pd.notna(row["revised_doc"]) else None,
        float(row["Revised Cost (Rs. Crore)"]),
        float(row["Cumulative Expenditure (Rs. Crore)"]),
        float(row["Physical Progress (%)"]),
        bool(row["is_delayed"]), bool(row["is_cost_overrun"]),
        int(row["schedule_slippage_months"]) if pd.notna(row["schedule_slippage_months"]) else None,
        float(row["cost_overrun_pct"]) if pd.notna(row["cost_overrun_pct"]) else None,
    ))
execute_values(cur, """
    INSERT INTO project_snapshots
    (project_id, report_month, revised_doc, revised_cost_cr, cumulative_expenditure_cr,
     physical_progress_pct, is_delayed, is_cost_overrun, schedule_slippage_months, cost_overrun_pct)
    VALUES %s ON CONFLICT (project_id, report_month) DO NOTHING
""", snapshot_rows)
conn.commit()
print(f"Inserted {len(snapshot_rows)} monthly snapshots")

cur.close()
conn.close()
print("\nDone.")