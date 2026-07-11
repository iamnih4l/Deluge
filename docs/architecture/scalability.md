# Future Scalability

## Purpose
How the architecture evolves from a hackathon MVP to a statewide deployment.

## Next Steps
1. **Graph Sharding**: NetworkX in-memory works for a city. For a state, we would shard the graph geographically across multiple Redis instances or use a distributed graph database like Neo4j.
2. **Message Broker**: Introduce Kafka or RabbitMQ between the Event Ingestion layer and the Graph Engine to handle thousands of concurrent IoT river gauge readings.
3. **Stateless WebSockets**: Move WebSocket state to a Redis Pub/Sub backplane, allowing the FastAPI backend to scale horizontally behind a load balancer.
