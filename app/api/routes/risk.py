from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.schemas.pydantic_models import RiskAnalysisOutput, RiskInput
from app.services.risk_engine import risk_for_port

router = APIRouter()


@router.post("/risk-analysis", response_model=RiskAnalysisOutput)
def risk_analysis(payload: RiskInput, request: Request):
    try:
        return risk_for_port(request.app.state.base_graph, request.app.state.hist_scores, payload.port)
    except KeyError:
        raise HTTPException(status_code=404, detail="port not found")
