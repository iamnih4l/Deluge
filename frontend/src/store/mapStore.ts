import { create } from 'zustand';
import { ViewState } from '../features/map/types';

interface MapStore {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  /** Which map layers are currently visible */
  layers: {
    buildings: boolean;
    flood: boolean;
    vehicles: boolean;
    routes: boolean;
    shelters: boolean;
    infrastructure: boolean;
    roads: boolean;
  };
  toggleLayer: (layer: keyof MapStore['layers']) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewState: {
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  },
  setViewState: (viewState) => set({ viewState }),

  layers: {
    buildings: true,
    flood: true,
    vehicles: true,
    routes: true,
    shelters: true,
    infrastructure: true,
    roads: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
}));
