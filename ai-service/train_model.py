import csv
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

print("Loading Expanded Kaggle Indian Housing Dataset...")

data = []
with open('kaggle_indian_housing_25_cities.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        # ['city', 'bedrooms', 'bathrooms', 'square_feet', 'year_built', 'has_swimming_pool', 'has_gym', 'has_clubhouse', 'has_sports_ground', 'dist_metro_km', 'dist_bus_km', 'dist_highway_km', 'price']
        city = row[0]
        bedrooms = int(row[1])
        bathrooms = int(row[2])
        square_feet = float(row[3])
        year_built = int(row[4])
        has_swimming_pool = int(row[5])
        has_gym = int(row[6])
        has_clubhouse = int(row[7])
        has_sports_ground = int(row[8])
        dist_metro_km = float(row[9])
        dist_bus_km = float(row[10])
        dist_highway_km = float(row[11])
        price = float(row[12])
        
        data.append([
            city, bedrooms, bathrooms, square_feet, year_built,
            has_swimming_pool, has_gym, has_clubhouse, has_sports_ground,
            dist_metro_km, dist_bus_km, dist_highway_km, price
        ])

# Separate X and y
X_raw = [[row[i] for i in range(12)] for row in data]
y = [row[12] for row in data]

print("Building ML Pipeline with OneHotEncoder for Categorical City Data...")
# X column index 0 is 'city', which is categorical string
# X column index 1,2,3,4 are numerical

preprocessor = ColumnTransformer(
    transformers=[
        ('city_cat', OneHotEncoder(handle_unknown='ignore'), [0])
    ],
    remainder='passthrough'
)

val_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1))
])

print("Training Valuation Pipeline (This might take a moment on 100k rows)...")
val_pipeline.fit(X_raw, y)

print("Training Fraud Detection Pipeline...")
# For Fraud Detection, we pass City and Price
# So X_fraud is [city, price]
X_fraud_raw = [[row[0], row[12]] for row in data]

fraud_preprocessor = ColumnTransformer(
    transformers=[
        ('city_cat', OneHotEncoder(handle_unknown='ignore'), [0])
    ],
    remainder='passthrough'
)

fraud_pipeline = Pipeline(steps=[
    ('preprocessor', fraud_preprocessor),
    ('isolation_forest', IsolationForest(contamination=0.01, random_state=42, n_jobs=-1))
])

fraud_pipeline.fit(X_fraud_raw)

print("Saving massive pipelines to disk...")
os.makedirs('models', exist_ok=True)
joblib.dump(val_pipeline, 'models/valuation_pipeline.pkl')
joblib.dump(fraud_pipeline, 'models/fraud_pipeline.pkl')

print("Success! The Kaggle-style pipelines are ready.")
