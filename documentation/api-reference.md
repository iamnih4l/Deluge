# API Reference

Deluge V2 is designed around an event-driven architecture utilizing WebSockets for real-time state synchronization. As such, the REST API surface is intentionally minimal, reserved solely for health checks and deployment verification.

## Core Endpoints

### Health Check

**Method:** `GET`  
**Endpoint:** `/`  
**Purpose:** Verifies that the FastAPI server is running and the in-memory backend is operational.

**Parameters:** None

**Response:**
```json
{
  "status": "operational",
  "system": "Deluge In-Memory Backend"
}
```

**Authentication:** None required.

---

> [!NOTE]
> For all core operational data (vehicle routing, mission dispatching, and flood mapping), refer to the [WebSocket Events](file:///c:/Users/nihal/OneDrive/Desktop/Deluge/documentation/websocket-events.md) documentation.
