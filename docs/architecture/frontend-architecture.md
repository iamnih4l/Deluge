# Frontend Architecture

## Purpose
Details the Next.js React architecture optimized for a mission-critical command center.

## Core Philosophy
- **No Page Reloads**: The UI is a Single Page Application (SPA) dashboard.
- **Map-Centric**: The MapLibre instance takes up 80% of the viewport. Data panels float over the map.

## State Management
- **Zustand**: Manages the WebSocket connection state, active missions array, and UI toggle states (e.g., active panel).
- **MapLibre Internal State**: The map maintains the heavy GeoJSON geometries. We use `map.setFeatureState()` to update colors instantly based on WS events, entirely bypassing React's render cycle for map vectors to ensure 60fps performance.

## Component Hierarchy
```text
<DashboardLayout>
  <MapContainer />         <!-- WebGL Map Engine -->
  <OverlayPanels>
    <MissionList />        <!-- Active rescue units -->
    <RecommendationCard /> <!-- Async AI insights -->
  </OverlayPanels>
  <TimelineScrubber />     <!-- Event replay -->
</DashboardLayout>
```
