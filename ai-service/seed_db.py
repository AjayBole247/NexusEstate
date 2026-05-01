import psycopg2
import random
import uuid

# Database connection parameters
DB_PARAMS = {
    "dbname": "nexus_estate",
    "user": "postgres",
    "password": "password", # User to fill in
    "host": "localhost",
    "port": "5432"
}

# Real estate data pools
CITIES = {
    "Mumbai": {"localities": ["Andheri West", "Bandra", "Juhu", "Worli", "Powai"], "premium": 2.5},
    "Bangalore": {"localities": ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar"], "premium": 1.2},
    "New Delhi": {"localities": ["Connaught Place", "Hauz Khas", "Vasant Vihar", "Dwarka", "Saket"], "premium": 1.5},
    "Pune": {"localities": ["Koregaon Park", "Hinjewadi", "Viman Nagar", "Kalyani Nagar"], "premium": 0.9},
    "Hyderabad": {"localities": ["Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli"], "premium": 1.1}
}

IMAGES = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687931-cebf004f9f4a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80"
]

def generate_properties(count=50):
    properties = []
    for i in range(count):
        city_name = random.choice(list(CITIES.keys()))
        city_data = CITIES[city_name]
        locality = random.choice(city_data["localities"])
        
        listing_type = random.choice(["buy", "rent"])
        bhk = random.randint(1, 5)
        bathrooms = max(1, bhk - random.randint(0, 1))
        
        # Sqft scales with BHK
        base_sqft = bhk * 450
        sqft = random.randint(base_sqft - 100, base_sqft + 300)
        
        # Price scales with sqft and city premium
        base_price_per_sqft = 8000 # Base INR
        if listing_type == "rent":
            # Rent is roughly 0.2% of property value per month
            price = int((sqft * base_price_per_sqft * city_data["premium"]) * 0.002)
            # Round to nearest 1000
            price = round(price, -3)
        else:
            price = int(sqft * base_price_per_sqft * city_data["premium"])
            # Round to nearest 100000
            price = round(price, -5)

        title = f"Luxury {bhk} BHK in {locality}" if price > 20000000 else f"Spacious {bhk} BHK in {locality}"
        if listing_type == "rent":
            title = f"{bhk} BHK for Rent in {locality}"

        dist_metro_km = round(random.uniform(0.1, 15.0), 1)
        dist_highway_km = round(random.uniform(0.5, 20.0), 1)
        
        has_pool = random.choice([True, False]) if bhk > 2 else False
        has_gym = random.choice([True, False])

        prop = {
            "id": str(uuid.uuid4()),
            "title": title,
            "listing_type": listing_type,
            "price": price,
            "sqft": sqft,
            "bhk": bhk,
            "bathrooms": bathrooms,
            "locality": locality,
            "city": city_name,
            "dist_metro_km": dist_metro_km,
            "dist_highway_km": dist_highway_km,
            "has_pool": has_pool,
            "has_gym": has_gym,
            "image_url": random.choice(IMAGES)
        }
        properties.append(prop)
    return properties

def seed_database():
    print("Generating property data...")
    properties = generate_properties(50)
    
    try:
        print("Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        # Ensure uuid-ossp extension is enabled
        cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        
        print("Dropping existing properties table...")
        cur.execute("DROP TABLE IF EXISTS properties CASCADE;")
        
        print("Creating new properties table with UUID schema...")
        create_table_query = """
        CREATE TABLE properties (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(255) NOT NULL,
            listing_type VARCHAR(50) NOT NULL CHECK (listing_type IN ('buy', 'rent')),
            price NUMERIC NOT NULL,
            sqft INTEGER NOT NULL,
            bhk INTEGER NOT NULL,
            bathrooms INTEGER NOT NULL,
            locality VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            dist_metro_km FLOAT,
            dist_highway_km FLOAT,
            has_pool BOOLEAN DEFAULT FALSE,
            has_gym BOOLEAN DEFAULT FALSE,
            image_url VARCHAR(500)
        );
        """
        cur.execute(create_table_query)
        
        print("Inserting properties...")
        insert_query = """
        INSERT INTO properties 
        (id, title, listing_type, price, sqft, bhk, bathrooms, locality, city, dist_metro_km, dist_highway_km, has_pool, has_gym, image_url)
        VALUES (%(id)s, %(title)s, %(listing_type)s, %(price)s, %(sqft)s, %(bhk)s, %(bathrooms)s, %(locality)s, %(city)s, %(dist_metro_km)s, %(dist_highway_km)s, %(has_pool)s, %(has_gym)s, %(image_url)s)
        """
        
        cur.executemany(insert_query, properties)
        conn.commit()
        
        print(f"✅ Success! Inserted {len(properties)} properties into the database.")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    seed_database()
