import psycopg2

conn = psycopg2.connect(
    dbname='nirikshan',
    user='nirikshan_user',
    password='localdev123',
    host='postgres',
    port=5432
)
cur = conn.cursor()

# Mark Critical and High risk as needing alerts
cur.execute("""
    UPDATE risk_predictions
    SET needs_alert = TRUE
    WHERE risk_segment IN ('Critical Risk', 'High Risk', 'Moderate Risk')
""")
print(f"Marked {cur.rowcount} predictions as needs_alert=TRUE by segment")

# Also mark any prediction with risk_score >= 0.4 (composite score)
cur.execute("""
    UPDATE risk_predictions
    SET needs_alert = TRUE
    WHERE risk_score >= 0.4 AND needs_alert = FALSE
""")
print(f"Marked {cur.rowcount} additional predictions by score threshold")

conn.commit()

cur.execute("SELECT COUNT(*) FROM risk_predictions WHERE needs_alert = TRUE")
total_alerts = cur.fetchone()[0]
print(f"Total needs_alert=TRUE: {total_alerts}")

cur.execute("""
    SELECT risk_segment, COUNT(*)
    FROM risk_predictions
    WHERE needs_alert = TRUE
    GROUP BY risk_segment
    ORDER BY COUNT(*) DESC
""")
print("Breakdown by segment:")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

cur.close()
conn.close()
print("Done. Refresh the Risk & Warnings page.")
