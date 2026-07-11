# Coding Standards

To ensure Deluge remains a production-grade, maintainable codebase, we enforce strict coding standards.

## Frontend (React/Next.js)

- **Language**: TypeScript strictly. Avoid `any`.
- **Styling**: Vanilla CSS Modules (e.g., `Component.module.css`) or inline React styling for high-performance components. Do not introduce TailwindCSS unless explicitly approved.
- **State**: Use `Zustand` for all global state. Never use React Context for rapidly changing data (like WebSocket streams) to avoid render thrashing.
- **Components**: Adhere to the Single Responsibility Principle. Keep files under 300 lines where possible.
- **Aesthetics**: The UI must maintain the "Mission Control" EOC aesthetic. Avoid gamification or "simulation" tropes.

## Backend (Python/FastAPI)

- **Language**: Python 3.10+.
- **Typing**: Use comprehensive type hints (`typing` module) for all function arguments and returns.
- **Data Validation**: Use `Pydantic` models for all API and WebSocket payloads.
- **Concurrency**: Use `asyncio` appropriately. Do not block the main FastAPI event loop with heavy synchronous tasks (like Graph pathfinding) without using `asyncio.to_thread`.
- **Documentation**: All public functions and classes must have concise docstrings.
