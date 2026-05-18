import sqlite3

def check_skus():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, sku, bitrix_id FROM products")
    rows = cursor.fetchall()
    print("=== DATABASE PRODUCTS SKU CHECK ===")
    for row in rows:
        print(f"ID: {row[0]} | Name: {row[1]} | SKU: {row[2]} | Bitrix ID: {row[3]}")
    conn.close()

if __name__ == "__main__":
    check_skus()
