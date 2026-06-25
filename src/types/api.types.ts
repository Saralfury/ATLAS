export interface SimulationInput {
  port: string;
  capacity_drop: number;
}

export interface NodeState {
  port_id: number;
  port_name: string;
  status: string;
  current_load: number;
  capacity_limit: number;
  overflow: number;
}

export interface StateTransition {
  port_id: number;
  port_name: string;
  transition: string;
  hop: number;
}

export interface SimulationResult {
  simulation_id: number | null;
  cascade_size: number;
  impacted_ports: string[];
  stranded_cargo_teu: number;
  total_delay_days: number;
  node_states: NodeState[];
  state_transitions: StateTransition[];
}

export interface FeatureBreakdown {
  betweenness_norm: number;
  capacity_utilization_norm: number;
  historical_disruption_norm: number;
  degree_norm: number;
}

export interface RiskAnalysisResult {
  port_name: string;
  risk_score: number;
  criticality_rank: number;
  feature_breakdown: FeatureBreakdown;
}

export interface PredictionResult {
  port_id: number;
  port_name: string;
  congestion_probability: number;
  top_features: Record<string, number>;
}

export interface SimulationSummary {
  id: number;
  port: string;
  capacity_drop: number;
  cascade_size: number;
  created_at: string;
}

export interface BeforeState {
  description: string;
  total_nodes: number;
  total_edges: number;
  all_statuses: string;
}

export interface ReplayResult {
  event_id: number;
  simulation_input: SimulationInput;
  before_state: BeforeState;
  after_state: SimulationResult;
  changed_nodes: string[];
  comparison_metrics: Record<string, unknown>;
}

export interface HealthResult {
  status: string;
  graph_nodes: number;
  graph_edges: number;
  model_loaded: boolean;
}
