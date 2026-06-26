from __future__ import annotations

from collections import deque
from typing import Dict, List, Tuple

import networkx as nx

MAX_HOPS = 10
MIN_OVERFLOW = 50.0
CAPACITY_TOLERANCE = 1.20


def _status_for(overload_ratio: float) -> str:
    if overload_ratio >= CAPACITY_TOLERANCE:
        return "congested"
    if overload_ratio > 1.0:
        return "at_risk"
    return "normal"


def run_cascade(base_graph: nx.DiGraph, port_name: str, capacity_drop: float) -> dict:
    graph = base_graph.copy()
    start_id = None
    for node_id, data in graph.nodes(data=True):
        if data["name"].lower() == port_name.lower():
            start_id = node_id
            break
    if start_id is None:
        raise KeyError(port_name)

    current_loads: Dict[int, float] = {n: float(graph.nodes[n]["current_load"]) for n in graph.nodes}
    capacity_limits: Dict[int, float] = {n: float(graph.nodes[n]["capacity_teu"]) for n in graph.nodes}
    capacity_limits[start_id] = capacity_limits[start_id] * max(0.0, (100.0 - float(capacity_drop)) / 100.0)

    queue: deque[Tuple[int, float, int]] = deque()
    initial_overflow = max(0.0, current_loads[start_id] - capacity_limits[start_id])
    queue.append((start_id, initial_overflow, 0))
    impacted: set[int] = set()
    impacted_order: List[int] = []
    transitions: List[dict] = []
    total_delay_days = 0.0
    stranded = 0.0

    while queue:
        node_id, overflow, hop = queue.popleft()
        if hop > MAX_HOPS:
            stranded += max(0.0, overflow)
            continue
        if overflow < MIN_OVERFLOW:
            stranded += max(0.0, overflow)
            continue
        if node_id in impacted and node_id != start_id:
            continue

        impacted.add(node_id)
        impacted_order.append(node_id)
        stranded += overflow
        total_delay_days += overflow / max(float(graph.nodes[node_id]["capacity_teu"]) / 30.0, 1.0)
        transitions.append(
            {
                "port_id": node_id,
                "port_name": graph.nodes[node_id]["name"],
                "transition": "congested" if hop == 0 or overflow >= capacity_limits[node_id] * 0.2 else "at_risk",
                "hop": hop,
            }
        )

        successors = [s for s in graph.successors(node_id) if s not in impacted]
        if not successors or hop == MAX_HOPS:
            continue

        weights = []
        for successor in successors:
            edge = graph.edges[node_id, successor]
            weights.append((successor, float(edge["traffic_volume"]) / max(float(edge["distance_nm"]), 1.0)))
        total_weight = sum(weight for _, weight in weights) or 1.0
        transferable = overflow * 0.68

        for successor, weight in weights:
            received = transferable * (weight / total_weight)
            current_loads[successor] += received
            successor_overflow = max(0.0, current_loads[successor] - capacity_limits[successor])
            pressure = successor_overflow if successor_overflow >= MIN_OVERFLOW else received
            if pressure >= MIN_OVERFLOW:
                queue.append((successor, pressure, hop + 1))

    node_states = []
    for node_id in graph.nodes:
        overflow = max(0.0, current_loads[node_id] - capacity_limits[node_id])
        status = "congested" if node_id in impacted else _status_for(current_loads[node_id] / max(capacity_limits[node_id], 1.0))
        node_states.append(
            {
                "port_id": node_id,
                "port_name": graph.nodes[node_id]["name"],
                "status": status,
                "current_load": round(current_loads[node_id], 2),
                "capacity_limit": round(capacity_limits[node_id], 2),
                "overflow": round(overflow, 2),
            }
        )

    return {
        "simulation_id": None,
        "cascade_size": len(impacted),
        "impacted_ports": [graph.nodes[n]["name"] for n in impacted_order],
        "stranded_cargo_teu": round(stranded, 2),
        "total_delay_days": round(total_delay_days, 2),
        "node_states": node_states,
        "state_transitions": sorted(transitions, key=lambda item: (item["hop"], item["port_id"])),
    }
