from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SimulationInput(BaseModel):
    port: str
    capacity_drop: float = Field(ge=0, le=100)


class NodeState(BaseModel):
    port_id: int
    port_name: str
    status: str
    current_load: float
    capacity_limit: float
    overflow: float


class StateTransition(BaseModel):
    port_id: int
    port_name: str
    transition: str
    hop: int


class SimulationOutput(BaseModel):
    simulation_id: Optional[int]
    cascade_size: int
    impacted_ports: List[str]
    stranded_cargo_teu: float
    total_delay_days: float
    node_states: List[NodeState]
    state_transitions: List[StateTransition]


class RiskInput(BaseModel):
    port: str


class FeatureBreakdown(BaseModel):
    betweenness_norm: float
    capacity_utilization_norm: float
    historical_disruption_norm: float
    degree_norm: float


class RiskAnalysisOutput(BaseModel):
    port_name: str
    risk_score: float
    criticality_rank: int
    feature_breakdown: FeatureBreakdown


class PredictionOutput(BaseModel):
    port_id: int
    port_name: str
    congestion_probability: float
    top_features: Dict[str, float]


class SimulationSummary(BaseModel):
    id: int
    port: str
    capacity_drop: float
    cascade_size: int
    created_at: datetime


class BeforeState(BaseModel):
    description: str
    total_nodes: int
    total_edges: int
    all_statuses: str


class ReplayOutput(BaseModel):
    event_id: int
    simulation_input: Dict[str, Any]
    before_state: BeforeState
    after_state: Dict[str, Any]
    changed_nodes: List[str]
    comparison_metrics: Dict[str, Any]
