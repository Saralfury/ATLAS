# ATLAS FULL ENGINEERING AUDIT (UNABRIDGED & UNCOMPRESSED)

## SECTION 1 — EXECUTIVE SUMMARY
- **Project Purpose**: ATLAS is an interactive maritime network simulation and risk command center that models the Indian port network to predict congestion risks and simulate cascading disruptions.
- **Technology Stack**: Next.js 14, React 18, Zustand, TailwindCSS, D3.js, React-Simple-Maps, FastAPI, NetworkX, Scikit-Learn (RandomForest), SQLAlchemy (SQLite/PostgreSQL).
- **Architecture Summary**: The frontend is a SPA hosted on Next.js, relying heavily on Zustand for global state and direct D3 DOM manipulation for extreme performance. The backend is a stateful FastAPI application holding a static `networkx.DiGraph` and an ML model in memory, which are copied and mutated per request to run cascade simulations.
- **Current Completion Estimate**: 90% overall.
- **Production Readiness Estimate**: 40% (No Auth, no Docker, hardcoded CORS, no production database provisioning script).
- **Hackathon Readiness Estimate**: 100% (Visually stunning, fast, and tells a compelling data story).

## SECTION 2 & 3 — COMPLETE INVENTORY & FILE-BY-FILE ANALYSIS

### 📂 BACKEND (PYTHON/FASTAPI)

**FILE: `app/api/main.py`**
- **Purpose**: FastAPI lifecycle and server execution.
- **Imports**: `contextlib.asynccontextmanager`, `fastapi.FastAPI`, `fastapi.middleware.cors`, `joblib`.
- **Functions**: `lifespan(app)` (loads ML and Graph), `health()`.
- **Execution Role**: Initializes DB, precomputes centrality scores, attaches them to `app.state.base_graph`, `app.state.hist_scores`, and `app.state.model`.
- **Dependencies**: `graph_builder`, `database.seed`, `database.connection`.
- **Complexity**: 3/10. **Risk**: 7/10 (CORS is hardcoded to `localhost:3000`).

**FILE: `app/api/routes/history.py`**
- **Purpose**: Endpoints for listing past simulations and fetching replays.
- **Imports**: `fastapi.APIRouter`, `fastapi.Depends`, `sqlalchemy.orm.Session`.
- **Functions**: `list_history(limit, db)`, `replay_simulation(event_id, db)`.
- **Complexity**: 2/10. **Risk**: 2/10.

**FILE: `app/api/routes/predict.py`**
- **Purpose**: Endpoint to query the RandomForest model for congestion probability.
- **Imports**: `fastapi.APIRouter`, `fastapi.HTTPException`, `fastapi.Request`.
- **Functions**: `predict(port_id, request)`.
- **Dependencies**: `services.ml_predictor`.
- **Complexity**: 3/10. **Risk**: 4/10.

**FILE: `app/api/routes/risk.py`**
- **Purpose**: Endpoint to fetch static precomputed risk scores.
- **Imports**: `fastapi.APIRouter`, `fastapi.Request`.
- **Functions**: `get_risk_analysis(payload, request)`.
- **Dependencies**: `services.risk_engine`.
- **Complexity**: 2/10. **Risk**: 2/10.

**FILE: `app/api/routes/simulate.py`**
- **Purpose**: Endpoint to trigger the cascade engine and store the result.
- **Imports**: `fastapi.APIRouter`, `fastapi.Depends`.
- **Functions**: `simulate_cascade(payload, request, db)`.
- **Execution Role**: Passes `request.app.state.base_graph.copy()` to the physics engine. Writes JSON output to the DB.
- **Dependencies**: `services.cascade_engine`, `database.models.SimulationRun`.
- **Complexity**: 4/10. **Risk**: 6/10 (Synchronous graph copy can block the thread).

**FILE: `app/database/connection.py`**
- **Purpose**: SQLAlchemy connection manager.
- **Execution Role**: Sets up SQLite engine with `check_same_thread=False` and `poolclass=QueuePool`.
- **Complexity**: 2/10. **Risk**: 5/10 (SQLite locks under heavy concurrency).

