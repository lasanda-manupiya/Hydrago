export type SensorType = 'Hydrogen' | 'Thermal' | 'Proximity' | 'Pressure';
export type SensorStatus = 'Normal' | 'Warning' | 'Critical';
export type LeakScenario = 'None' | 'Minor' | 'Moderate' | 'Severe';
export type TrafficIntensity = 'Low' | 'Medium' | 'High';
export type TankSize = 'Small' | 'Medium' | 'Large';

export interface Point {
  x: number;
  y: number;
}

export interface Sensor {
  id: string;
  type: SensorType;
  position: Point;
}

export interface ScenarioControls {
  tankLocation: Point;
  tankSize: TankSize;
  windDirection: number;
  windSpeed: number;
  trafficIntensity: TrafficIntensity;
  leakScenario: LeakScenario;
  refreshIntervalMs: number;
}

export interface SimulatedSensorReading {
  id: string;
  type: SensorType;
  value: number;
  unit: 'ppm' | '°C' | 'm' | 'bar';
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
}
