export type TankLocation = 'North' | 'East' | 'South' | 'West';
export type TankSize = 'Small' | 'Medium' | 'Large';
export type TrafficIntensity = 'Low' | 'Medium' | 'High';

export interface AirfieldMetrics {
  readinessScore: number;
  estimatedDemandKgDay: number;
  activeSensors: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  safetyZoneStatus: 'Compliant' | 'Watch' | 'Action Required';
}
