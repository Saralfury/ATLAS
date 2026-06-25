from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import SimulationRun
from app.schemas.pydantic_models import SimulationInput, SimulationOutput
from app.services.cascade_engine import run_cascade

router = APIRouter()

# ATLAS invariants:
# - base_graph is READ-ONLY after startup; every mutation uses .copy()
# - Port.id uses autoincrement=False; IDs come from CSV, never from PostgreSQL SERIAL
# - POST /simulate writes to simulation_runs BEFORE returning the response
# - The cascade engine receives a copy, not base_graph
# - distance_nm is floored at 1.0 in graph_builder.py, not in the cascade engine
# - XGBoost model is loaded exactly once in lifespan, never per-request
# - Risk scores always use base_graph.current_load which equals baseline_load_teu


@router.post("/simulate", response_model=SimulationOutput)
def simulate(payload: SimulationInput, request: Request, db: Session = Depends(get_db)):
    try:
        result = run_cascade(request.app.state.base_graph.copy(), payload.port, payload.capacity_drop)
    except KeyError:
        raise HTTPException(status_code=404, detail="port not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"simulation fault: {exc}")

    run_record = SimulationRun(
        port=payload.port,
        capacity_drop=payload.capacity_drop,
        cascade_size=result["cascade_size"],
        input_json=payload.model_dump(),
        output_json=result,
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)
    result["simulation_id"] = run_record.id
    run_record.output_json = result
    db.commit()
    return result
