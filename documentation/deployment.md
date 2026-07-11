# Deployment Guide

Deluge V2 is architected for straightforward deployment using containerization and standard cloud-native practices.

## Local Development

For active development and debugging, run the frontend and backend directly on your host machine.

### Backend
1. Navigate to `backend/`.
2. Activate your virtual environment: `.\venv\Scripts\Activate.ps1` (Windows) or `source venv/bin/activate` (Unix).
3. Install dependencies: `pip install -r requirements.txt`.
4. Run FastAPI: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.

### Frontend
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Start the Next.js development server: `npm run dev`.
4. Access the platform at `http://localhost:3000`.

## Docker (Planned)

We intend to provide a `docker-compose.yml` for zero-configuration deployments.

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```
*(Status: 🚧 In Progress)*

## Production Deployment

### Backend
Deploy the FastAPI backend to any ASGI-compatible server (e.g., Uvicorn + Gunicorn). Ensure WebSockets are supported by your reverse proxy (Nginx or Traefik) and that connection timeouts are configured appropriately for long-lived Live Digital Twin sessions.

### Frontend
Deploy the Next.js frontend to Vercel, AWS Amplify, or a standard Node.js server. Configure the `NEXT_PUBLIC_WS_URL` environment variable to point to your production backend.
