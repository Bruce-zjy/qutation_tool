import os
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(SCRIPT_DIR, 'QL Products List with price.xlsx')
OUTPUT_PATH = os.path.join(SCRIPT_DIR, 'product_prices.pkl')


def flatten_column(col):
    # col may be a tuple from MultiIndex (level1, level2)
    if isinstance(col, tuple):
        a = str(col[0]).strip() if col[0] is not None else ''
        b = str(col[1]).strip() if col[1] is not None else ''
        # Normalize NaN-like second level
        if b.lower() in ('nan', ''):
            b = ''
        # Pass-through for base text columns
        if a in ('Product', 'Description', 'Cut-Off', 'Pack'):
            return a
        # Merge price columns
        if a in ('成品', '大板') and b in ('RMB', 'USD'):
            return f"{a}_{b}"
        # Fallback merge
        return a if not b else f"{a}_{b}"
    return str(col).strip()


def build_prices_pickle():
    # Read with two header rows to capture the hierarchy
    df = pd.read_excel(EXCEL_PATH, sheet_name=0, header=[1, 2])
    # Flatten columns
    df.columns = [flatten_column(c) for c in df.columns]

    # Keep only relevant columns; create missing ones as NaN
    needed_cols = ['Product', 'Description', 'Cut-Off', 'Pack',
                   '成品_RMB', '成品_USD', '大板_RMB', '大板_USD']
    for col in needed_cols:
        if col not in df.columns:
            df[col] = pd.NA
    df = df[needed_cols]

    # Forward fill 'Product' for grouped items
    if 'Product' in df.columns:
        df['Product'] = df['Product'].ffill()

    # Normalize price values: replace '/' with NaN and coerce to numeric
    price_cols = ['成品_RMB', '成品_USD', '大板_RMB', '大板_USD']
    for col in price_cols:
        df[col] = df[col].replace('/', pd.NA)
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Drop rows that are completely empty (no description, pack, and no prices)
    non_price_info = df[['Description', 'Pack']].notna().any(axis=1)
    any_price = df[price_cols].notna().any(axis=1)
    df = df[non_price_info | any_price]

    # Save as pickle
    df.to_pickle(OUTPUT_PATH)
    print(f"Saved pickle: {OUTPUT_PATH}")
    print(f"Rows: {len(df)}, Columns: {len(df.columns)}")


if __name__ == '__main__':
    build_prices_pickle()