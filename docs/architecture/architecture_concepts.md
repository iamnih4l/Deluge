# Deluge: Core Concepts & Architectural Decisions

This document explains the fundamental concepts, topics, and technical choices that power the Deluge platform. The primary goal of Deluge is to provide **sub-second, real-time routing updates** for emergency responders during rapidly changing flood scenarios.

---

## 1. Core Architectural Concepts

### Event-Driven Architecture (EDA)
- **What it is**: A design pattern where system components react to "events" (changes in state) rather than polling a database constantly.
- **Why we use it**: Flood data changes unpredictably. When a road floods, the backend immediately emits a "Flood Event". EDA allows us to push this event instantly to connected clients via WebSockets, ensuring zero delay between a real-world change and a UI update.

### In-Memory Graph Processing
- **What it is**: Storing the entire network of roads and intersections in the server's RAM (Memory) rather than relying on a traditional database (like PostgreSQL/PostGIS) for every calculation.
- **Why we use it**: Reading from disk or waiting on database queries introduces latency. By keeping the graph in-memory using `NetworkX`, we can instantly update the "weight" (travel time/risk) of a flooded road and run a shortest-path algorithm in a fraction of a second. This directly satisfies our "Zero-Pipeline Processing" hackathon constraint.

### Deterministic Routing vs. AI Routing
- **What it is**: Deterministic algorithms (like Dijkstra's or A*) always produce the exact same, mathematically optimal route given the same graph weights. AI routing relies on neural networks to "guess" or generate routes.
- **Why we use it**: In emergencies, predictability is a matter of life and death. We cannot afford an AI "hallucinating" a non-existent road or making an unpredictable choice. AI is strictly relegated to *explaining* situations (the Recommendation Card) while mathematics handles the actual routing.

### Data-Driven Styling (Map)
- **What it is**: Instead of telling the map "draw a red line here", we give the map a set of data properties (e.g., `risk_score: 100`) and the map automatically styles the road red based on predefined rules.
- **Why we use it**: It allows the frontend to process massive amounts of vector data efficiently without dropping frames. When WebSockets push delta updates, we only update the local state property, and the map repaints itself instantly.

---

## 2. Technology Stack & Justifications

### Backend: FastAPI (Python)
- **Why**: Python has the best ecosystem for data processing and graph mathematics (NetworkX). FastAPI provides native support for asynchronous programming (`asyncio`) and WebSockets, making it incredibly fast for concurrent, event-driven streaming compared to traditional synchronous frameworks like Flask or Django.

### Graph Engine: NetworkX
- **Why**: It is the industry standard for complex network analysis in Python. It provides battle-tested algorithms for shortest-path finding (A*, Dijkstra) and allows for dynamic, real-time modification of edge attributes (e.g., dynamically changing a road's travel time to infinity if flooded).

### Frontend: Next.js & React
- **Why**: Next.js provides a robust, scalable structure for the frontend. React's component-based architecture aligns perfectly with our "Mission Panel", "Map Area", and "AI Card" layout, keeping the codebase modular and clean.

### Mapping: MapLibre GL JS & OpenStreetMap (OSM)
- **Why**: The hackathon strictly forbids commercial map APIs (like Google Maps or Mapbox). MapLibre GL is a powerful open-source vector tile renderer. Combined with free OSM data, we can render 60fps interactive maps completely independently of commercial rate limits or paywalls.

### State Management: Zustand & React Query
- **Why Zustand**: We need a global state (to track active missions and map states) that is extremely fast. Redux is too heavy and requires too much boilerplate for an MVP. Zustand is minimal and prevents unnecessary re-renders.
- **Why React Query**: Excellent for caching and handling initial, asynchronous data fetches (like downloading the initial road graph when the app first loads).

### Styling: Tailwind CSS & shadcn/ui
- **Why**: Writing raw CSS is slow. Tailwind allows for rapid prototyping of our specific "EOC Dark Mode" aesthetic directly in the markup. `shadcn/ui` provides accessible, unstyled components (like cards and buttons) that we can easily mold into our professional, calm UI without looking like a generic Bootstrap site.

---

## 3. UI/UX Philosophy Choices

### "Calm Under Chaos"
Emergency Operations Centers (EOCs) are highly stressful. Bright colors, excessive animations, and cluttered dashboards increase operator anxiety. We use a dark theme with high contrast and limit the use of Red/Amber *only* to critical alerts.

### Progressive Disclosure
Instead of showing every piece of data about a rescue unit (driver name, fuel level, vehicle type, exact coordinates) on the main screen, we show only their priority and ETA. Extra details are only fetched and displayed if the operator specifically clicks on the unit. This minimizes cognitive overload.
