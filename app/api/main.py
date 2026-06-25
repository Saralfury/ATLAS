from __future__ import annotations

from contextlib import asynccontextmanager
import os
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import history, predict, risk, simulate
from app.database.connection import Base, engine
from app.services.graph_builder import build_graph, precompute_centrality
from app.services.risk_engine import compute_all_historical_scores


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    app.state.base_graph = build_graph()
    app.state.centrality = precompute_centrality(app.state.base_graph)
    model_path = Path("ml/model.pkl")
    app.state.model = joblib.load(model_path) if model_path.exists() else None
    app.state.hist_scores = compute_all_historical_scores(app.state.base_graph, app.state.centrality)
    print("STARTUP complete - API is ready.")
    yield


app = FastAPI(title="ATLAS Indian Port Cascade Risk API", lifespan=lifespan)
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(simulate.router)
app.include_router(risk.router)
app.include_router(predict.router)
app.include_router(history.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "graph_nodes": app.state.base_graph.number_of_nodes(),
        "graph_edges": app.state.base_graph.number_of_edges(),
        "model_loaded": app.state.model is not None,
    }
