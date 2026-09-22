import sys
sys.path.insert(0, '/app/ml/src')

import psycopg2
import pandas as pd
from psycopg2.extras import execute_values
from pathlib import Path

DB = dict(
    dbname='nirikshan',
    user='nirikshan_user',
    password='localdev123',
    host='postgres',
    port=5432
)

CSV_PATH = Path('/app/ml/data/processed/Table6_Engineered.csv')
ALERTS_CSV = Path('/app/ml/data/processed/risk_alerts.csv')
REPORT_MONTH = '2026-04-01'

print("Connecting to database...")
conn = psycopg2.connect(**DB)
cur = conn.cursor()
print("Connected.")

print(f"Loading CSV from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(df)} rows from Table6_Engineered.csv")

def upsert_lookup(table, names):
    unique = sorted(set(str(n) for n in names if pd.notna(n) and str(n) != 'nan'))
    execute_values(
        cur,
        f"INSERT INTO {table} (name) VALUES %s ON CONFLICT (name) DO NOTHING",
        [(n,) for n in unique]
    )
    conn.commit()
    cur.execute(f"SELECT name, id FROM {table}")
    return dict(cur.fetchall())

print("Upserting lookup tables...")
ministry_map = upsert_lookup("ministries", df["Ministry"])
category_map = upsert_lookup("categories", df["Category"])
agency_map   = upsert_lookup("agencies",   df["Agency"])
state_map    = upsert_lookup("states",     df["state_clean"])
print(f"  {len(ministry_map)} ministries, {len(category_map)} categories, {len(agency_map)} agencies, {len(state_map)} states")

print("Inserting projects...")
pid_map = {}
for _, row in df.iterrows():
    try:
        cur.execute("""
            INSERT INTO projects
              (project_code, project_name, ministry_id, category_id, agency_id,
               legacy_ocms_code, pmgid, is_multi_state, approval_date,
               start_date, target_doc, original_cost_cr)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (project_code) DO UPDATE SET project_name = EXCLUDED.project_name
            RETURNING id
        """, (
            int(row["Project Code"]),
            str(row["Project Name"]),
            ministry_map[row["Ministry"]],
            category_map[row["Category"]],
            agency_map[row["Agency"]],
            row["Legacy OCMS Code"] if pd.notna(row.get("Legacy OCMS Code")) else None,
            str(row["PMGID"]) if pd.notna(row.get("PMGID")) else None,
            bool(row["is_multi_state"]),
            row["approval_date"] if pd.notna(row.get("approval_date")) else None,
            row["start_date"],
            row["target_doc"] if pd.notna(row.get("target_doc")) else None,
            float(row["Original Cost (Rs. Crore)"]),
        ))
        pid_map[row["Project Code"]] = cur.fetchone()[0]
    except Exception as e:
        print(f"  Warning on project {row.get('Project Code')}: {e}")
        conn.rollback()
        continue
conn.commit()
print(f"  {len(pid_map)} projects inserted/updated")

print("Linking project-state relationships...")
state_links = []
for _, row in df.iterrows():
    code = row["Project Code"]
    state = row["state_clean"]
    if code in pid_map and pd.notna(state) and str(state) != 'nan' and str(state) in state_map:
        state_links.append((pid_map[code], state_map[str(state)]))
if state_links:
    execute_values(
        cur,
        "INSERT INTO project_states (project_id, state_id) VALUES %s ON CONFLICT DO NOTHING",
        state_links
    )
    conn.commit()
print(f"  {len(state_links)} project-state links")

print("Inserting monthly snapshots...")
snap_rows = []
for _, row in df.iterrows():
    code = row["Project Code"]
    if code not in pid_map:
        continue
    snap_rows.append((
        pid_map[code],
        REPORT_MONTH,
        row["revised_doc"] if pd.notna(row.get("revised_doc")) else None,
        float(row["Revised Cost (Rs. Crore)"]),
        float(row["Cumulative Expenditure (Rs. Crore)"]),
        float(row["Physical Progress (%)"]),
        bool(row["is_delayed"]),
        bool(row["is_cost_overrun"]),
        int(row["schedule_slippage_months"]) if pd.notna(row.get("schedule_slippage_months")) else None,
        float(row["cost_overrun_pct"]) if pd.notna(row.get("cost_overrun_pct")) else None,
    ))
if snap_rows:
    execute_values(cur, """
        INSERT INTO project_snapshots
          (project_id, report_month, revised_doc, revised_cost_cr,
           cumulative_expenditure_cr, physical_progress_pct,
           is_delayed, is_cost_overrun, schedule_slippage_months, cost_overrun_pct)
        VALUES %s
        ON CONFLICT (project_id, report_month) DO NOTHING
    """, snap_rows)
    conn.commit()
print(f"  {len(snap_rows)} snapshots inserted")

