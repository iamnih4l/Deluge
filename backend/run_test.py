import sys
import logging
logging.basicConfig(level=logging.DEBUG)

try:
    from app.simulation.routing_engine import RoutingEngine
    engine = RoutingEngine()
    
    print("Testing calculate_route:")
    origin = (76.3142, 10.0246)
    destination = (76.3090, 10.0150)
    
    res = engine.plan_route(origin, destination)
    print("Plan Route Length:", len(res['route']))
    
    route = engine.calculate_route(origin, destination)
    print("Calculate Route Length:", len(route))
    
    if len(route) <= 2:
        print("ROUTE IS JUST 2 POINTS!", route)
except Exception as e:
    import traceback
    traceback.print_exc()
