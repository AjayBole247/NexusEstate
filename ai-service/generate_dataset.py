import csv
import random

CITIES = {
    "New York": 2.5, "San Francisco": 2.8, "Los Angeles": 2.2,
    "Chicago": 1.2, "Houston": 1.0, "Phoenix": 1.1,
    "Philadelphia": 1.1, "San Antonio": 0.9, "San Diego": 1.9,
    "Dallas": 1.1, "San Jose": 2.6, "Austin": 1.8,
    "Jacksonville": 0.9, "Fort Worth": 1.0, "Columbus": 0.8,
    "Charlotte": 1.1, "Indianapolis": 0.8, "Seattle": 1.9,
    "Denver": 1.5, "Miami": 1.7
}

n_samples = 100000

print(f"Generating {n_samples} realistic property records across 20 cities...")

with open('kaggle_us_housing_20_cities.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    # Header
    writer.writerow(['city', 'bedrooms', 'bathrooms', 'square_feet', 'year_built', 'price'])
    
    for _ in range(n_samples):
        city = random.choice(list(CITIES.keys()))
        multiplier = CITIES[city]
        
        bedrooms = random.randint(1, 6)
        bathrooms = random.randint(1, max(1, bedrooms - 1))
        square_feet = random.randint(500, 5000)
        year_built = random.randint(1920, 2024)
        
        base_price = 50000
        true_price = (
            base_price 
            + (bedrooms * 25000) 
            + (bathrooms * 15000) 
            + (square_feet * 120) 
            - ((2024 - year_built) * 800)
        )
        # Apply city economic multiplier
        city_price = true_price * multiplier
        
        # Add market variance noise (between -5% and +5%)
        noise_factor = random.uniform(0.95, 1.05)
        final_price = max(50000, city_price * noise_factor)
        
        writer.writerow([city, bedrooms, bathrooms, square_feet, year_built, round(final_price, 2)])

print("Successfully saved to kaggle_us_housing_20_cities.csv!")
