from pydantic import BaseModel, Field
from typing import List, Tuple, Optional, Literal, Dict, Any

# Types
LngLat = Tuple[float, float]

class FloodCell(BaseModel):
    id: str
    center: LngLat
    currentRadius: float
    maxRadius: float
    waterDepth: float
    activationTime: float
    growthRate: float
    polygon: List[LngLat]

class RoadSegment(BaseModel):
    id: str
    name: str
    path: List[LngLat]
    status: Literal['open', 'at_risk', 'flooded', 'blocked']
    floodTime: float
    capacity: float

class Vehicle(BaseModel):
    id: str
    callsign: str
    type: Literal['rescue_boat', 'heli', 'drone', 'ground_unit', 'ambulance', 'engineering', 'command']
    position: LngLat
    heading: float
    route: List[LngLat]
    routeProgress: float
    speed: float
    assignedMission: Optional[str]
    status: Literal['idle', 'en_route', 'on_scene', 'returning']

class Shelter(BaseModel):
    id: str
    name: str
    position: LngLat
    capacity: int
    currentOccupancy: int
    status: Literal['operational', 'at_capacity', 'compromised']
    intakeRate: int
    accessible: bool

class Infrastructure(BaseModel):
    id: str
    name: str
    type: Literal['power_station', 'hospital', 'bridge', 'comms_tower']
    position: LngLat
    status: Literal['operational', 'offline', 'compromised']
    detail: str

class Mission(BaseModel):
    id: str
    title: str
    status: Literal['pending', 'in_progress', 'complete', 'failed', 'critical']
    priority: Literal['P1', 'P2', 'P3']
    assignedUnit: Optional[str]
    eta: Optional[float]
    startedAt: float = 0.0
    completedAt: Optional[float] = None
    targetLocation: Optional[LngLat] = None

class SimAlert(BaseModel):
    id: str
    severity: Literal['info', 'warning', 'critical']
    title: str
    body: str
    timestamp: float
    acknowledged: bool = False
    confidence: Optional[float] = None
    action: Optional[Dict[str, Any]] = None

class SimulationState(BaseModel):
    time: float
    isRunning: bool
    speed: float
    severity: Literal['nominal', 'elevated', 'critical']
    floodCells: List[FloodCell]
    roads: List[RoadSegment]
    vehicles: List[Vehicle]
    shelters: List[Shelter]
    infrastructure: List[Infrastructure]
    missions: List[Mission]
    alerts: List[SimAlert]
    stats: dict
