from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict

import networkx as nx

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def build_graph() -> nx.DiGraph:
    graph = nx.DiGraph()
    with (DATA / "ports.csv").open(newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            port_id = int(row["id"])
            baseline = float(row["baseline_load_teu"])
            graph.add_node(
                port_id,
                id=port_id,
                name=row["name"],
                capacity_teu=float(row["capacity_teu"]),
                baseline_load_teu=baseline,
                current_load=baseline,
                lat=float(row["lat"]),
                lon=float(row["lon"]),
            )

    with (DATA / "routes.csv").open(newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            traffic = float(row["traffic_volume"])
            distance = max(float(row["distance_nm"]), 1.0)
            graph.add_edge(
                int(row["source_port"]),
                int(row["destination_port"]),
                traffic_volume=traffic,
                distance_nm=distance,
                weight=distance / max(traffic, 1.0),
            )
    return graph


def precompute_centrality(graph: nx.DiGraph) -> Dict[int, dict]:
    betweenness = nx.betweenness_centrality(graph, weight="weight", normalized=True)
    degree = nx.degree_centrality(graph)
    for node_id in graph.nodes:
        graph.nodes[node_id]["betweenness"] = betweenness.get(node_id, 0.0)
        graph.nodes[node_id]["degree"] = degree.get(node_id, 0.0)
    return {
        node_id: {
            "betweenness": betweenness.get(node_id, 0.0),
            "degree": degree.get(node_id, 0.0),
        }
        for node_id in graph.nodes
    }
