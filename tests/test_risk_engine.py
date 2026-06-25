from app.services.graph_builder import build_graph, precompute_centrality
from app.services.risk_engine import compute_all_historical_scores, normalize_to_100, risk_for_port


def test_normalize_flat_returns_50():
    assert normalize_to_100(3, 3, 3) == 50


def test_risk_scores_cover_all_ports_and_rank():
    graph = build_graph()
    scores = compute_all_historical_scores(graph, precompute_centrality(graph))
    assert len(scores) == 30
    assert all(0 <= item["risk_score"] <= 100 for item in scores.values())
    jnpt = risk_for_port(graph, scores, "JNPT Mumbai")
    assert jnpt["criticality_rank"] <= 5
    assert set(jnpt["feature_breakdown"]) == {
        "betweenness_norm",
        "capacity_utilization_norm",
        "historical_disruption_norm",
        "degree_norm",
    }