**FILE: `app/database/models.py`**
- **Purpose**: SQLAlchemy ORM schemas.
- **Classes**: `Port`, `Route`, `Disruption`, `SimulationRun`.
- **Execution Role**: Maps strictly to the CSV files and logs simulation history. `Port.id` is explicitly `autoincrement=False`.
- **Complexity**: 2/10. **Risk**: 1/10.

**FILE: `app/database/seed.py`**
- **Purpose**: DB Populator.
- **Functions**: `seed_database()`.
- **Execution Role**: Reads `data/*.csv` using Python's `csv` module and inserts rows into SQLite. Drops existing data to ensure idempotency.
- **Complexity**: 3/10. **Risk**: 2/10.

**FILE: `app/schemas/pydantic_models.py`**
- **Purpose**: Input/Output validation boundaries.
- **Classes**: `SimulationRequest`, `RiskRequest`.
- **Complexity**: 1/10. **Risk**: 1/10.

**FILE: `app/services/cascade_engine.py`**
- **Purpose**: Calculates the physics of port failure using BFS.
- **Functions**: `run_cascade(base_graph, port_name, capacity_drop)`.
- **Execution Role**: Applies capacity drop, calculates overflow, and distributes it using BFS Queue via `traffic_volume / distance_nm` weighting. Limits cascade to 10 hops (`MAX_HOPS`).
- **Dependencies**: `collections.deque`.
- **Complexity**: 8/10. **Risk**: 9/10 (Drops overflow < 50 TEU, violating mass conservation).

**FILE: `app/services/graph_builder.py`**
- **Purpose**: Network topology initialization.
- **Functions**: `build_graph()`, `precompute_centrality()`.
- **Execution Role**: Loads `ports.csv` and `routes.csv` into a `nx.DiGraph`.
- **Dependencies**: `networkx`.
- **Complexity**: 4/10. **Risk**: 2/10.

**FILE: `app/services/ml_predictor.py`**
- **Purpose**: Model feature extraction and inference.
- **Constants**: `FEATURE_NAMES` (Betweenness, Degree, Capacity Utilization, Neighbor Congestion Count, Historical Disruptions, Capacity Drop).
- **Functions**: `build_features()`, `predict_congestion()`.
- **Complexity**: 5/10. **Risk**: 3/10.

**FILE: `app/services/risk_engine.py`**
- **Purpose**: Baseline risk normalization.
- **Functions**: `compute_all_historical_scores()`, `normalize_to_100()`, `risk_for_port()`.
- **Complexity**: 4/10. **Risk**: 2/10.

### 📂 MACHINE LEARNING

**FILE: `ml/generate_training_data.py`**
- **Purpose**: Synthetic dataset generator.
- **Execution Role**: Randomly selects ports and applies capacity drops. Generates a 2000-row DataFrame.
- **Dependencies**: `pandas`, `graph_builder`.
- **Complexity**: 4/10. **Risk**: 1/10.

**FILE: `ml/train.py`**
- **Purpose**: Scikit-Learn `RandomForestClassifier` training pipeline.
- **Execution Role**: Trains the model (`max_depth=8`, `n_estimators=180`) and exports `model.pkl`.
- **Dependencies**: `sklearn.ensemble`, `joblib`.
- **Complexity**: 4/10. **Risk**: 2/10.

### 📂 FRONTEND (NEXT.JS / REACT)

**FILE: `src/app/layout.tsx` & `src/app/page.tsx`**
- **Purpose**: Next.js App Router entry points.
- **Execution Role**: `layout` injects Google Fonts (Inter, Space Grotesk, JetBrains Mono). `page` mounts the `<AppShell />`.

**FILE: `src/app/globals.css`**
- **Purpose**: CSS tokens and custom animations.
- **Execution Role**: Contains `@keyframes portPulse` and `glitch`.

**FILE: `src/app/api/proxy/_forward.ts`**
- **Purpose**: API Bridge for Next.js Route Handlers.
- **Execution Role**: Proxies all `/api/proxy/*` to `http://localhost:8000`. Caching is explicitly disabled (`cache: "no-store"`).

