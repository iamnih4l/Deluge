# Security

As an Emergency Routing Platform handling critical operations data, security is paramount in Deluge.

## Current Implementations

1. **CORS Configuration**: The FastAPI backend restricts cross-origin requests. (Currently configured loosely for development via `allow_origins=["*"]`, but architected for strict domains in production).
2. **Input Validation**: All inbound WebSocket payloads and REST endpoints are strictly typed using Pydantic models to prevent injection and malformed data crashes.
3. **In-Memory Volatility**: Because the system operates entirely in-memory for the Live Digital Twin, sensitive operational snapshots are not written to persistent disk storage unencrypted.

## Planned Security Features (Roadmap)

- **Role-Based Access Control (RBAC)**: Implementing strict Operator vs. Observer roles via OAuth2 JWT tokens.
- **WSS Implementation**: Migrating from `ws://` to `wss://` (WebSocket Secure) with TLS termination at the reverse proxy.
- **Audit Logging**: Immutable logging of all mission dispatch events to an external secure sink for post-incident review.
