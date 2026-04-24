from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from graph_engine import detect_swap_cycles

app = FastAPI(title="NexusEstate Swap Engine")

class SwapRequestInput(BaseModel):
    id: int
    user_id: int
    current_city: str
    desired_city: str
    # We omit dates here as we assume the API Gateway queried PostgreSQL 
    # using GiST indices to pre-filter matching dates before sending to Python.

class CycleDetectionPayload(BaseModel):
    requests: List[SwapRequestInput]

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "Swap Engine"}

@app.post("/api/cycles/detect")
def detect_cycles(payload: CycleDetectionPayload):
    try:
        # Convert pydantic models to dicts for the engine
        requests_dict = [req.model_dump() for req in payload.requests]
        
        cycles = detect_swap_cycles(requests_dict)
        
        return {
            "message": "Cycle detection complete",
            "cycles_found": len(cycles),
            "cycles": cycles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
