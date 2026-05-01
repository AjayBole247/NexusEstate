# Kaggle Source Information

The dataset `kaggle_indian_housing_25_cities.csv` is built upon the official "House Rent Prediction Dataset" published on Kaggle.

**Original Kaggle Link**: [House Rent Prediction Dataset](https://www.kaggle.com/datasets/iamsoumik/house-rent-prediction-dataset)

### Data Engineering Process
To accommodate the specific architectural requirements of the NexusEstate platform without requiring raw Kaggle API Keys, the following data engineering steps were performed:
1. The base raw dataset (containing 4,700+ rows of authentic real estate listings across 6 Indian cities) was ingested via an open GitHub mirror.
2. The dataset was programmatically expanded using a statistical variance algorithm to cover exactly 25 major Indian cities.
3. Complex Property Parameters (`has_swimming_pool`, `has_gym`, `has_clubhouse`, `has_sports_ground`) and Proximity Metrics (`dist_metro_km`, `dist_bus_km`, `dist_highway_km`) were synthetically injected.
4. Base rental yields were mathematically mapped to realistic Sale Prices (INR) adjusting for the injected amenities and regional modifiers.
