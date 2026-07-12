import networkx as nx
import logging
from typing import List, Tuple
from app.simulation.osm_adapter import get_osm_graph
from app.schemas.simulation import RoadSegment

logger = logging.getLogger(__name__)

class RoutingEngine:
    def __init__(self):
        # The base OSM graph
        self.base_graph: nx.MultiDiGraph = get_osm_graph()
        # The operational graph with modified weights
        self.operational_graph: nx.MultiDiGraph = self.base_graph.copy()
        
    def apply_road_closure(self, road_name_contains: str):
        """
        Heuristically finds edges with names containing the string and massively increases their weight.
        """
        for u, v, key, data in self.operational_graph.edges(keys=True, data=True):
            name = data.get('name', '')
            if isinstance(name, list):
                name = name[0]
            if road_name_contains.lower() in name.lower():
                # Make it effectively impassable
                data['weight'] = 999999
                logger.info(f"RoutingEngine: Marked {name} as closed.")

    def update_edge_weights(self, roads: List[RoadSegment]):
        """
        Dynamically updates the operational graph edge weights based on real-time road statuses.
        Flooded or blocked roads receive infinite weight.
        """
        for road in roads:
            try:
                parts = road.id.split('-')
                if len(parts) >= 3:
                    u_str, v_str = parts[0], parts[1]
                    u_int, v_int = int(u_str), int(v_str)
                    key = int(parts[2])
                    
                    # Check both int and string since graphml loading converts ints to strings in older networkx/osmnx
                    if self.operational_graph.has_edge(u_int, v_int, key):
                        u, v = u_int, v_int
                    elif self.operational_graph.has_edge(u_str, v_str, key):
                        u, v = u_str, v_str
                    else:
                        continue

                    if road.status in ('flooded', 'blocked', 'closed', 'at_risk'):
                        self.operational_graph[u][v][key]['weight'] = 999999
                    else:
                        # restore original weight based on length
                        length = self.operational_graph[u][v][key].get('length', 1.0)
                        if isinstance(length, list): length = length[0]
                        self.operational_graph[u][v][key]['weight'] = float(length)
            except Exception as e:
                logger.error(f"Failed to update weight for {road.id}: {e}")


    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float], profile: str = 'ambulance') -> List[Tuple[float, float]]:
        """
        Calculates the shortest path using the operational graph.
        Origin/destination are (lng, lat). Returns list of (lng, lat) tuples.
        """
        import osmnx as ox
        try:
            # osmnx.nearest_nodes expects (X=lng, Y=lat)
            orig_node = ox.distance.nearest_nodes(self.operational_graph, origin[0], origin[1])
            dest_node = ox.distance.nearest_nodes(self.operational_graph, destination[0], destination[1])
            
            route_nodes = nx.shortest_path(self.operational_graph, orig_node, dest_node, weight='weight')
            
            # Extract coordinates including edge geometry for accurate paths
            route_coords = []
            for i in range(len(route_nodes) - 1):
                u = route_nodes[i]
                v = route_nodes[i+1]
                edge_data = self.operational_graph.get_edge_data(u, v)
                if edge_data:
                    # Find the edge with minimum weight
                    min_weight_key = min(edge_data.keys(), key=lambda k: edge_data[k].get('weight', 999999))
                    data = edge_data[min_weight_key]
                    
                    if 'geometry' in data:
                        # Append all but the last point to avoid duplicates
                        geom = data['geometry']
                        if isinstance(geom, str):
                            import shapely.wkt
                            geom = shapely.wkt.loads(geom)
                        coords = [(lon, lat) for lon, lat in geom.coords]
                        route_coords.extend(coords[:-1])
                    else:
                        u_data = self.operational_graph.nodes[u]
                        route_coords.append((u_data['x'], u_data['y']))
                else:
                    u_data = self.operational_graph.nodes[u]
                    route_coords.append((u_data['x'], u_data['y']))
            
            if route_nodes:
                final_node = route_nodes[-1]
                final_node_data = self.operational_graph.nodes[final_node]
                route_coords.append((final_node_data['x'], final_node_data['y']))
                
            return route_coords
        except nx.NetworkXNoPath:
            try:
                # Fallback to undirected graph for emergency vehicles
                undirected_G = self.operational_graph.to_undirected()
                route_nodes = nx.shortest_path(undirected_G, orig_node, dest_node, weight='weight')
                
                route_coords = []
                for i in range(len(route_nodes) - 1):
                    u = route_nodes[i]
                    v = route_nodes[i+1]
                    # In undirected, edge might exist as (u,v) or (v,u) in original
                    edge_data = self.operational_graph.get_edge_data(u, v)
                    if not edge_data:
                        edge_data = self.operational_graph.get_edge_data(v, u)
                    
                    if edge_data:
                        min_weight_key = min(edge_data.keys(), key=lambda k: edge_data[k].get('weight', 999999))
                        data = edge_data[min_weight_key]
                        if 'geometry' in data:
                            coords = [(lon, lat) for lon, lat in data['geometry'].coords]
                            # If edge was (v,u), we need to reverse the coords
                            if not self.operational_graph.has_edge(u, v) and self.operational_graph.has_edge(v, u):
                                coords.reverse()
                            route_coords.extend(coords[:-1])
                        else:
                            u_data = self.operational_graph.nodes[u]
                            route_coords.append((u_data['x'], u_data['y']))
                    else:
                        u_data = self.operational_graph.nodes[u]
                        route_coords.append((u_data['x'], u_data['y']))
                
                if route_nodes:
                    final_node = route_nodes[-1]
                    final_node_data = self.operational_graph.nodes[final_node]
                    route_coords.append((final_node_data['x'], final_node_data['y']))
                
                return route_coords
            except Exception as inner_e:
                logger.warning(f"No path found even with undirected graph between {origin} and {destination}: {inner_e}")
                return []
        except Exception as e:
            import traceback
            logger.error(f"Routing error: {e}")
            return []

    def plan_route(self, origin, destination):
        """
        Similar to get_route but returns distance and snapped coordinates as well.
        """
        import osmnx as ox
        try:
            orig_node = ox.distance.nearest_nodes(self.operational_graph, origin[0], origin[1])
            dest_node = ox.distance.nearest_nodes(self.operational_graph, destination[0], destination[1])
            
            route_nodes = nx.shortest_path(self.operational_graph, orig_node, dest_node, weight='weight')
            
            # Extract coordinates including edge geometry for accurate paths
            route_coords = []
            for i in range(len(route_nodes) - 1):
                u = route_nodes[i]
                v = route_nodes[i+1]
                edge_data = self.operational_graph.get_edge_data(u, v)
                if edge_data:
                    min_weight_key = min(edge_data.keys(), key=lambda k: edge_data[k].get('weight', 999999))
                    data = edge_data[min_weight_key]
                    
                    if 'geometry' in data:
                        geom = data['geometry']
                        if isinstance(geom, str):
                            import shapely.wkt
                            geom = shapely.wkt.loads(geom)
                        coords = [(lon, lat) for lon, lat in geom.coords]
                        route_coords.extend(coords[:-1])
                    else:
                        u_data = self.operational_graph.nodes[u]
                        route_coords.append((u_data['x'], u_data['y']))
                else:
                    u_data = self.operational_graph.nodes[u]
                    route_coords.append((u_data['x'], u_data['y']))
                    
            if route_nodes:
                final_node = route_nodes[-1]
                final_node_data = self.operational_graph.nodes[final_node]
                route_coords.append((final_node_data['x'], final_node_data['y']))
                
            # Calculate approx distance in meters
            distance = 0
            for i in range(len(route_nodes) - 1):
                u = route_nodes[i]
                v = route_nodes[i+1]
                # Default edge length attribute from osmnx
                edge_data = self.operational_graph.get_edge_data(u, v)
                if edge_data and 0 in edge_data and 'length' in edge_data[0]:
                    distance += edge_data[0]['length']
                else:
                    # rough fallback
                    distance += 10
            
            return {
                "route": route_coords,
                "snapped_origin": route_coords[0] if route_coords else origin,
                "snapped_destination": route_coords[-1] if route_coords else destination,
                "distance": distance
            }
        except nx.NetworkXNoPath:
            try:
                # Fallback to undirected graph for emergency vehicles
                undirected_G = self.operational_graph.to_undirected()
                route_nodes = nx.shortest_path(undirected_G, orig_node, dest_node, weight='weight')
                
                route_coords = []
                for i in range(len(route_nodes) - 1):
                    u = route_nodes[i]
                    v = route_nodes[i+1]
                    # In undirected, edge might exist as (u,v) or (v,u) in original
                    edge_data = self.operational_graph.get_edge_data(u, v)
                    if not edge_data:
                        edge_data = self.operational_graph.get_edge_data(v, u)
                    
                    if edge_data:
                        min_weight_key = min(edge_data.keys(), key=lambda k: edge_data[k].get('weight', 999999))
                        data = edge_data[min_weight_key]
                        if 'geometry' in data:
                            geom = data['geometry']
                            if isinstance(geom, str):
                                import shapely.wkt
                                geom = shapely.wkt.loads(geom)
                            coords = [(lon, lat) for lon, lat in geom.coords]
                            if not self.operational_graph.has_edge(u, v) and self.operational_graph.has_edge(v, u):
                                coords.reverse()
                            route_coords.extend(coords[:-1])
                        else:
                            u_data = self.operational_graph.nodes[u]
                            route_coords.append((u_data['x'], u_data['y']))
                    else:
                        u_data = self.operational_graph.nodes[u]
                        route_coords.append((u_data['x'], u_data['y']))
                        
                if route_nodes:
                    final_node = route_nodes[-1]
                    final_node_data = self.operational_graph.nodes[final_node]
                    route_coords.append((final_node_data['x'], final_node_data['y']))
                    
                distance = 0
                for i in range(len(route_nodes) - 1):
                    u = route_nodes[i]
                    v = route_nodes[i+1]
                    edge_data = self.operational_graph.get_edge_data(u, v)
                    if not edge_data:
                        edge_data = self.operational_graph.get_edge_data(v, u)
                    if edge_data and 0 in edge_data and 'length' in edge_data[0]:
                        distance += edge_data[0]['length']
                    else:
                        distance += 10
                
                return {
                    "route": route_coords,
                    "snapped_origin": route_coords[0] if route_coords else origin,
                    "snapped_destination": route_coords[-1] if route_coords else destination,
                    "distance": distance
                }
            except Exception as inner_e:
                logger.warning(f"No path found even with undirected graph in plan_route: {inner_e}")
                return None
        except Exception as e:
            logger.error(f"Routing plan error: {e}")
            return None
