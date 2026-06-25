# ATLAS: Indian Port Risk Command (Forensic Audit Report)

This document is the result of a comprehensive forensic audit of the ATLAS repository. It includes the Repository Map, Dependency Map, Data Flow Analysis, Health Report, Completion Estimates, and a prioritized Bug Report.

---

## Phase 1 & 2: Repository Inventory & File-By-File Analysis

### 1. Repository Statistics
- **Total Files Monitored**: 48 (excluding `node_modules`, `.git`, etc.)
- **Frontend Files**: 29 (`.ts`, `.tsx`, `.css`)
- **Backend Files**: 13 (`.py`)
- **Config/Build Files**: 4 (`package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, etc.)
- **Data Files**: 4 (`ports.csv`, `routes.csv`, `disruptions.csv`, `india.json`)
- **Test Files**: 4 (`test_*.py`)

### 2. File Categories & Purpose

#### 📂 Configuration & Build
| File | Purpose |
|------|---------|
| `package.json` | Node dependencies, scripts (`dev`, `build`, `typecheck`). |
| `tsconfig.json` | TypeScript compiler options. Next.js aliases (`@/*`). |
| `next.config.js` | Next.js API rewrite rules (`/backend/*` -> `localhost:8000`). |
| `tailwind.config.ts` | Tailwind CSS theme tokens (custom ocean palette). |

#### 📂 Backend (FastAPI / Python)
| File | Purpose |
|------|---------|
| `app/api/main.py` | FastAPI entry point, CORS, lifespan state (graph, model). |
| `app/api/routes/*.py` | Endpoints for `/simulate`, `/history`, `/predict`, `/risk-analysis`. |
| `app/database/connection.py` | SQLAlchemy setup, QueuePool for Postgres/SQLite. |
| `app/database/models.py` | DB schemas: `Port`, `Route`, `Disruption`, `SimulationRun`. |
| `app/database/seed.py` | DB population from CSV files. |
| `app/services/cascade_engine.py` | Core simulation logic using NetworkX BFS propagation. |
| `app/services/graph_builder.py` | Loads CSVs to build DiGraph, precomputes centrality. |
| `app/services/ml_predictor.py` | Generates features and queries XGBoost/RandomForest model. |
| `app/services/risk_engine.py` | Computes baseline static risk scores. |
| `ml/generate_training_data.py` | Synth data generator for the ML model. |
| `ml/train.py` | Scikit-Learn `RandomForestClassifier` trainer. |

#### 📂 Frontend (Next.js / React / Zustand)
| File | Purpose |
|------|---------|
| `src/app/page.tsx` & `layout.tsx` | Next.js App Router entry point. Renders `<AppShell />`. |
| `src/app/globals.css` | Vanilla CSS tokens, animations (`portPulse`, `glitch`). |
| `src/app/api/proxy/_forward.ts` | Next.js Route Handler for bridging to FastAPI. |
| `src/store/index.ts` | Zustand global store (state, active canvas, current run). |
| `src/components/layout/AppShell.tsx`| Main orchestration layout (Map, Drawer, Panel). |
| `src/components/map/IndiaMap.tsx` | `react-simple-maps` implementation. |
| `src/components/graph/NetworkGraph.tsx`| `d3-force` graph visualization. |
| `src/components/analysis/*.tsx` | AI Forecast, Risk Breakdown, Configurator side panels. |
| `src/lib/geo.ts` & `animation.ts` | Geographic utilities (Bezier paths) and animation constants. |
| `src/lib/portData.ts` | Static port definitions (mirrors CSV for fast frontend access). |

#### 📂 Data & Tests
| File | Purpose |
|------|---------|
| `data/ports.csv`, `routes.csv` | Network topology definitions. |
| `public/india.json` | TopoJSON map geometry. |
| `tests/test_cascade.py`, etc. | Pytest suite for backend validation. |

### 3. Structural Findings
- **Duplicates**: `src/lib/portData.ts` duplicates data found in `data/ports.csv`. While technically duplicate, this is an intentional optimization for synchronous frontend rendering.
- **Orphaned/Unused**: `app/schemas/__init__.py` and other `__init__.py` are empty but required for Python modules.
- **Suspicious Files**: None. The structure resembles a highly polished hackathon or internal prototype.

---

## Phase 3: Dependency Graph & Architecture

### 1. Frontend Dependency Graph
**Core Architecture:** Next.js App Router (React) -> Zustand -> API Proxy -> Components

**Critical Path:**
`page.tsx` -> `AppShell.tsx`
  -> `Header.tsx`
  -> `IndiaMap.tsx` (via `react-simple-maps`) / `NetworkGraph.tsx` (via `d3`)
  -> `AnalysisPanel.tsx` -> (`DamageReport.tsx` \| `SimulationConfigurator.tsx` \| `PortRiskBreakdown.tsx`)
  -> `HistoricalReplayDrawer.tsx`

**State Dependency (Zustand):**
Almost all components connect to `src/store/index.ts`. Slices (`historySlice.ts`, `mapSlice.ts`) simply re-export selectors from the main store.

### 2. Backend Dependency Graph
**Core Architecture:** FastAPI -> Services -> NetworkX -> SQLAlchemy -> SQLite/Postgres

**Critical Path:**
`main.py` -> Lifespan (loads NetworkX Graph, precomputes centrality, loads `model.pkl`)
  -> `routes/simulate.py` -> `services/cascade_engine.py` (Mutates graph copy) -> DB
  -> `routes/risk.py` -> `services/risk_engine.py`
  -> `routes/predict.py` -> `services/ml_predictor.py` -> Scikit-learn Model
  -> `routes/history.py` -> DB `SimulationRun`

### 3. Shared/Integration Graph
**Communication Layer:**
Frontend -> `src/app/api/proxy/[route].ts` -> Next.js Edge/Node runtime -> FastAPI (`http://localhost:8000/[route]`).

---

## Phase 4: Data Flow Analysis

### 1. Risk Analysis Flow (Static Baseline)
**User Action**: Load App / Select Port
↓ `usePortData` Hook checks if data is stale (TTL 5 mins)
↓ Call `analyzePortRisk` API (`/api/proxy/risk-analysis`)
↓ Next.js routes to FastAPI (`routes/risk.py`)
↓ `risk_for_port` reads from `app.state.hist_scores`
↓ Returns static pre-computed scores (Betweenness, Capacity, Disruptions, Degree)
↓ Store `setRiskData` updates global `riskData` and re-calculates `networkAverages`
↓ UI updates (Radar Chart, Features Bar, Network node sizes)

### 2. Prediction Flow (AI Forecast)
**User Action**: Click Port / "AI Forecast" Tab
↓ `usePrediction` Hook triggers (with 300ms debounce)
↓ Call `predictCongestion` API (`/api/proxy/predict/[id]`)
↓ FastAPI (`routes/predict.py`)
↓ `services/ml_predictor.py` constructs features using static graph data and `capacity_drop=50` (default)
↓ Executes `predict_proba` on `joblib` loaded model
↓ Returns JSON with `congestion_probability` and `top_features` importances
↓ UI Updates (AI Gauge Needle sweeps, Importance bars fill)

### 3. Simulation Flow (The Cascade)
**User Action**: Drag Slider to set severity, Click "SIMULATE DISRUPTION"
↓ `runSelectedSimulation` calls `simulateDisruption`
↓ API Proxy -> FastAPI (`/simulate`)
↓ `routes/simulate.py` creates a **DEEP COPY** of `app.state.base_graph`
↓ `services/cascade_engine.py` applies `capacity_drop` to origin port.
↓ BFS Queue propagates `overflow` proportional to route traffic/distance.
↓ FastAPI commits `SimulationRun` to PostgreSQL/SQLite
↓ Result JSON sent to frontend -> `setSimulationResult`
↓ UI Switch: `AnalysisPanel` transitions to `DamageReport`

### 4. Replay Flow (Animation)
**User Action**: Simulation Completes / Click "REPLAY ANIMATION"
↓ `DamageReport.tsx` triggers `useCascadeAnimation`
↓ `startAnimation` groups `state_transitions` by `hop`
↓ Sets `setTimeout` sequence using `hop * 150ms` (CASCADE_HOP_DELAY_MS)
↓ Updates global `portStatuses` incrementally
↓ Map/Network views re-render reactively via D3/Zustand bindings

---

## Phase 5-11: Health Report & Audits

### State Management Audit (Zustand)
- **Architecture**: Single monolithic store (`src/store/index.ts`).
- **Update Paths**: Highly reactive. Most UI components use fine-grained selectors.
- **Bug**: "Slice" pattern was started but abandoned. Files in `store/slices/` are just exporting the hooks.

### API Audit
- **Architecture**: FastAPI backend behind a Next.js Edge proxy.
- **Vulnerabilities**: 
  - CORS in `main.py` is hardcoded to `localhost:3000`. This will break in remote deployments.
  - `/simulate` writes to DB *before* returning the response. If DB fails, simulation is lost.

### Component Audit
- **Performance Risks**: 
  - `IndiaMap.tsx` passes a new `Set` into a `useMemo` dependency array (`activeIds`). React compares by reference, so `useMemo` is bypassed, causing the entire map geometry to recalculate on *every single render*.
- **Missing Cleanup**: `useKeyboardShortcuts` adds `keydown` listeners but properly removes them. Good.

### Backend Audit
- **Graph Engine**: Beautiful use of NetworkX. `base_graph` is created once on lifespan startup.
- **Integrity Risks**: `cascade_engine.py` applies a hard threshold. Cargo "disappears" if it doesn't meet the overflow threshold, violating conservation of cargo.

### Test Coverage Audit
- **Tests exist**: Yes (`tests/*.py`).
- **Gaps**: No frontend testing (Jest/Cypress). API endpoints aren't tested. Cascade engine is tested, but not for conservation of mass.

### Build Audit
- **Docker/Env**: `package.json` relies purely on `next dev`. Database connection falls back to `sqlite:///./atlas.db` via `dotenv`. Fast and reliable.

---

## Phase 12: Completion Assessment

| Area | Completion % | Reasoning |
|------|--------------|-----------|
| **Backend Architecture** | 95% | The FastAPI layer, NetworkX engine, and SQLite integration are incredibly solid. Missing production grade logging, rate limiting, and dynamic config. |
| **Frontend UI/UX** | 98% | The UI is stunning. The use of D3, React-Simple-Maps, and Framer Motion makes it feel like a military command center. |
| **Integration** | 90% | The Next.js API proxy successfully bridges the ports. However, hardcoded CORS prevents remote deployment. |
| **Testing** | 30% | Backend unit tests exist. Zero frontend or E2E tests. |
| **Hackathon Readiness** | 100% | Flawless for a demo. Visually impressive, the "cascade" tells a great story, and it runs reliably locally. |
| **Production Readiness** | 40% | Not ready for real-world enterprise deployment. Data is hardcoded in CSVs and duplicated into TypeScript. No authentication or caching. |

---

## Phase 13: Prioritized Bug Report

### 🔴 Critical Priority Bugs

**1. React Re-render Thrashing in Map**
- **File**: `src/components/map/IndiaMap.tsx`
- **Cause**: `activeIds` is initialized as a `new Set(...)` during the component body execution. It is then passed into the dependency array of the `useMemo` that generates `edges`. Because object reference identity changes every render, `useMemo` is broken.
- **Impact**: The entire complex SVG map recalculates paths on every state change, causing UI freezing during rapid animations.
- **Suggested Fix**: Wrap the `activeIds` Set creation in its own `useMemo`.

**2. Cargo Conservation Violation (Cascade Physics)**
- **File**: `app/services/cascade_engine.py`
- **Cause**: Line 675 `if hop > MAX_HOPS or overflow < MIN_OVERFLOW: continue`. If overflow falls below `MIN_OVERFLOW`, the loop skips and that cargo is dropped from the simulation entirely.
- **Impact**: In a large network, significant TEU cargo vanishes into thin air rather than being stranded at the final node.
- **Suggested Fix**: Add the remaining overflow to `stranded` cargo before `continue`.

### 🟠 High Priority Bugs

**3. Hardcoded CORS Constraints**
- **File**: `app/api/main.py`
- **Cause**: `allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]`
- **Impact**: The backend cannot be accessed if deployed to Vercel, AWS, or any remote IP.
- **Suggested Fix**: Use environment variables for allowed origins.

**4. D3 Simulation Memory Leak / Over-subscription**
- **File**: `src/components/graph/NetworkGraph.tsx`
- **Cause**: The `useAtlasStore.subscribe(...)` listener is re-attached every time `riskData` changes, but the cleanup function only runs when `useEffect` tears down.
- **Impact**: Rapid changes to risk scores will attach duplicate listeners, causing heavy memory pressure.
- **Suggested Fix**: Ensure the subscription is managed cleanly and `simulation.stop()` correctly halts the physics engine.

### 🟡 Medium Priority Bugs

**5. Abandoned Slice Architecture**
- **File**: `src/store/slices/*.ts`
- **Cause**: Contains nothing but `export { usePortStatus } from "@/store";`
- **Impact**: Adds confusion to the repository structure.
- **Suggested Fix**: Delete the `slices` directory entirely.

### 🟢 Low Priority Bugs

**6. Hardcoded Data Duplication**
- **File**: `src/lib/portData.ts` and `data/ports.csv`
- **Cause**: The frontend hardcodes what the backend also provides via CSV.
- **Impact**: Updating a port coordinate requires changing it in two places.
- **Suggested Fix**: Move to a dynamic fetching model on load.
