# Architecture Documentation

## Overview
Welcome to the Deluge Architecture Documentation. This directory contains the complete technical design for the Deluge platform, optimized for real-time flood intelligence, sub-second route recalculations, and zero-pipeline processing constraints.

## Document Index & Reading Order
New developers should read the documentation in the following order to build a mental model of the system:

### 1. Business & Stakeholder Strategy
- [Business Impact & Stakeholder Alignment](business-impact.md) - Maps engineering choices to EOC and FEMA logistics pain points.

### 2. High-Level Overviews
- [System Architecture](system-architecture.md) - The 10,000-foot view of Deluge.
- [Workflow](workflow.md) - Step-by-step trace of a flood event through the system.
- [Data Flow](data-flow.md) - How data transforms from ingestion to the UI.

### 3. Core Engines
- [Routing Engine](routing-engine.md) - In-memory graph processing and deterministic routing.
- [Safe Zone Engine](safe-zone-engine.md) - Dynamic scoring of evacuation shelters.
- [Event-Driven Architecture](event-driven-architecture.md) - Asynchronous state updates.

### 4. Application Layers
- [Backend Architecture](backend-architecture.md) - FastAPI and module breakdown.
- [Frontend Architecture](frontend-architecture.md) - Next.js, MapLibre, and UI components.
- [API Architecture](api-architecture.md) - REST and WebSocket contracts.
- [Component Architecture](component-architecture.md) - Responsibilities of all major modules.

### 5. Interactions
- [Sequence Diagram](sequence-diagram.md) - ASCII sequence of a standard event lifecycle.

### 6. Engineering Constraints & Strategy
- [Design Decisions](design-decisions.md) - Architectural trade-offs and rationale.
- [Compliance Matrix](compliance-matrix.md) - How we satisfy strict hackathon constraints.
- [Performance Strategy](performance-strategy.md) - Maintaining sub-second latency.
- [Failure Handling](failure-handling.md) - Graceful degradation.
- [Security](security.md) - Authentication and endpoint protection.
- [Scalability](scalability.md) - Future path to production readiness.
