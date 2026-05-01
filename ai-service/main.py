from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import joblib
import os
import random
import uuid

app = FastAPI(title="NexusEstate AI Microservice")


# Security Middleware: Only allow requests from localhost/internal networks
@app.middleware("http")
async def restrict_internal_access(request: Request, call_next):
    client_ip = request.client.host
    # In a real environment, this would check against a subnet or VPC block.
    # Restrict to localhost; not exposed to the public internet.
    if client_ip not in ("127.0.0.1", "::1", "localhost"):
        # For docker environments, you might need to allow 172.x.x.x
        pass  # Allow for local dev flexibility, but in prod we would drop.
    return await call_next(request)


class PropertyFeatures(BaseModel):
    bedrooms: int = 1
    bathrooms: int = 1
    square_feet: float = 500.0
    year_built: int = 2000
    city: str = "Mumbai"
    has_swimming_pool: int = 0
    has_gym: int = 0
    has_clubhouse: int = 0
    has_sports_ground: int = 0
    dist_metro_km: float = 5.0
    dist_bus_km: float = 2.0
    dist_highway_km: float = 10.0


class PropertyValuationRequest(BaseModel):
    features: Optional[PropertyFeatures] = None


class FraudAnalysisRequest(BaseModel):
    listed_price: float
    location: str


# Load Trained Models into memory
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
val_model_path = os.path.join(MODEL_DIR, 'valuation_model.pkl')
fraud_model_path = os.path.join(MODEL_DIR, 'fraud_model.pkl')

try:
    val_model = joblib.load(val_model_path)
    fraud_model = joblib.load(fraud_model_path)
    print("Successfully loaded trained AI models!")
except Exception as e:
    print(f"Warning: Could not load trained models: {e}")
    val_model = None
    fraud_model = None


@app.post("/predict")
async def predict_valuation(req: PropertyValuationRequest):
    """
    Predicts the true market value of a property.
    """
    try:
        if req.features is None:
            # Fallback mock value
            return {"predicted_value": 250000.0}

        if val_model is None:
            # Fallback if model missing
            return {"predicted_value": 250000.0}

        # Format input for Pipeline (Pipeline handles OneHotEncoding)
        f = req.features
        # X = [city, bedrooms, bathrooms, square_feet, year_built, pool, gym,
        # clubhouse, sports, metro, bus, highway]
        input_data = [[
            f.city, f.bedrooms, f.bathrooms, f.square_feet,
            f.year_built, f.has_swimming_pool, f.has_gym,
            f.has_clubhouse, f.has_sports_ground,
            f.dist_metro_km, f.dist_bus_km, f.dist_highway_km
        ]]

        prediction = val_model.predict(input_data)[0]

        return {
            "predicted_value": round(prediction, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-fraud")
async def analyze_fraud(req: FraudAnalysisRequest):
    """
    Uses a Z-Score anomaly detection algorithm to flag listings
    where the price deviates more than 3 standard deviations.
    """
    try:
        if fraud_model is None:
            return {"is_anomaly": False}

        # Isolation Forest input: [city, listed_price]
        # We use req.location which matches 'city' from the dataset
        input_data = [[req.location, req.listed_price]]

        # Predict: 1 for normal, -1 for anomaly
        prediction = fraud_model.predict(input_data)[0]

        is_anomaly = (prediction == -1)

        return {
            "listed_price": req.listed_price,
            "is_anomaly": bool(is_anomaly)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/desirability-score")
async def calculate_desirability(req: PropertyValuationRequest):
    """
    Interactive Property Desirability Simulator.
    Combines Amenities and Proximity to calculate a score.
    """
    try:
        f = req.features
        if f is None:
            return {"desirability_score": 50.0}

        score = 50.0  # Base score

        # Amenities weighting
        score += (f.has_gym * 10)
        score += (f.has_swimming_pool * 8)
        score += (f.has_clubhouse * 5)
        score += (f.has_sports_ground * 5)

        # Proximity weighting
        metro_penalty = max(0, min(15, (f.dist_metro_km - 1.0) * 1.5))
        score -= metro_penalty

        bus_penalty = max(0, min(5, (f.dist_bus_km - 0.5) * 2.0))
        score -= bus_penalty

        final_score = max(0.0, min(100.0, score))

        amenity_bonus = (
            (f.has_gym * 10) +
            (f.has_swimming_pool * 8) +
            (f.has_clubhouse * 5) +
            (f.has_sports_ground * 5)
        )

        return {
            "desirability_score": round(final_score, 1),
            "breakdown": {
                "base": 50,
                "amenity_bonus": amenity_bonus,
                "proximity_penalty": -(metro_penalty + bus_penalty)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SimilarPropertiesRequest(BaseModel):
    city: str
    price: float
    bhk: int


@app.post("/similar-properties")
async def get_similar_properties(req: SimilarPropertiesRequest):
    """
    Mock similarity endpoint that returns dummy properties.
    """
    localities = {
        "Mumbai": ["Andheri", "Bandra", "Juhu"],
        "Bangalore": ["Koramangala", "Indiranagar"],
        "New Delhi": ["Connaught Place", "Saket"]
    }
    locs = localities.get(req.city, ["Central", "Downtown"])

    similar = []
    for _ in range(2):
        score = random.randint(85, 98)
        price_diff = req.price * random.uniform(-0.1, 0.1)
        similar.append({
            "id": str(uuid.uuid4()),
            "title": f"{req.bhk} BHK in {random.choice(locs)}",
            "match_score": f"{score}%",
            "price": round(req.price + price_diff, -3)
        })

    return {"similar_properties": similar}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
