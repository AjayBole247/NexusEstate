import networkx as nx
from typing import List, Dict, Any

def detect_swap_cycles(swap_requests: List[Dict[str, Any]]) -> List[List[int]]:
    """
    Detects 3-way and 4-way directed cycles in the lease arbitrage network.
    
    Nodes are User IDs.
    A directed edge U1 -> U2 exists if U2 currently holds a property in the 
    city that U1 desires, AND their availability dates overlap (assumed 
    pre-filtered by the PostgreSQL GiST index query before passing here).
    
    Args:
        swap_requests: A list of dicts. Example:
        [
            {"id": 1, "user_id": 101, "current_city": "NY", "desired_city": "SF"},
            {"id": 2, "user_id": 102, "current_city": "SF", "desired_city": "LA"},
            {"id": 3, "user_id": 103, "current_city": "LA", "desired_city": "NY"}
        ]
        
    Returns:
        List of cycles, where each cycle is a list of swap_request IDs forming the cycle.
    """
    G = nx.DiGraph()
    
    # 1. Map users/requests by current city for quick edge building
    # (Assuming one active request per user for simplicity, we map city to requests)
    city_to_requests = {}
    for req in swap_requests:
        city = req["current_city"]
        if city not in city_to_requests:
            city_to_requests[city] = []
        city_to_requests[city].append(req)
        
        # Add node for the request (we use request ID as the node to track exactly which request is fulfilled)
        G.add_node(req["id"], **req)

    # 2. Build Directed Edges
    # Edge from Req A to Req B if Req A desires Req B's current city
    for req_a in swap_requests:
        desired = req_a["desired_city"]
        if desired in city_to_requests:
            for req_b in city_to_requests[desired]:
                if req_a["id"] != req_b["id"]:
                    G.add_edge(req_a["id"], req_b["id"])

    # 3. Find simple cycles (recursive DFS approach built into networkx)
    cycles = list(nx.simple_cycles(G))
    
    valid_cycles = []
    for cycle in cycles:
        # We only want 3-way or 4-way cycles as per requirements
        if 2 <= len(cycle) <= 4:
            valid_cycles.append(cycle)

    return valid_cycles
