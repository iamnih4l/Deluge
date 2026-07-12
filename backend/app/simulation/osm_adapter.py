import os
import osmnx as ox
import networkx as nx
import logging

logger = logging.getLogger(__name__)

# Ernakulam / Edappally approximate center
CENTER_LAT = 10.0261
CENTER_LON = 76.3125
RADIUS_METERS = 25000

CACHE_FILE = "osm_graph_cache.graphml"

def get_osm_graph() -> nx.MultiDiGraph:
    """
    Downloads or loads from cache the OSM road network for the operational area.
    """
    if os.path.exists(CACHE_FILE):
        logger.info(f"Loading OSM graph from cache: {CACHE_FILE}")
        G = ox.load_graphml(CACHE_FILE)
        return G

    logger.info(f"Downloading OSM graph for Center: ({CENTER_LAT}, {CENTER_LON}), Radius: {RADIUS_METERS}m")
    
    # Download the drive network (roads for vehicles)
    G = ox.graph_from_point(
        (CENTER_LAT, CENTER_LON), 
        dist=RADIUS_METERS, 
        network_type="drive", 
        simplify=True
    )
    
    # Cache it for future fast loads
    ox.save_graphml(G, CACHE_FILE)
    logger.info("OSM graph downloaded and cached successfully.")
    
    return G

def extract_road_segments(G: nx.MultiDiGraph) -> list:
    """
    Converts networkx edges into our internal RoadSegment schema list.
    """
    from app.schemas.simulation import RoadSegment
    roads = []
    
    for u, v, key, data in G.edges(keys=True, data=True):
        # Default fallback name
        name = data.get('name', 'Unnamed Road')
        if isinstance(name, list):
            name = name[0] # Sometimes OSM returns a list of names
            
        edge_id = f"{u}-{v}-{key}"
        
        path = []
        if 'geometry' in data:
            geom = data['geometry']
            if isinstance(geom, str):
                import shapely.wkt
                geom = shapely.wkt.loads(geom)
            path = [(lon, lat) for lon, lat in geom.coords]
        else:
            node_u = G.nodes[u]
            node_v = G.nodes[v]
            path = [(node_u['x'], node_u['y']), (node_v['x'], node_v['y'])]
            
        roads.append(
            RoadSegment(
                id=edge_id,
                name=name,
                path=path,
                status='open',
                floodTime=-1.0,
                capacity=1.0
            )
        )
        
    return roads

def extract_safe_zones() -> list:
    """
    Mock implementation for safe zones until we fetch OSM amenities (hospitals/shelters)
    """
    from app.schemas.simulation import Shelter, Infrastructure
    
    # We will just place a few known coordinates near the center
    return [
        Shelter(
            id='shelter-edappally-school',
            name='Edappally Govt School',
            position=(76.3150, 10.0280),
            capacity=500,
            currentOccupancy=50,
            status='operational',
            intakeRate=50,
            accessible=True
        ),
        Shelter(
            id='shelter-kaloor-stadium',
            name='Kaloor Stadium Relief Camp',
            position=(76.3000, 9.9950),
            capacity=5000,
            currentOccupancy=1200,
            status='operational',
            intakeRate=150,
            accessible=True
        )
    ]

def extract_infrastructure() -> list:
    from app.schemas.simulation import Infrastructure
    return [
        Infrastructure(
            id='infra-hospital-aster',
            name='Aster Medcity',
            type='hospital',
            position=(76.2750, 10.0450),
            status='operational',
            detail='Critical care operational'
        ),
        Infrastructure(
            id='infra-hospital-renai',
            name='Renai Medicity',
            type='hospital',
            position=(76.3100, 10.0150),
            status='operational',
            detail='Power backup active'
        )
    ]
