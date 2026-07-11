import { create } from 'zustand';
import { ViewState } from '../features/map/types';

interface MapStore {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  // Live state
  isSimulationRunning: boolean;
  setSimulationRunning: (val: boolean) => void;
  simulationTime: number; // 0 to 100 representing percentage of flood event
  setSimulationTime: (val: number) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewState: {
    longitude: -74.0060, // Default to New York City for mock buildings
    latitude: 40.7128,
    zoom: 15,
    pitch: 60,
    bearing: -20,
  },
  setViewState: (viewState) => set({ viewState }),
  
  isSimulationRunning: false,
  setSimulationRunning: (val) => set({ isSimulationRunning: val }),
  
  simulationTime: 0,
  setSimulationTime: (val) => set({ simulationTime: val }),
}));
