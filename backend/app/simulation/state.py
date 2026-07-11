from app.schemas.simulation import SimulationState
from app.simulation.initial_data import get_initial_state

class SimStateSingleton:
    def __init__(self):
        # We will initialize this with actual data once we create initial_data.py
        self._state: SimulationState = None
    
    def initialize(self):
        self._state = get_initial_state()
        
    def get_state(self) -> SimulationState:
        if self._state is None:
            self.initialize()
        return self._state

    def set_running(self, val: bool):
        if self._state:
            self._state.isRunning = val
            
    def reset(self):
        self.initialize()
        
    def set_time(self, time: float):
        if self._state:
            self._state.time = time
            
    def set_speed(self, speed: float):
        if self._state:
            self._state.speed = speed
        
    def update_state(self, new_state: SimulationState):
        self._state = new_state

sim_state = SimStateSingleton()