**FILE: `src/store/index.ts`**
- **Purpose**: Master global state orchestrator.
- **State**: `portStatuses`, `riskData`, `currentResult`, `isLoading`, `isAnimating`, `activeCanvas`.
- **Execution Role**: Central nervous system. Component selectors isolate re-renders. Uses `subscribeWithSelector`.
- **Complexity**: 5/10. **Risk**: 4/10.

**FILES: `src/store/slices/*.ts` (historySlice, mapSlice, riskSlice, simulationSlice, uiSlice)**
- **Purpose**: Abandoned architecture pattern.
- **Execution Role**: They only export hooks like `usePortStatus` directly from `@/store`.
- **Risk**: 3/10 (Dead code causing confusion).

**FILE: `src/components/layout/AppShell.tsx`**
- **Purpose**: Main layout orchestration.
- **Execution Role**: Grid layout for `<Sidebar />`, `<IndiaMap />` or `<NetworkGraph />`, and `<AnalysisPanel />`. 

**FILE: `src/components/layout/Header.tsx`**
- **Purpose**: Top navigation and system status ticker.
- **Execution Role**: Renders simulated metrics and a 30-second `setInterval` glitch effect.

**FILE: `src/components/map/IndiaMap.tsx`**
- **Purpose**: Spatial visualization of routes and ports.
- **Dependencies**: `react-simple-maps`, `framer-motion`.
- **Execution Role**: Projects TopoJSON. Maps custom Bezier curves via `<path>`. 
- **Complexity**: 6/10. **Risk**: 10/10 (Performance Trap: `activeIds = new Set()` in body breaks `useMemo` caching, causing massive CPU thrashing).

**FILE: `src/components/graph/NetworkGraph.tsx`**
- **Purpose**: Topological D3 force-directed view.
- **Dependencies**: `d3`.
- **Execution Role**: Simulates 1000 offline ticks to position nodes, then uses `useAtlasStore.subscribe` to directly mutate DOM element colors (`circle fill`) during cascades to bypass React rendering overhead.
- **Complexity**: 8/10. **Risk**: 7/10 (Memory leak via `useAtlasStore.subscribe` if dependencies change rapidly without unmount).

**FILE: `src/components/analysis/AnalysisPanel.tsx`**
- **Purpose**: Right-hand sidebar container.
- **Execution Role**: Handles `<AnimatePresence>` transitions between Configurator and Damage Report.

**FILE: `src/components/analysis/SimulationConfigurator.tsx`**
- **Purpose**: UI input for the physics engine.
- **Execution Role**: Slider sets capacity drop severity. "Simulate" button calls the API proxy.

**FILE: `src/components/analysis/DamageReport.tsx`**
- **Purpose**: Post-simulation results breakdown.
- **Execution Role**: Calls `useCascadeAnimation` to physically show the blast radius.

**FILE: `src/components/analysis/AiForecastPanel.tsx`**
- **Purpose**: Machine learning UI widget.
- **Execution Role**: Displays probability gauge and horizontal bar charts for feature importances.

**FILE: `src/components/analysis/PortRiskBreakdown.tsx`**
- **Purpose**: Static risk UI widget.
- **Execution Role**: Displays radar chart for normalized metrics (Betweenness, Capacity, etc).

**FILE: `src/components/drawer/HistoricalReplayDrawer.tsx`**
- **Purpose**: Bottom drawer showing past runs.
- **Execution Role**: Fetches from `/api/proxy/history/list` and plays back past simulations.

**FILES: `src/hooks/*.ts`**
- **`useCascadeAnimation.ts`**: Groups BFS hops by integer, triggers `setTimeout` at 150ms intervals.
- **`useGuidedDemo.ts`**: Automates a fake user journey for hackathon demos.
- **`useKeyboardShortcuts.ts`**: Binds Spacebar to play/pause, S to simulate.
- **`usePortData.ts`**: Background TTL worker fetching risk scores for stale ports.
- **`usePrediction.ts`**: Debounces clicks by 300ms before hitting the ML inference endpoint.

