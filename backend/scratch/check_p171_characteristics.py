import sqlite3
import json

def check_p171():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, sku, characteristics, sizes, composition FROM products WHERE id=171;")
    row = cursor.fetchone()
    conn.close()
    
    if row:
        print("=== DATABASE PRODUCT 171 DATA ===")
        print(f"ID: {row[0]}")
        print(f"Name: {row[1]}")
        print(f"SKU: {row[2]}")
        print(f"Sizes: {row[4]}")
        print(f"Composition: {row[5]}")
        print("Characteristics:")
        try:
            chars = json.loads(row[3]) if row[3] else {}
            import pprint
            pprint.pprint(chars)
        except Exception as e:
            print(f"Raw Characteristics: {row[3]} | Error: {e}")
    else:
        print("Product 171 not found in database!")

if __name__ == "__main__":
    check_p171()
