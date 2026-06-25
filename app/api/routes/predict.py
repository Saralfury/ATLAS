from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.schemas.pydantic_models import PredictionOutput
from app.services.ml_predictor import predict_port

router = APIRouter()


@router.get("/predict/{port_id}", response_model=PredictionOutput)
def predict(port_id: int, request: Request):
    if request.app.state.model is None:
        raise HTTPException(status_code=503, detail="model unavailable")
    if port_id not in request.app.state.base_graph.nodes:
        raise HTTPException(status_code=404, detail="port not found")
    return predict_port(request.app.state.model, request.app.state.base_graph, request.app.state.hist_scores, port_id)
