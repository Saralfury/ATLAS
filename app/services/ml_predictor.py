from __future__ import annotations

from typing import Dict

import pandas as pd

FEATURE_NAMES = [
    "betweenness",
    "degree",
    "capacity_utilization",
    "neighbor_congestion_count",
    "historical_disruptions",
    "capacity_drop",
]


def build_features(graph, hist_scores: Dict[int, dict], port_id: int, capacity_drop: float = 50.0) -> list[float]:
    node = graph.nodes[port_id]
    breakdown = hist_scores[port_id]["feature_breakdown"]
    neighbor_pressure = sum(
        1
        for n in graph.successors(port_id)
        if graph.nodes[n]["baseline_load_teu"] / graph.nodes[n]["capacity_teu"] > 0.75
    )
    return [
        float(node.get("betweenness", 0.0)),
        float(node.get("degree", 0.0)),
        float(node["baseline_load_teu"]) / float(node["capacity_teu"]),
        float(neighbor_pressure),
        float(breakdown["historical_disruption_norm"]) / 100.0,
        float(capacity_drop) / 100.0,
    ]


def predict_port(model, graph, hist_scores: Dict[int, dict], port_id: int) -> dict:
    features = build_features(graph, hist_scores, port_id)
    feature_frame = pd.DataFrame([features], columns=FEATURE_NAMES)
    if model is None:
        raise RuntimeError("model unavailable")
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(feature_frame)[0][1])
    else:
        probability = float(model.predict(feature_frame)[0])
    importances = getattr(model, "feature_importances_", None)
    if importances is None:
        top_features = {name: round(abs(value), 4) for name, value in zip(FEATURE_NAMES, features)}
    else:
        top_features = {name: round(float(value), 4) for name, value in zip(FEATURE_NAMES, importances)}
    return {
        "port_id": port_id,
        "port_name": graph.nodes[port_id]["name"],
        "congestion_probability": max(0.0, min(1.0, round(probability, 4))),
        "top_features": top_features,
    }
