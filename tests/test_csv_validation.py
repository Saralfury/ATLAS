from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def rows(name):
    with (DATA / name).open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def test_ports_count_and_ids():
    ports = rows("ports.csv")
    assert len(ports) == 30
    assert [int(p["id"]) for p in ports] == list(range(1, 31))


def test_routes_count_and_references():
    routes = rows("routes.csv")
    ids = {int(p["id"]) for p in rows("ports.csv")}
    assert len(routes) == 92
    for route in routes:
        assert int(route["source_port"]) in ids
        assert int(route["destination_port"]) in ids
        assert int(route["traffic_volume"]) > 0
        assert float(route["distance_nm"]) > 0


def test_disruptions_count_and_references():
    disruptions = rows("disruptions.csv")
    ids = {int(p["id"]) for p in rows("ports.csv")}
    assert len(disruptions) == 62
    for disruption in disruptions:
        assert int(disruption["port_id"]) in ids
        assert 0.0 < float(disruption["severity"]) <= 1.0
