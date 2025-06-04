# database.py
import sqlite3
import json

DB_NAME = "nutrition_data.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS nutrition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food TEXT UNIQUE,
            nutrition TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_data(food, nutrition):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO nutrition (food, nutrition)
        VALUES (?, ?)
        ON CONFLICT(food) DO UPDATE SET
            nutrition=excluded.nutrition
    ''', (food, json.dumps(nutrition)))
    conn.commit()
    conn.close()

def get_all_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT food, nutrition FROM nutrition')
    rows = cursor.fetchall()
    conn.close()

    data = []
    for row in rows:
        food, nutrition_json = row
        try:
            nutrition = json.loads(nutrition_json)
        except:
            nutrition = []
        data.append({
            "food": food,
            "nutrition": nutrition
        })
    return data

if __name__ == "__main__":
    init_db()
    print("Database initialized!")
