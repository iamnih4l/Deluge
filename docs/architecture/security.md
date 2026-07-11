# Security Considerations

## Purpose
Baseline security measures appropriate for the MVP scope.

## API Protection
- The `/api/v1/simulate/flood` endpoint requires a basic API key to prevent unauthorized spoofing of disaster events.
- WebSocket connections require an authentication token passed in the initial handshake query parameter.

*Note: For the hackathon MVP, deep role-based access control (RBAC) is out of scope to prioritize core functionality.*
