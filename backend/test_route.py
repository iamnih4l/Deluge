import os
import networkx as nx
from app.simulation.routing_engine import RoutingEngine

engine = RoutingEngine()
origin = (76.3142, 10.0246)
destination = (76.3090, 10.0150)

res = engine.plan_route(origin, destination)
print(f"Path length: {len(res['route'])}")
if len(res['route']) <= 2:
    print(res)
    
print("Testing undirected fallback...")
try:
    orig_node = list(engine.operational_graph.nodes())[0]
    dest_node = list(engine.operational_graph.nodes())[-1]
    
    edges_to_remove = list(engine.operational_graph.out_edges(orig_node))
    engine.operational_graph.remove_edges_from(edges_to_remove)
    print("Removed edges out of origin.")
    
    orig_coord = (engine.operational_graph.nodes[orig_node]['x'], engine.operational_graph.nodes[orig_node]['y'])
    dest_coord = (engine.operational_graph.nodes[dest_node]['x'], engine.operational_graph.nodes[dest_node]['y'])
    
    res = engine.plan_route(orig_coord, dest_coord)
    print(f"Fallback path length: {len(res['route'])}")
    if len(res['route']) <= 2:
        print("FALLBACK IS JUST A STRAIGHT LINE!")
        print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
