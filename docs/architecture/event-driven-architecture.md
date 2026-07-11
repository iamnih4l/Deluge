# Event-Driven Architecture

## Purpose
Explains the shift from polling to streaming for critical updates.

## Why EDA?
In a traditional REST architecture, the frontend would poll `/api/v1/status` every 5 seconds. If a flood occurs at second 1, the operator doesn't see it until second 5. In an EOC, a 4-second delay means a rescue unit might turn down a flooded street.

By using an Event-Driven Architecture with WebSockets, the backend acts as a Push system. A flood event directly triggers a cascade: Graph Update -> Route Calculation -> WS Broadcast. The UI updates in milliseconds.
