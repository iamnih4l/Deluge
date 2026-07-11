# WebSocket Events

The primary communication channel between the Next.js frontend and the FastAPI backend is a persistent WebSocket connection. This ensures low-latency synchronization of the Live Digital Twin state.

## Server-to-Client Events (Broadcasts)

### `FULL_STATE`
Emitted immediately upon a client connecting. Contains the entire system state, allowing the frontend to hydrate its store from scratch.
```json
{
  "type": "FULL_STATE",
  "payload": {
    "time": 0,
    "severity": "elevated",
    "vehicles": [...],
    "floodCells": [...],
    "infrastructure": [...],
    "roads": [...],
    "shelters": [...],
    "alerts": [...]
  }
}
```

### `TICK`
Emitted roughly 10 times per second while the replay engine is running. Contains the delta or full state (depending on backend optimization) of the current simulation frame.
```json
{
  "type": "TICK",
  "payload": {
    "time": 1.2,
    "vehicles": [...updated positions...],
    // ...other state arrays
  }
}
```

## Client-to-Server Events (Commands)

The frontend dispatches commands to alter the system state or control the replay engine.

### `toggle_simulation`
Pauses or resumes the replay engine tick loop.
```json
{ "action": "toggle_simulation" }
```

### `reset`
Resets the historical replay to time $t=0$.
```json
{ "action": "reset" }
```

### `set_speed`
Modifies the multiplier of the replay engine.
```json
{ "action": "set_speed", "speed": 4.0 }
```

### `seek`
Jumps the replay engine to a specific timestamp.
```json
{ "action": "seek", "time": 150.5 }
```
