from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

from app.database.connection import Base, SessionLocal, engine
from app.database.models import Disruption, Port, Route, SimulationRun

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(SimulationRun).delete()
        db.query(Disruption).delete()
        db.query(Route).delete()
        db.query(Port).delete()

        with (DATA / "ports.csv").open(newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                db.add(
                    Port(
                        id=int(row["id"]),
                        name=row["name"],
                        capacity_teu=int(row["capacity_teu"]),
                        baseline_load_teu=int(row["baseline_load_teu"]),
                        lat=float(row["lat"]),
                        lon=float(row["lon"]),
                    )
                )
        db.flush()

        with (DATA / "routes.csv").open(newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                db.add(
                    Route(
                        source_port=int(row["source_port"]),
                        destination_port=int(row["destination_port"]),
                        traffic_volume=int(row["traffic_volume"]),
                        distance_nm=float(row["distance_nm"]),
                    )
                )

        with (DATA / "disruptions.csv").open(newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                db.add(
                    Disruption(
                        port_id=int(row["port_id"]),
                        event_type=row["event_type"],
                        severity=float(row["severity"]),
                        date=datetime.fromisoformat(row["date"]),
                    )
                )

        db.commit()
        print(
            f"ports: {db.query(Port).count()} | "
            f"routes: {db.query(Route).count()} | "
            f"disruptions: {db.query(Disruption).count()}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
