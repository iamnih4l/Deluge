# System Architecture

## Purpose
This document provides a high-level overview of the Deluge platform, illustrating how components interact to deliver sub-second routing updates during a flood disaster.

## High-Level Architecture Diagram

```text
+-----------------------+      +-----------------------------------------+      +-----------------------+
|  External Sources     |      |          Deluge Backend (FastAPI)       |      |  Frontend Command     |
|                       |      |                                         |      |  Center (Next.js)     |
|  +-----------------+  |      |  +----------------+  +---------------+  |      |                       |
|  | Flood Simulator |------>  |  | Event Processor|  | Safe Zone Eng |  |      |  +-----------------+  |
|  +-----------------+  |      |  +-------+--------+  +-------+-------+  |      |  | MapLibre UI     |  |
|                       |      |          |                   ^          |      |  +-----------------+  |
|  +-----------------+  |      |          v                   |          |      |          ^            |
|  | Weather Feed    |------>  |  +---------------------------+-------+  |      |          |            |
|  +-----------------+  |      |  |     In-Memory Road Graph          |  +--------> +----+----+----+    |
|                       |      |  |     (NetworkX Engine)             |  |      |  | WebSocket Msg|    |
+-----------------------+      |  +---------------------------+-------+  |      |  +----+----+----+    |
                               |          |                   |          |      |          |            |
                               |          v                   v          |      |          v            |
                               |  +----------------+  +---------------+  |      |  +-----------------+  |
                               |  | Routing Engine |  | Mission Mgr   |  |      |  | Mission & AI    |  |
                               |  +-------+--------+  +-------+-------+  |      |  | Dashboard       |  |
                               |          |                   |          |      |  +-----------------+  |
                               |          +-------+   +-------+          |      |                       |
                               |                  v   v                  |      |                       |
                               |            +---------------+            |      |                       |
                               |            | WebSocket Svr |------------+----->|                       |
                               |            +---------------+            |      |                       |
                               +-----------------------------------------+      +-----------------------+
```

## Data Flow Summary
1. The **Event Processor** receives real-time flood data.
2. It directly mutates the **In-Memory Road Graph**, altering edge weights (risk/travel time).
3. The **Routing Engine** recalculates paths for active missions.
4. The **Safe Zone Engine** re-evaluates shelter viability based on graph connectivity.
5. The **WebSocket Server** pushes delta updates to the **Frontend Command Center** for instant visual reflection.
