import { systemEventBus, SimEvent } from './eventBus';

/**
 * Data Fusion Layer
 * Normalizes raw external inputs into internal SimEvents with confidence scoring.
 */

// Mock Satellite API payload
interface RawSatelliteDetection {
  lat: number;
  lng: number;
  radiusMeters: number;
  waterDepthCm: number;
  cloudCoverPct: number;
}

export class DataFusionLayer {
  
  /**
   * Adapts raw satellite flood imagery data into an internal FloodDetected event.
   * Calculates confidence based on cloud cover occlusion.
   */
  static ingestSatelliteFloodData(data: RawSatelliteDetection) {
    // Generate a rough polygon (hexagon) around the center for the event
    const R = data.radiusMeters / 111320; // Rough conversion from meters to degrees
    const polygon: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      polygon.push([
        data.lng + R * Math.cos(angle),
        data.lat + R * Math.sin(angle)
      ]);
    }

    // Confidence drops rapidly if cloud cover > 20%
    let confidence = 0.98; // Base SAR confidence
    if (data.cloudCoverPct > 20) {
      confidence = Math.max(0.4, 0.98 - (data.cloudCoverPct - 20) * 0.01);
    }

    const event: Extract<SimEvent, { type: 'FloodDetected' }> = {
      id: `sat-det-${Date.now()}`,
      type: 'FloodDetected',
      timestamp: Date.now(),
      source: 'satellite',
      confidence,
      payload: {
        polygon,
        depth: data.waterDepthCm / 100, // Convert to meters
      }
    };

    systemEventBus.publish(event);
  }

  /**
   * Adapts raw drone bridge inspection data into an InfrastructureFailure event.
   */
  static ingestDroneInspection(bridgeId: string, structuralIntegrityPct: number) {
    if (structuralIntegrityPct < 30) {
      systemEventBus.publish({
        id: `drone-insp-${Date.now()}`,
        type: 'InfrastructureFailure',
        timestamp: Date.now(),
        source: 'drone',
        confidence: 0.95, // High confidence from direct video feed
        payload: {
          infrastructureId: bridgeId,
          failureType: 'structural_collapse'
        }
      });
    }
  }
}
