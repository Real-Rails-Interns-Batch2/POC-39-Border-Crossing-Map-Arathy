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