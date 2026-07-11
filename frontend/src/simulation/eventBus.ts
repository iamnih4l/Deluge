export type ConfidenceScore = number; // 0.0 to 1.0

export interface BaseEvent {
  id: string;
  timestamp: number;
  confidence: ConfidenceScore;
  source: 'satellite' | 'drone' | 'gauge' | 'citizen' | 'system' | 'weather';
}

// ── Event Payloads ──
export interface FloodDetectedEvent extends BaseEvent {
  type: 'FloodDetected';
  payload: {
    polygon: [number, number][]; // [lng, lat][]
    depth: number;
  };
}

export interface RainfallIncreaseEvent extends BaseEvent {
  type: 'RainfallIncrease';
  payload: {
    mmPerHour: number;
    durationMinutes: number;
  };
}

export interface InfrastructureFailureEvent extends BaseEvent {
  type: 'InfrastructureFailure';
  payload: {
    infrastructureId: string;
    failureType: 'power_loss' | 'structural_collapse' | 'submerged';
  };
}

export interface RoadClosedEvent extends BaseEvent {
  type: 'RoadClosed';
  payload: {
    roadId: string;
    reason: string;
  };
}

export type SimEvent =
  | FloodDetectedEvent
  | RainfallIncreaseEvent
  | InfrastructureFailureEvent
  | RoadClosedEvent;

type EventCallback = (event: SimEvent) => void;

class EventBus {
  private listeners: Map<SimEvent['type'], EventCallback[]> = new Map();

  subscribe<T extends SimEvent['type']>(
    eventType: T,
    callback: (event: Extract<SimEvent, { type: T }>) => void
  ) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    // Type assertion needed because TS doesn't perfectly narrow arrays of unions
    this.listeners.get(eventType)!.push(callback as EventCallback);

    return () => this.unsubscribe(eventType, callback as EventCallback);
  }

  unsubscribe(eventType: SimEvent['type'], callback: EventCallback) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      this.listeners.set(
        eventType,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  publish(event: SimEvent) {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }
}

// Export singleton instance
export const systemEventBus = new EventBus();
