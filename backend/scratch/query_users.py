import sqlite3

def main():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, email, phone, name, is_active, bitrix_contact_id FROM user;")
        users = cursor.fetchall()
        print("Users in DB:")
        for u in users:
            print(f"ID: {u[0]}, Email: {u[1]}, Phone: {u[2]}, Name: {u[3]}, Active: {u[4]}, BitrixContactID: {u[5]}")
    except Exception as e:
        print(f"Error querying user table: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