**FILES: `src/lib/*.ts`**
- **`geo.ts`**: Pure math for calculating `getPerpendicularOffset` to draw bidirectional routes cleanly.
- **`animation.ts`**: Constants for ms delays.
- **`colors.ts`**: Hex mappings for "normal", "at_risk", "congested", "analyzing".
- **`formatters.ts`**: TEU string formatting.
- **`api.ts`**: Generic fetch wrapper mapping 404/500 to typed `ApiError` objects.
- **`portData.ts` & `routeData.ts`**: **Risk**: 5/10. Data Duplication. Hardcoded topology mapping exactly to the CSVs.

**FILES: `src/types/*.ts`**
- **`api.types.ts`, `port.types.ts`, `simulation.types.ts`, `store.types.ts`**: Strict TypeScript interfaces preventing prop drilling bugs.

### 📂 TESTS & CONFIG
- **`tests/test_cascade.py`**: Asserts BFS mathematics.
- **`tests/test_csv_validation.py`**: Ensures no isolated nodes exist in the dataset.
- **`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`**: Standard modern Next.js 14 configurations. 

---

## SECTION 4 — ARCHITECTURE AUDIT
- **Frontend Architecture**: A strictly-typed Next.js 14 App Router application. However, Server Components are largely bypassed; this operates entirely as a Single Page Application (SPA). `page.tsx` mounts `<AppShell />` and routing is purely state-based via Zustand.
- **Backend Architecture**: FastAPI loads a persistent static `networkx.DiGraph` into RAM on startup. The database (SQLite/PostgreSQL) is used strictly as a write-only log for simulation histories, NOT for the core graph physics.
- **State Architecture**: Zustand monolithic store using `subscribeWithSelector` for D3 DOM updates and standard React hook selectors for UI sync.
- **Data Architecture**: Data originates in 3 CSV files. This data is physically duplicated into TS arrays (`src/lib/portData.ts`) for synchronous frontend rendering to bypass initial load lag.
- **API Architecture**: Next.js Edge proxy `/api/proxy/*` forwards requests to `localhost:8000`.
- **ML Architecture**: An offline-trained `RandomForestClassifier` (Scikit-Learn) loaded via `joblib`. 
- **Animation Architecture**: A mix of `framer-motion` for UI panels, CSS `@keyframes` for pulse rings, and direct DOM manipulation via D3/Zustand bindings for extreme performance under load.

---

## SECTION 5 — DATA FLOW AUDIT

**1. Risk Analysis Flow**
User App Load -> `usePortData` Hook -> Zustand Store -> Proxy (`/risk-analysis`) -> FastAPI -> `risk_engine.py` (reads static `app.state.hist_scores`) -> JSON Response -> `setRiskData` -> `<PortRiskBreakdown />` Radar Chart Updates.

**2. Prediction Flow**
User Clicks Port -> `usePrediction` Hook triggers (300ms debounce) -> Proxy (`/predict/[id]`) -> FastAPI -> `ml_predictor.py` constructs features using static graph -> Executes `predict_proba` -> Returns JSON -> UI updates Gauge Needle.

**3. Simulation Flow**
User Sets Slider & Clicks "Simulate" -> `<SimulationConfigurator />` -> Proxy (`/simulate`) -> FastAPI -> `cascade_engine.py` -> `nx.DiGraph.copy()` applied capacity hit -> BFS Queue Propagation -> Result JSON -> `SimulationRun` DB Insert -> Returns Result -> `setSimulationResult` -> UI `<DamageReport />` -> `useCascadeAnimation` fires.

**4. Replay Flow**
Simulation Ends -> Click "Replay" -> `DamageReport.tsx` -> `useCascadeAnimation` -> Groups nodes by `hop` -> `setTimeout` chain initialized (150ms delays) -> Mutates `portStatuses` incrementally -> `<NetworkGraph />` D3 subscriber mutates `<circle fill>` instantly.

---

## SECTION 6 — BUG HUNT

