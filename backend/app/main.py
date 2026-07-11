from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.websocket.routes import router as websocket_router
from app.simulation.engine import simulation_engine
import asyncio

app = FastAPI(title="Deluge Emergency Response API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket_router)

@app.on_event("startup")
async def startup_event():
    # Start the simulation tick loop in the background
    asyncio.create_task(simulation_engine.start_simulation_loop())
    print("Deluge Backend Started. Simulation Engine Running.")

@app.get("/")
def read_root():
    return {"status": "operational", "system": "Deluge In-Memory Backend"}

@app.get("/api/analysis/stats")
def get_analysis_stats():
    from app.simulation.state import sim_state
    state = sim_state.get_state()
    
    # Calculate some basic metrics
    total_rainfall = 3212 if state.time > 0 else 0  # mock rainfall for now
    
    # Roads compromised
    roads_compromised_km = 0
    for r in state.roads:
        if r.status in ('flooded', 'blocked', 'at_risk'):
            roads_compromised_km += len(r.path) * 0.05 # rough approx
            
    # Bridges/Infra destroyed
    infra_destroyed = len([i for i in state.infrastructure if i.status != 'operational'])
    
    # Evacuated / at risk
    evacuated = sum([s.currentOccupancy for s in state.shelters])
    
    import json
    from pathlib import Path
    
    events_path = Path(__file__).parent / "simulation" / "historical_events.json"
    timeline_events = []
    if events_path.exists():
        with open(events_path, "r") as f:
            timeline_events = json.load(f)

    return {
        "rainfall_mm": total_rainfall,
        "roads_compromised_km": int(roads_compromised_km),
        "affected_population": 1200000 + evacuated,
        "infrastructure_destroyed": infra_destroyed,
        "environmental": {
            "river_peak_m": 14.5 if state.time > 0 else 10.0,
            "dam_release_cumecs": 7000 if state.time > 20 else 2000,
            "wind_speed_kmh": 45,
            "soil_saturation_pct": 98 if state.time > 10 else 75
        },
        "timeline": timeline_events
    }
