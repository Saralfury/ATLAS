from __future__ import annotations

from pathlib import Path
import random

import pandas as pd

from app.services.graph_builder import build_graph, precompute_centrality
from app.services.ml_predictor import FEATURE_NAMES, build_features
from app.services.risk_engine import compute_all_historical_scores

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    graph = build_graph()
    centrality = precompute_centrality(graph)
    scores = compute_all_historical_scores(graph, centrality)
    rows = []
    random.seed(42)
    for _ in range(5000):
        port_id = random.choice(list(graph.nodes))
        drop = random.choice([20, 35, 50, 65, 80, random.uniform(5, 95)])
        features = build_features(graph, scores, port_id, drop)
        risk = scores[port_id]["risk_score"] / 100.0
        pressure = 0.45 * risk + 0.35 * (drop / 100.0) + 0.20 * features[3] / 8.0
        label = int(pressure + random.uniform(-0.18, 0.18) > 0.56)
        rows.append(dict(zip(FEATURE_NAMES, features), congested=label))
    out = ROOT / "ml" / "training_data.csv"
    pd.DataFrame(rows).to_csv(out, index=False)
    positive_rate = sum(r["congested"] for r in rows) / len(rows)
    print(f"Saved {len(rows)} samples to {out} (positive rate: {positive_rate:.0%})")


if __name__ == "__main__":
    main()
