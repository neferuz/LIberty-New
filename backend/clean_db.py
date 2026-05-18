import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "liberty_wear.db")

def clean_database():
    try:
        if not os.path.exists(db_path):
            print(f"Database not found at: {db_path}")
            return
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT data FROM page_content WHERE page_name='settings';")
        row = cursor.fetchone()
        if row:
            data = json.loads(row[0])
            sections = data.get("footer", {}).get("sections", [])
            for sec in sections:
                for link in sec.get("links", []):
                    if link.get("href") == "/collections":
                        link["href"] = "/shop"
                        print("Updated collections link to /shop")
                    if link.get("href") == "/sustainability":
                        link["href"] = "/about"
                        print("Updated sustainability link to /about")
            
            cursor.execute("UPDATE page_content SET data=? WHERE page_name='settings';", (json.dumps(data, ensure_ascii=False),))
            conn.commit()
            print("Server database settings updated successfully!")
        else:
            print("Settings row not found in database.")
            
        conn.close()
    except Exception as e:
        print("Failed to update database:", str(e))

if __name__ == "__main__":
    clean_database()
