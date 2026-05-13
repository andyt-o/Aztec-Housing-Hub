import json
import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Please set it in a .env file.")

DATA_DIR = Path(__file__).parent / "data"

def seed_database():
    print("Connecting to the database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Create tables from schema.sql
    print("Creating tables...")
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        cur.execute(f.read())
    
    conn.commit()

    # 2. Seed Zipcodes
    print("Seeding zipcodes...")
    zipcodes_path = DATA_DIR / "zipcodes.json"
    if zipcodes_path.exists():
        with open(zipcodes_path, "r", encoding="utf-8") as f:
            zipcodes = json.load(f)
            for z in zipcodes:
                cur.execute(
                    "INSERT INTO zipcodes (zip, city) VALUES (%s, %s) ON CONFLICT (zip) DO NOTHING",
                    (z["zip"], z["city"])
                )
    
    # 3. Seed On-Campus Listings
    print("Seeding onCampus listings...")
    listings_path = DATA_DIR / "listings.json"
    if listings_path.exists():
        with open(listings_path, "r", encoding="utf-8") as f:
            listings_data = json.load(f)
            on_campus = listings_data.get("onCampus", [])
            for item in on_campus:
                cur.execute(
                    """
                    INSERT INTO listings (
                        id, title, description, url, availability, type, 
                        placement, area, beds, baths, price, clicks
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        price = EXCLUDED.price,
                        availability = EXCLUDED.availability
                    """,
                    (
                        item.get("id"),
                        item.get("title"),
                        item.get("description"),
                        item.get("url"),
                        item.get("availability"),
                        item.get("type"),
                        item.get("placement", "onCampus"),
                        item.get("area"),
                        item.get("beds"),
                        item.get("baths"),
                        item.get("price"),
                        item.get("clicks", 0)
                    )
                )
                
                # Seed click history if any
                click_history = item.get("clickHistory", [])
                for history in click_history:
                    cur.execute(
                        """
                        INSERT INTO listing_click_history (listing_id, date, count)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (listing_id, date) DO UPDATE SET count = EXCLUDED.count
                        """,
                        (item.get("id"), history.get("date"), history.get("count"))
                    )

    conn.commit()
    cur.close()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
