# Development Guide

Welcome to the Deluge development team. This guide covers the local development workflow.

## Prerequisites
- Node.js v18+
- Python 3.10+
- Git

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/deluge.git
   cd deluge
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
   *Note: On first boot, the backend will download OpenStreetMap data to build the `osm_graph_cache.graphml`. This may take 30-60 seconds.*

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Stack

Open two terminals:

**Terminal 1 (Backend)**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000`.

## Architecture Overview
Familiarize yourself with the system by reading the [System Overview](file:///c:/Users/nihal/OneDrive/Desktop/Deluge/documentation/architecture/system-overview.md).
