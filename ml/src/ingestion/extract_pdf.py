import camelot
import pandas as pd
import os


PDF_PATH = "../../data/raw_data/FlashReport_April2026.pdf"
OUTPUT_DIR = "../../data/interim"

os.makedirs(OUTPUT_DIR, exist_ok=True)

tables = camelot.read_pdf(
    PDF_PATH,
    pages="26-end",
    flavor="stream"
)

print("Tables found:", len(tables))

all_tables = []

for i, table in enumerate(tables):
    df = table.df
    
    print(f"\nTable {i + 1}")
    print(df.head())
    
    all_tables.append(df)

combined_df = pd.concat(
    all_tables,
    ignore_index=True
)

combined_df.to_csv(
    f"{OUTPUT_DIR}/all_projects_extracted_stream.csv",
    index=False
)

print("Extraction completed!")
print("Total rows:", len(combined_df))

