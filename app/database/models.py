from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, func

from app.database.connection import Base


class Port(Base):
    __tablename__ = "ports"

    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String(120), unique=True, nullable=False, index=True)
    capacity_teu = Column(Integer, nullable=False)
    baseline_load_teu = Column(Integer, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_port = Column(Integer, ForeignKey("ports.id"), nullable=False, index=True)
    destination_port = Column(Integer, ForeignKey("ports.id"), nullable=False, index=True)
    traffic_volume = Column(Integer, nullable=False)
    distance_nm = Column(Float, nullable=False)


class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    port_id = Column(Integer, ForeignKey("ports.id"), nullable=False, index=True)
    event_type = Column(String(60), nullable=False)
    severity = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    port = Column(String(120), nullable=False, index=True)
    capacity_drop = Column(Float, nullable=False)
    cascade_size = Column(Integer, nullable=False)
    input_json = Column(JSON, nullable=False)
    output_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
