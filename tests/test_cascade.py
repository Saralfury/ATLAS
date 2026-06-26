from app.services.cascade_engine import run_cascade
from app.services.graph_builder import build_graph


def test_cascade_uses_graph_copy_and_spreads_jnpt():
    graph = build_graph()
    before = graph.nodes[1]["current_load"]
    result = run_cascade(graph.copy(), "JNPT Mumbai", 80)
    assert graph.nodes[1]["current_load"] == before
    assert result["cascade_size"] >= 6
    assert result["state_transitions"][0]["hop"] == 0
    assert result["state_transitions"][0]["port_name"] == "JNPT Mumbai"
    assert result["impacted_ports"][0] == "JNPT Mumbai"
    assert result["node_states"]


def test_unknown_port_raises():
    try:
        run_cascade(build_graph(), "Atlantis", 50)
    except KeyError:
        return
    assert False, "expected KeyError"
