export interface PortData {
  id: number;
  name: string;
  capacity_teu: number;
  baseline_load_teu: number;
  lat: number;
  lon: number;
}

export interface RouteData {
  source_port: number;
  destination_port: number;
  traffic_volume: number;
  distance_nm: number;
}