# Load risk alerts if the CSV exists
if ALERTS_CSV.exists():
    print("Loading risk alerts CSV...")
    alerts_df = pd.read_csv(ALERTS_CSV)
    print(f"  Found {len(alerts_df)} alert rows")

    for _, row in alerts_df.iterrows():
        code = row.get("Project Code")
        if pd.isna(code) or int(code) not in pid_map:
            continue
        proj_id = pid_map[int(code)]

        # Get the snapshot id for this project
        cur.execute(
            "SELECT id FROM project_snapshots WHERE project_id = %s ORDER BY report_month DESC LIMIT 1",
            (proj_id,)
        )
        snap_row = cur.fetchone()
        snap_id = snap_row[0] if snap_row else None

        try:
            cur.execute("""
                INSERT INTO risk_predictions
                  (project_id, snapshot_id, model_version, delay_probability,
                   cost_overrun_probability, expected_slippage_months,
                   expected_overrun_value_cr, risk_segment, risk_score, needs_alert)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT DO NOTHING
            """, (
                proj_id,
                snap_id,
                'v1.0',
                float(row["delay_probability"]) if pd.notna(row.get("delay_probability")) else None,
                float(row["cost_overrun_probability"]) if pd.notna(row.get("cost_overrun_probability")) else None,
                float(row["expected_slippage_months"]) if pd.notna(row.get("expected_slippage_months")) else None,
                float(row["expected_overrun_value_cr"]) if pd.notna(row.get("expected_overrun_value_cr")) else None,
                str(row["risk_segment"]) if pd.notna(row.get("risk_segment")) else None,
                float(row["risk_score"]) if pd.notna(row.get("risk_score")) else None,
                bool(row["needs_alert"]) if pd.notna(row.get("needs_alert")) else False,
            ))
        except Exception as e:
            print(f"  Alert warning for project {code}: {e}")
            conn.rollback()
            continue
    conn.commit()
    print(f"  Risk predictions inserted")
else:
    print("  No risk_alerts.csv found — running ML predictions on snapshots...")
    # Run predict_risk for each project snapshot
    try:
        from ml.predict import predict_risk
        from ml.load_data import df as _  # just to test import
    except ImportError:
        pass

    cur.execute("""
        SELECT p.id, p.project_code, p.project_name,
               m.name as ministry, c.name as category, a.name as agency,
               s2.name as state,
               p.is_multi_state, p.original_cost_cr,
               p.approval_date, p.start_date, p.target_doc,
               snap.id as snap_id,
               snap.cumulative_expenditure_cr, snap.physical_progress_pct
        FROM projects p
        JOIN ministries m ON m.id = p.ministry_id
        JOIN categories c ON c.id = p.category_id
        JOIN agencies a ON a.id = p.agency_id
        LEFT JOIN project_states ps ON ps.project_id = p.id
        LEFT JOIN states s2 ON s2.id = ps.state_id
        LEFT JOIN project_snapshots snap ON snap.project_id = p.id
        ORDER BY p.id
    """)
    proj_rows = cur.fetchall()
    inserted = 0
    from ml.predict import predict_risk
    for row in proj_rows:
        (pid, pcode, pname, ministry, category, agency, state,
         is_multi, orig_cost, appr_date, start_date, target_doc,
         snap_id, cum_exp, phys_prog) = row

        try:
            result = predict_risk({
                "ministry": ministry or "Unknown",
                "category": category or "Unknown",
                "agency": agency or "Unknown",
                "state": state or "Unknown",
                "is_multi_state": int(bool(is_multi)),
                "original_cost_cr": float(orig_cost or 1000),
                "approval_date": str(appr_date) if appr_date else None,
                "start_date": str(start_date),
                "target_doc": str(target_doc) if target_doc else "2027-01-01",
                "physical_progress_pct": float(phys_prog or 0),
                "cumulative_expenditure_cr": float(cum_exp or 0),
                "has_legacy_code": 0,
                "has_pmgid": 0,
            })
            risk_score = result["delay_probability"] * 0.5 + result["cost_overrun_probability"] * 0.5
            cur.execute("""
                INSERT INTO risk_predictions
                  (project_id, snapshot_id, model_version, delay_probability,
                   cost_overrun_probability, expected_slippage_months,
                   expected_overrun_value_cr, risk_segment, risk_score, needs_alert)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT DO NOTHING
            """, (
                pid, snap_id, 'v1.0',
                result["delay_probability"],
                result["cost_overrun_probability"],
                result["expected_slippage_months"],
                result["expected_overrun_value_cr"],
                result["risk_segment"],
                risk_score,
                result["needs_attention"],
            ))
            inserted += 1
            if inserted % 100 == 0:
                conn.commit()
                print(f"  Predicted {inserted}/{len(proj_rows)}...")
        except Exception as e:
            continue
    conn.commit()
    print(f"  {inserted} risk predictions generated via ML model")

cur.close()
conn.close()
print("\nDatabase seeding complete!")
print("Refresh the frontend at http://localhost:3000/dashboard")
