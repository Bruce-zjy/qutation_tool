
import pandas as pd
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

def load_product_data():
    return pd.read_pickle('product_prices.pkl')

def search_product(query, dataframe, limit=5):
    temp_df = dataframe.copy()
    temp_df['unique_id'] = temp_df.index

    temp_df['combined_text'] = temp_df['Product'].astype(str).fillna('') + ' ' +                                   temp_df['Description'].astype(str).fillna('') + ' ' +                                   temp_df['Cut-Off'].astype(str).fillna('') + ' ' +                                   temp_df['Pack'].astype(str).fillna('')

    matches = process.extract(query, temp_df['combined_text'], limit=limit*2, scorer=fuzz.token_set_ratio)
    
    all_matches = {}
    for match_str, score, idx in matches:
        if idx not in all_matches or score > all_matches[idx]:
            all_matches[idx] = score

    sorted_matches = sorted(all_matches.items(), key=lambda item: item[1], reverse=True)

    results = []
    for original_idx, score in sorted_matches[:limit]:
        original_row = dataframe.loc[original_idx].copy()
        original_row['match_score'] = score
        results.append(original_row)
        
    return pd.DataFrame(results)

def calculate_quotation_prices(base_usd, add_on_percentage=0.10, exchange_rate=7.1, tax_rate=0.13):
    final_usd = base_usd * (1 + add_on_percentage)
    final_rmb = final_usd * exchange_rate * (1 + tax_rate)
    return {
        'final_usd': final_usd,
        'final_rmb': final_rmb
    }
