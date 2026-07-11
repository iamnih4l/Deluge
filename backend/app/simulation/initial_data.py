from app.schemas.simulation import SimulationState
from app.simulation.osm_adapter import (
    get_osm_graph, 
    extract_road_segments, 
    extract_safe_zones, 
    extract_infrastructure
)
import logging

logger = logging.getLogger(__name__)

def get_initial_state() -> SimulationState:
    logger.info("Initializing Deluge State from OSM Adapter...")
    
    # 1. Fetch the real map graph
    G = get_osm_graph()
    
    # 2. Extract features
    roads = extract_road_segments(G)
    shelters = extract_safe_zones()
    infrastructure = extract_infrastructure()
    
    # Vehicles & Missions: we can start empty and dispatch them later
    vehicles = []
    missions = []
    
    # Flood Cells: we start empty and rely on historical events
    flood_cells = []
    
    # Alerts
    alerts = []
    
    stats = {
        "dispatchedUnits": 0,
        "activeAlerts": 0,
        "atRiskPopulation": 0,
        "safePopulation": 0
    }

    state = SimulationState(
        time=0.0,
        speed=1.0,
        isRunning=False,
        severity="elevated",
        stats=stats,
        missions=missions,
        alerts=alerts,
        infrastructure=infrastructure,
        shelters=shelters,
        vehicles=vehicles,
        roads=roads,
        floodCells=flood_cells
    )
    
    logger.info("State initialized successfully.")
    return state
