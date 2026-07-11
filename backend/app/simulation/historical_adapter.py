import json
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class HistoricalReplayAdapter:
    def __init__(self, events_file="app/simulation/historical_events.json"):
        self.events_file = events_file
        self.events: List[Dict[str, Any]] = []
        self.processed_indices = set()
        self.load_events()
        
    def load_events(self):
        if os.path.exists(self.events_file):
            with open(self.events_file, 'r') as f:
                self.events = json.load(f)
            # Sort by timestamp
            self.events.sort(key=lambda x: x.get("timestamp_minutes", 0))
            logger.info(f"Loaded {len(self.events)} historical events.")
        else:
            logger.error(f"Historical events file not found: {self.events_file}")
            
    def get_events_for_time(self, current_time: float) -> List[Dict[str, Any]]:
        """
        Returns events that should trigger exactly at or before current_time (0-100) 
        and haven't been processed yet.
        """
        current_time_minutes = (current_time / 100.0) * 60.0
        triggered = []
        for i, event in enumerate(self.events):
            if i in self.processed_indices:
                continue
            
            if event.get("timestamp_minutes", 0) <= current_time_minutes:
                triggered.append(event)
                self.processed_indices.add(i)
                
        return triggered
        
    def reset(self):
        self.processed_indices.clear()
