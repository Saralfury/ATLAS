from app.services.graph_builder import build_graph, precompute_centrality
from app.services.ml_predictor import FEATURE_NAMES, build_features
from app.services.risk_engine import compute_all_historical_scores


def test_feature_order_and_values():
    assert FEATURE_NAMES == [
        "betweenness",
        "degree",
        "capacity_utilization",
        "neighbor_congestion_count",
        "historical_disruptions",
        "capacity_drop",
    ]
    graph = build_graph()
    scores = compute_all_historical_scores(graph, precompute_centrality(graph))
    features = build_features(graph, scores, 1, 80)
    assert len(features) == 6
    assert features[-1] == 0.8
