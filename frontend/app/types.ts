export type RiskLevel = "Low" | "Medium" | "High";
export type Status = "Active" | "Restricted" | "Seasonal";

export type Crossing = {
  id: number;
  name: string;
  country: string;
  wait_time: number;
  wait_vs_avg?: number;
  throughput: number;
  throughput_tier?: string;
  commodity: string;
  lat: number;
  lng: number;
  lon?: number;    // ← add this line!
  status: Status;
  risk_level: RiskLevel;
  type: string;
  delay_label?: string;
};
export type Stats = {
  total: number;
  active: number;
  restricted: number;
  seasonal: number;
  avg_wait_time: number;
  high_risk: number;
  total_throughput: number;
  critical_delays: number;
  commodities: Record<string, number>;
  risk_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
};