from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict

import networkx as nx

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def normalize_to_100(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 50.0
    return max(0.0, min(100.0, ((value - min_value) / (max_value - min_value)) * 100.0))


def _historical_counts() -> Dict[int, float]:
    counts: Dict[int, float] = {}
    with (DATA / "disruptions.csv").open(newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            port_id = int(row["port_id"])
            counts[port_id] = counts.get(port_id, 0.0) + float(row["severity"])
    return counts


def compute_all_historical_scores(graph: nx.DiGraph, centrality: Dict[int, dict]) -> Dict[int, dict]:
    disruption = _historical_counts()
    bet_values = [centrality[n]["betweenness"] for n in graph.nodes]
    degree_values = [centrality[n]["degree"] for n in graph.nodes]
    util_values = [graph.nodes[n]["baseline_load_teu"] / graph.nodes[n]["capacity_teu"] for n in graph.nodes]
    hist_values = [disruption.get(n, 0.0) for n in graph.nodes]
    scores = {}

    for node_id in graph.nodes:
        util = graph.nodes[node_id]["baseline_load_teu"] / graph.nodes[node_id]["capacity_teu"]
        components = {
            "betweenness_norm": normalize_to_100(
                centrality[node_id]["betweenness"], min(bet_values), max(bet_values)
            ),
            "capacity_utilization_norm": normalize_to_100(util, min(util_values), max(util_values)),
            "historical_disruption_norm": normalize_to_100(
                disruption.get(node_id, 0.0), min(hist_values), max(hist_values)
            ),
            "degree_norm": normalize_to_100(centrality[node_id]["degree"], min(degree_values), max(degree_values)),
        }
        risk_score = (
            0.4 * components["betweenness_norm"]
            + 0.3 * components["capacity_utilization_norm"]
            + 0.2 * components["historical_disruption_norm"]
            + 0.1 * components["degree_norm"]
        )
        scores[node_id] = {"risk_score": round(risk_score, 2), "feature_breakdown": components}

    ranked = sorted(scores, key=lambda n: scores[n]["risk_score"], reverse=True)
    for rank, node_id in enumerate(ranked, start=1):
        scores[node_id]["criticality_rank"] = rank
        scores[node_id]["port_name"] = graph.nodes[node_id]["name"]
    return scores


def risk_for_port(graph: nx.DiGraph, hist_scores: Dict[int, dict], port_name: str) -> dict:
    for node_id, data in graph.nodes(data=True):
        if data["name"].lower() == port_name.lower():
            return hist_scores[node_id]
    raise KeyError(port_name)