| Rank | Severity | File | Root Cause | Impact | Suggested Fix |
|------|----------|------|------------|--------|---------------|
| 1 | Critical | `IndiaMap.tsx` | `activeIds = new Set()` in component body breaks `useMemo` equality check for SVG edge mapping. | The entire complex SVG map recalculates paths on every state change, causing severe UI freezing during rapid animations. | Wrap the `activeIds` Set creation in its own `useMemo`. |
| 2 | Critical | `cascade_engine.py` | Line 675 `if overflow < MIN_OVERFLOW: continue`. Drops overflow cargo. | In a large network, significant TEU cargo vanishes into thin air rather than being stranded at the final node. Violates conservation of mass. | Add the remaining overflow to `stranded` cargo before `continue`. |
| 3 | High | `NetworkGraph.tsx`| The `useAtlasStore.subscribe(...)` listener is re-attached every time `riskData` changes inside a `useEffect`. | Rapid changes to risk scores attach duplicate listeners, causing heavy memory pressure. | Ensure the subscription is managed cleanly and `simulation.stop()` correctly halts the physics engine on unmount. |
| 4 | High | `main.py` | `allow_origins=["http://localhost:3000"]`. | The backend cannot be accessed if deployed to Vercel, AWS, or any remote IP. | Use environment variables for allowed origins. |
| 5 | Medium | `simulate.py` | DB `db.add()` happens before `return result`. | If the DB write blocks or fails, the simulation JSON is lost, causing a 500 error on the frontend. | Decouple the write via BackgroundTasks. |

---

## SECTION 7 — FRONTEND AUDIT
- **Rendering Issues**: The `<IndiaMap />` Set reference bug. `<PortRiskBreakdown />` uses Recharts `ResponsiveContainer` which can cause layout shifts.
- **Hydration Risks**: Safely avoided. `<AppShell />` is correctly labeled `"use client"`.
- **Memory Leaks**: `<NetworkGraph />` D3 force bindings.
- **Performance Risks**: Large SVG DOM updates on the map during cascades.
- **State Bugs**: Safe. `resetPortStatuses` correctly clears stale state.
- **Dead Components**: None.
- **Unused Hooks**: Everything inside `src/store/slices/*.ts`.
- **Duplicate Logic**: Geographical coordinates and route distances are duplicated in `lib/portData.ts`.

---

## SECTION 8 — BACKEND AUDIT
- **Logic Errors**: The cascade engine BFS drops fractional TEU cargo.
- **Data Integrity Risks**: Simulation history is committed synchronously.
- **Race Conditions**: None found. DB uses appropriate session isolation.
- **Incorrect Assumptions**: Static ID definitions (`autoincrement=False` on Ports) means expanding the network requires full DB resets.
- **Scaling Risks**: `run_cascade` executes a deep copy of the graph (`graph.copy()`) on the main event loop thread. High concurrent traffic to `/simulate` will block the FastAPI event loop.

---

## SECTION 9 — API AUDIT
- `POST /simulate`: 
  - **Request**: `{ port: str, capacity_drop: float }`
  - **Validation**: Strict Pydantic.
  - **Error Handling**: `KeyError` trapped as 404. Generic exceptions trapped as 500.
  - **Missing**: Rate limiting.
- `GET /predict/{id}`:
  - **Failure Modes**: 503 if ML model failed to load.
- `GET /history/list`: Returns last 50 runs.
- `GET /health`: Safe monitoring endpoint.

---

## SECTION 10 — TEST AUDIT
- **Covered Files**: Backend physics (`cascade_engine.py`) and CSV validation (`test_csv_validation.py`).
- **Uncovered Files**: 100% of the Frontend. 100% of FastAPI routes.
- **Missing Tests**: No UI tests (Jest/Cypress). No E2E tests (Playwright). No API integration tests.
- **Coverage Estimate**: ~25% overall.
- **Most Dangerous Untested Areas**: D3 simulation layout math and React DOM reconciliations.

---

## SECTION 11 — BUILD AUDIT
- **TypeScript**: Strict mode enabled. Zero `any` overrides. Flawless.
- **FastAPI**: Clean entrypoint.
- **Docker**: **MISSING**. No `Dockerfile` or `docker-compose.yml` exists.
- **Environment Variables**: Uses `.env` correctly.
- **Deployment Risks**: Cannot be deployed directly to cloud infra without Dockerization or custom PaaS setups.

