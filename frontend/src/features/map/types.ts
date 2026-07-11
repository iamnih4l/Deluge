export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface MapFeature {
  id: string;
  type: 'vehicle' | 'shelter' | 'alert';
  coordinates: [number, number];
  properties: Record<string, any>;
}
