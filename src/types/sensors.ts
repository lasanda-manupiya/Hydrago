export type SensorType = 'Hydrogen' | 'Thermal' | 'Proximity' | 'Pressure' | 'Weather';
export type SensorStatus = 'Normal' | 'Warning' | 'Critical';
export type LeakScenario = 'None' | 'Minor' | 'Moderate' | 'Severe';
export type TrafficIntensity = 'Low' | 'Medium' | 'High';
export type TankSize = 'Small' | 'Medium' | 'Large';
export type TimeOfDay = 'Day' | 'Night';

export interface Point { x: number; y: number }

export interface Sensor { id: string; type: SensorType; position: Point }

export interface ScenarioControls {
  tankLocation: Point;
  tankSize: TankSize;
  windDirection: number;
  windSpeed: number;
  trafficIntensity: TrafficIntensity;
  leakScenario: LeakScenario;
  timeOfDay: TimeOfDay;
  timelineIndex: number;
  customHydrogenThreshold: number;
  customThermalThreshold: number;
}

export interface SimulatedSensorReading {
  id: string;
  type: SensorType;
  value: number;
  unit: 'ppm' | '°C' | 'm' | 'bar' | 'm/s';
  status: SensorStatus;
}

export interface SimulationOutput {
  readings: SimulatedSensorReading[];
  heatmap: Array<Point & { intensity: number }>;
  safetyZoneRadius: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  alerts: string[];
  summary: string;
  highestHydrogen: number;
  highestThermal: number;
  readinessScore: number;
  overlapWithHangar: boolean;
  demandForecast: number;
}

export interface SavedScenario {
  name: string;
  controls: ScenarioControls;
  sensors: Sensor[];
  output: Pick<SimulationOutput, 'riskScore' | 'riskLevel' | 'safetyZoneRadius' | 'demandForecast'>;
}
