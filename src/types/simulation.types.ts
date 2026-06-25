export type PortStatus = "normal" | "at_risk" | "congested" | "analyzing";

export interface CascadeFrame {
  hopNumber: number;
  portIds: string[];
  status: PortStatus;
}
