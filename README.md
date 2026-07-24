<div align="center">

# 🌊 ATLAS

### Maritime Cascade Risk Command Platform

**Predict. Simulate. Understand.**

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![NetworkX](https://img.shields.io/badge/NetworkX-orange)
![XGBoost](https://img.shields.io/badge/XGBoost-red)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

A graph-based platform for modeling cascading disruptions across India's maritime logistics network before they become large-scale operational failures.

### 🎥 Project Demonstration

https://www.linkedin.com/posts/saral-saini-49177931b_atlas-maritime-cascade-simulation-activity-7478108018807554050-LA1I

---

<!-- Replace after adding screenshots -->

![Dashboard](docs/images/dashboard.png)

</div>

---

# Why ATLAS?

Modern maritime logistics is an interconnected system rather than a collection of independent ports.

When one port experiences disruption, cargo is rerouted, neighboring ports absorb additional traffic, congestion increases, delays compound, and failures propagate across the network.

Traditional monitoring systems describe events after they occur.

ATLAS explores a different question.

> **If we know where a disruption begins, can we predict where it spreads next?**

The platform represents India's maritime infrastructure as a directed weighted graph.

- Ports become nodes.
- Shipping routes become weighted edges.
- Disruptions propagate through network dependencies.
- Machine learning estimates downstream operational severity.

Rather than analyzing ports individually, ATLAS models how an entire logistics network behaves under stress.

---

# Key Features

| Feature | Description |
|----------|-------------|
| 🌊 Cascade Simulation | Simulate disruptions across interconnected ports |
| 🕸 Graph Analytics | Dependency-aware maritime network modeling |
| 🤖 ML Risk Prediction | Predict congestion, delay and stranded cargo |
| 📊 Interactive Dashboard | Visualize disruptions in real time |
| 📈 Historical Replay | Replay previous simulations |
| ⚡ REST API | FastAPI powered backend |
| 🐘 PostgreSQL | Persistent simulation storage |
| 🐳 Docker | Reproducible deployment |

---

# System Architecture

```mermaid
flowchart TD

U[User]

--> N[Next.js Dashboard]

N

--> A[FastAPI Backend]

A

--> G[Graph Engine]

A

--> M[Machine Learning]

A

--> DB[(PostgreSQL)]

G --> NX[NetworkX]

M --> X[XGBoost]

G --> DB

M --> DB

A --> N
```

---

# Architecture Overview

| Layer | Responsibility | Technology |
|--------|----------------|------------|
| Frontend | Dashboard & Visualization | Next.js + TypeScript |
| Backend | REST API & Business Logic | FastAPI |
| Graph Engine | Cascade propagation | NetworkX |
| ML Engine | Risk estimation | XGBoost |
| Database | Persistent storage | PostgreSQL |
| ORM | Data access | SQLAlchemy |
| Deployment | Containerization | Docker Compose |

---

# Engineering Decisions

## Why Graphs?

Ports influence each other through operational dependencies rather than geographical distance.

Graph theory naturally models this relationship.

---

## Why FastAPI?

- High performance
- Asynchronous request handling
- Automatic OpenAPI documentation
- Type-safe validation with Pydantic

---

## Why PostgreSQL?

Simulation data is relational and transactional.

PostgreSQL provides consistency, indexing and mature SQL capabilities.

---

## Why NetworkX?

Cascade propagation is fundamentally a graph traversal problem.

NetworkX provides reliable graph algorithms while remaining easy to extend.

---

## Why XGBoost?

The prediction task uses structured numerical features.

Gradient boosting performs extremely well on tabular operational datasets while remaining interpretable.

---

## Why Docker?

Every developer runs the exact same environment.

No dependency drift.

No "works on my machine."

---

# Simulation Pipeline

```mermaid
sequenceDiagram

participant User

participant Frontend

participant API

participant Graph

participant ML

participant Database

User->>Frontend: Configure disruption

Frontend->>API: POST /simulate

API->>Graph: Load maritime graph

Graph->>Graph: Propagate disruption

Graph-->>API: Impacted ports

API->>ML: Estimate downstream risk

ML-->>API: Predictions

API->>Database: Store simulation

Database-->>API: Success

API-->>Frontend: Results
```

---

# Data Model

```mermaid
erDiagram

PORT ||--o{ ROUTE : connects

SIMULATION ||--o{ PREDICTION : generates

PORT {

int id

string name

float capacity

}

ROUTE {

int source_port

int destination_port

float weight

}

SIMULATION {

int id

datetime created_at

string source_port

int capacity_reduction

int cascade_size

}

PREDICTION {

int simulation_id

float congestion_score

float delay

float stranded_cargo

}
```

---

# Request Lifecycle

```text
User

↓

Choose Port

↓

Select Capacity Reduction

↓

Run Simulation

↓

Graph Propagation

↓

Machine Learning Prediction

↓

Persist Results

↓

Interactive Dashboard
```

---

# Project Structure

```text
ATLAS

├── backend
│   ├── api
│   ├── graph
│   ├── ml
│   ├── database
│   ├── services
│   ├── schemas
│   └── core
│
├── frontend
│
├── docs
│   ├── diagrams
│   └── images
│
├── tests
│
├── docker-compose.yml
│
├── requirements.txt
│
└── README.md
```

---

# Example Simulation

### Request

```http
POST /simulate
```

```json
{
  "port": "JNPT",
  "capacity_reduction": 80,
  "duration_hours": 24
}
```

### Response

```json
{
  "simulation_id":42,
  "cascade_size":8,
  "affected_ports":[
      "JNPT",
      "Mundra",
      "Kandla",
      "Chennai"
  ],
  "predicted_delay_hours":18,
  "stranded_cargo_teu":52310,
  "network_state":"Critical"
}
```

One request.

One simulation.

A quantified network-wide disruption.

---

# Installation

```bash
git clone https://github.com/Saralfury/ATLAS.git

cd ATLAS

docker compose up --build
```

---

# Services

| Service | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

---

# Configuration

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/atlas

SECRET_KEY=change_me

MODEL_PATH=models/xgboost.pkl
```

---

# Testing

```bash
pytest
```

---

# API

| Method | Endpoint | Description |
|----------|----------|-------------|
| `GET` | `/ports` | Retrieve all ports |
| `GET` | `/ports/{id}` | Retrieve port details |
| `GET` | `/network` | Retrieve maritime graph |
| `POST` | `/simulate` | Execute a cascade simulation |
| `GET` | `/simulation/{id}` | Retrieve simulation results |
| `GET` | `/history` | Historical simulation runs |
| `GET` | `/analytics` | Network analytics |
| `GET` | `/health` | Health check |

Interactive API documentation is automatically generated by FastAPI.

```
http://localhost:8000/docs
```

---

# Example Workflow

```text
Select Port
      │
      ▼
Choose Disruption
      │
      ▼
Configure Capacity Reduction
      │
      ▼
Launch Simulation
      │
      ▼
Graph Propagation
      │
      ▼
Risk Prediction
      │
      ▼
Persist Results
      │
      ▼
Interactive Dashboard
```

---

# Performance Characteristics

ATLAS is designed for interactive analysis rather than offline batch processing.

Current implementation focuses on:

- Asynchronous FastAPI endpoints
- Efficient graph traversal
- PostgreSQL indexing
- Modular simulation pipeline
- Containerized deployment
- Stateless backend architecture

---

# Gallery

## Dashboard

> Replace with:

```text
docs/images/dashboard.png
```

![Dashboard](docs/images/dashboard.png)

---

## Maritime Network

> Replace with:

```text
docs/images/network.png
```

![Network](docs/images/network.png)

---

## Cascade Simulation

> Replace with:

```text
docs/images/simulation.png
```

![Simulation](docs/images/simulation.png)

---

## Analytics Dashboard

> Replace with:

```text
docs/images/analytics.png
```

![Analytics](docs/images/analytics.png)

---

# Engineering Highlights

ATLAS intentionally separates simulation from prediction.

The graph engine determines **where** a disruption propagates.

The machine learning engine estimates **how severe** the downstream effects become.

This separation keeps both components independently replaceable and easier to extend.

Other architectural goals include:

- Separation of concerns
- Modular service boundaries
- Stateless API design
- Reusable simulation engine
- Reproducible deployments
- Clear database ownership

---

# Technology Stack

| Category | Technology |
|------------|------------|
| Language | Python |
| Backend | FastAPI |
| Frontend | Next.js |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Graph Analytics | NetworkX |
| Machine Learning | XGBoost |
| Containerization | Docker |
| Version Control | Git & GitHub |

---

# Roadmap

| Area | Planned Improvements |
|------|----------------------|
| Live Data | AIS vessel tracking |
| Weather | Weather-aware simulations |
| Optimization | Dynamic rerouting |
| Simulation | Multi-port disruptions |
| Machine Learning | Explainable predictions |
| Analytics | Time-series forecasting |
| Infrastructure | CI/CD |
| Deployment | Cloud-native architecture |
| Scalability | Background workers & caching |

---

# Future Improvements

Potential long-term extensions include:

- Digital twin modeling
- International shipping networks
- Reinforcement learning for routing
- Port resource optimization
- Real-time congestion forecasting
- Multi-country maritime simulations

---

# Design Philosophy

ATLAS follows a few guiding engineering principles.

### Simplicity

Every component should have one responsibility.

---

### Modularity

Graph processing, persistence, APIs, and prediction remain loosely coupled.

---

### Maintainability

Readable architecture is preferred over unnecessary complexity.

---

### Extensibility

New simulation engines or prediction models can be introduced with minimal changes to the existing codebase.

---

### Reproducibility

Docker Compose provides identical development environments across operating systems.

---

# Repository Highlights

✔ Graph-based cascade simulation

✔ RESTful backend architecture

✔ Interactive visualization dashboard

✔ Machine learning risk estimation

✔ PostgreSQL persistence

✔ Dockerized deployment

✔ Production-style project structure

✔ Automatic Swagger documentation

✔ Modular backend architecture

---

# License

This project is licensed under the MIT License.

See the `LICENSE` file for additional information.

---

# Acknowledgements

This project builds upon several outstanding open-source technologies.

- FastAPI
- PostgreSQL
- SQLAlchemy
- NetworkX
- XGBoost
- Next.js
- Docker

Their ecosystems make projects like this possible.

---

<div align="center">

# 🌊 ATLAS

### Maritime Cascade Risk Command Platform

**Ports don't fail in isolation.**

Neither do supply chains.

ATLAS demonstrates how graph analytics and predictive modeling can transform isolated disruptions into understandable network-wide risk.

<br>

**Built by Saral Saini**

Backend Engineering Student

FastAPI • PostgreSQL • NetworkX • Docker

GitHub: https://github.com/Saralfury

LinkedIn: https://linkedin.com/in/saral-saini-49177931b

</div>