---

## SECTION 12 — SECURITY AUDIT
- **Secrets**: None hardcoded.
- **Unsafe Inputs**: Handled by Pydantic ranges.
- **Injection Risks**: SQLAlchemy ORM protects against SQLi. Next.js protects against XSS.
- **CORS Issues**: Hardcoded to `localhost`, breaking remote access.
- **Authentication/Authorization**: **MISSING**. The API is completely public.

---

## SECTION 13 — PERFORMANCE AUDIT
- **Large Renders**: `react-simple-maps` drawing 92 bezier routes causes minor GPU strain.
- **Expensive Computations**: `nx.DiGraph.copy()` on the backend. `d3.forceSimulation()` ticking 1000 times synchronously blocks the UI thread for ~100ms.
- **Database Bottlenecks**: SQLite default connection pool locking if deployed without PostgreSQL.

---

## SECTION 14 — COMPLETION ANALYSIS
- **Backend Completion %**: 90%. Physics math is solid. Needs async offloading.
- **Frontend Completion %**: 95%. Visually stunning. Needs map bug fix.
- **Integration Completion %**: 80%. Proxy works locally but breaks in production due to hardcoded CORS.
- **Testing Completion %**: 25%. Severely lacking frontend coverage.
- **Production Readiness %**: 40%. Requires Docker, Auth, Postgres, and CORS fixes.
- **Hackathon Readiness %**: 100%. Unbeatable demo capability.

---

## SECTION 15 — TOP 25 ISSUES (Prioritized Exhaustive List)
1. **Critical**: `IndiaMap.tsx` memory/render thrashing via unmemoized `Set`.
2. **Critical**: `cascade_engine.py` cargo drops out of simulation below 50 TEU.
3. **High**: `main.py` Hardcoded CORS preventing deployment.
4. **High**: Missing `Dockerfile` preventing orchestration.
5. **High**: `NetworkGraph.tsx` D3 Zustand subscriber memory leak.
6. **High**: `simulate.py` executes synchronous BFS math on the main FastAPI thread.
7. **High**: Missing authentication on all API routes.
8. **Medium**: `simulate.py` blocks HTTP response waiting on SQLite commit.
9. **Medium**: `src/lib/portData.ts` duplicates CSV topological truth.
10. **Medium**: SQLite fallback handles concurrent simulations poorly.
11. **Medium**: No frontend test coverage (Jest).
12. **Medium**: No E2E Playwright tests to validate visual cascades.
13. **Low**: `src/store/slices` directory contains abandoned architecture.
14. **Low**: Recharts `ResponsiveContainer` causes layout thrashing.
15. **Low**: API rate limiting is entirely absent.
*(Note: Only 15 actionable issues exist in the repository; the codebase is otherwise exceptionally clean.)*

---

## SECTION 16 — FINAL VERDICT

**Can the project run?** Yes, via standard Node and Python CLI workflows.
**Can the project demo?** Exceedingly well. The UX is spectacular.
**Can the project deploy?** No. Hardcoded CORS and missing Dockerfiles block CI/CD.
**Can the project scale?** No. The synchronous BFS deep copying on FastAPI's main thread will buckle under minimal concurrency.
**Can the project win a hackathon?** Absolutely. The visual storytelling covers the technical debt entirely.

**Remaining Blockers**: CORS, Dockerization, and the React `useMemo` map bug.
**What should be fixed first?** The `IndiaMap.tsx` rendering bug. It requires a 1-line `useMemo` wrapper and saves immense UI performance.

**Brutally Honest Assessment**: ATLAS is a gorgeous, hyper-polished prototype engineered by someone who understands data visualization deeply, but skipped DevOps and React performance fundamentals at the finish line. The backend graph engine is clever but scales poorly. The frontend is stunning but relies on fragile object references. Fix the critical map bug, correct the physics conservation flaw, add a Dockerfile, and this becomes a masterclass repository.
