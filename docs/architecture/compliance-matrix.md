# Compliance Matrix

## Purpose
Maps hackathon constraints to architectural choices.

| Constraint | Architectural Decision | Reason |
|------------|------------------------|--------|
| **Zero-Pipeline Processing** | NetworkX In-Memory Graph | Eliminates offline batch processing and heavy database syncing. Modifies graph state directly in RAM. |
| **Sub-Second Recalculation** | Event-Driven / WebSockets | Eliminates polling latency. Selective A* recalculation ensures instant math. |
| **No Commercial Map APIs** | MapLibre GL & OSM GeoJSON | 100% open-source stack. No rate limits, no proprietary routing algorithms. |
