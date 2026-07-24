# ATLAS 🌊 Maritime Cascade Risk Command

**Predict, simulate, and mitigate cascading disruption risks across India's major shipping ports.**

## What It Does
- Models 30 Indian ports and 92 shipping routes as a directed graph
- Simulates cascade effects when disruptions (weather, strikes, equipment failure) hit
- Predicts risk scores using XGBoost trained on historical disruption patterns
- Provides real-time risk dashboards via Next.js frontend

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, NetworkX, XGBoost
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **ML:** Synthetic training data generation, feature engineering, model persistence
- **DevOps:** Docker, Docker Compose, pytest

## Quick Start
```bash
docker-compose up
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

## Key Features
- 🌊 **Cascade Simulation** — NetworkX BFS propagation across port-route graph
- 🤖 **ML Risk Prediction** — XGBoost/RandomForest ensemble
- 📊 **Interactive Dashboard** — Real-time risk visualization
- 🧪 **Tested** — 4 test suites (cascade, validation, model, risk engine)

## Project Structure
```
ATLAS/
├── app/              # FastAPI backend
│   ├── api/          # Route handlers
│   ├── database/     # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── ml/               # ML training pipeline
├── src/              # Next.js frontend
├── tests/            # pytest suite
├── data/             # ports.csv, routes.csv, disruptions.csv
└── docker-compose.yml
```

## License
MIT
