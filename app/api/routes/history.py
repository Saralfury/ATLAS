from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import SimulationRun
from app.schemas.pydantic_models import ReplayOutput, SimulationSummary

router = APIRouter()


@router.get("/history/list", response_model=list[SimulationSummary])
def list_history(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    return db.query(SimulationRun).order_by(SimulationRun.created_at.desc()).limit(limit).all()


@router.get("/history/replay", response_model=ReplayOutput)
def replay_history(event_id: int, request: Request, db: Session = Depends(get_db)):
    run = db.get(SimulationRun, event_id)
    if run is None:
        raise HTTPException(status_code=404, detail="simulation run not found")
    output = run.output_json
    changed_nodes = [state["port_name"] for state in output.get("node_states", []) if state.get("status") != "normal"]
    return {
        "event_id": run.id,
        "simulation_input": run.input_json,
        "before_state": {
            "description": "Baseline network before disruption",
            "total_nodes": request.app.state.base_graph.number_of_nodes(),
            "total_edges": request.app.state.base_graph.number_of_edges(),
            "all_statuses": "normal",
        },
        "after_state": output,
        "changed_nodes": changed_nodes,
        "comparison_metrics": {
            "shock_applied": run.input_json,
            "cascade_size": output.get("cascade_size", 0),
            "stranded_cargo_teu": output.get("stranded_cargo_teu", 0),
            "total_delay_days": output.get("total_delay_days", 0),
            "ports_affected": len(changed_nodes),
        },
    }
