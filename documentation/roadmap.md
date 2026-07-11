# Future Roadmap

Deluge is continuously evolving. The following features represent our strategic vision for transforming Deluge into a nationwide emergency response standard.

## 🚧 In Progress
- **PostgreSQL/PostGIS Integration**: Moving from an in-memory graph to a persistent geospatial database to support region-wide routing.
- **Dockerization**: Providing turn-key `docker-compose` setups for immediate deployment.

## 📅 Planned

### Core Engine
- **Satellite Integration**: Ingesting live SAR (Synthetic Aperture Radar) data via Sentinel-1 to dynamically map floods in real-time, removing the reliance on historical or interpolated data.
- **Offline Routing**: Providing offline-capable routing for mobile units when cellular networks are compromised.
- **AI Prediction Models**: Utilizing machine learning to predict flood propagation over 6, 12, and 24-hour windows.

### Integrations
- **Live Government Data**: Hooking into NDMA/FEMA APIs for real-time alerts and weather intelligence.
- **IoT Flood Sensors**: Direct integration with smart-city water level sensors for hyper-local accuracy.

### Interfaces
- **Citizen Application**: A read-only mobile view for civilians to view safe zones and evacuation routes.
- **Mobile Responder App**: A ruggedized tablet application for first responders to receive mission dispatches and turn-by-turn navigation directly from the Command Center.
