import networkx as nx
import math
from typing import List
from app.schemas.simulation import RoadSegment, LngLat

class RoutingEngine:
    def __init__(self):
        self.G = nx.Graph()
        
    def build_graph_from_roads(self, roads: List[RoadSegment]):
        self.G.clear()
        
        # Add nodes and edges
        for road in roads:
            if not road.path:
                continue
                
            for i in range(len(road.path) - 1):
                p1 = road.path[i]
                p2 = road.path[i+1]
                
                # Use coordinates as node identifiers (tuple)
                self.G.add_node(p1, pos=p1)
                self.G.add_node(p2, pos=p2)
                
                # Calculate distance (approximate meters)
                d_lng = (p2[0] - p1[0]) / 0.0000135
                d_lat = (p2[1] - p1[1]) / 0.000009
                dist = math.sqrt(d_lng**2 + d_lat**2)
                
                # Base weight is distance. Capacity modulates this.
                weight = dist / max(road.capacity, 0.001)
                if road.status in ('flooded', 'blocked'):
                    weight = float('inf') # impassable
                    
                self.G.add_edge(p1, p2, weight=weight, road_id=road.id, distance=dist)
                
    def get_shortest_path(self, start: LngLat, end: LngLat) -> List[LngLat]:
        """
        Finds the shortest path from start to end using the road network.
        If start/end are not exact nodes in the graph, we find the closest nodes.
        """
        if not self.G.nodes:
            return []
            
        def find_closest_node(pt: LngLat) -> LngLat:
            closest = None
            min_dist = float('inf')
            for node in self.G.nodes:
                d_lng = (node[0] - pt[0]) / 0.0000135
                d_lat = (node[1] - pt[1]) / 0.000009
                dist = d_lng**2 + d_lat**2
                if dist < min_dist:
                    min_dist = dist
                    closest = node
            return closest

        start_node = find_closest_node(start)
        end_node = find_closest_node(end)
        
        if not start_node or not end_node:
            return []
            
        try:
            path = nx.shortest_path(self.G, source=start_node, target=end_node, weight='weight')
            # If path exists but the first/last nodes are far from the actual start/end, 
            # we might append the actual start/end, but for now we just return the graph path.
            
            # To smooth it out and simulate vehicle movement, we can just return the raw nodes
            # If it's a single node, duplicate it to provide a valid route
            if len(path) == 1:
                path.append(path[0])
            return path
        except nx.NetworkXNoPath:
            return []

routing_engine = RoutingEngine()
