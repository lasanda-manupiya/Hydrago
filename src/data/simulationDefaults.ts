import type { ScenarioControls, Sensor } from '../types/sensors';

export const defaultControls: ScenarioControls = {
  tankLocation: { x: 150, y: 300 },
  tankSize: 'Medium',
  windDirection: 315,
  windSpeed: 12,
  trafficIntensity: 'Medium',
  leakScenario: 'Minor',
  timeOfDay: 'Day',
  timelineIndex: 30,
  customHydrogenThreshold: 550,
  customThermalThreshold: 55,
};

export const initialSensors: Sensor[] = [
  { id: 'S-001', type: 'Hydrogen', position: { x: 220, y: 295 } },
  { id: 'S-002', type: 'Thermal', position: { x: 520, y: 90 } },
  { id: 'S-003', type: 'Pressure', position: { x: 380, y: 312 } },
  { id: 'S-004', type: 'Proximity', position: { x: 680, y: 290 } },
  { id: 'S-005', type: 'Weather', position: { x: 95, y: 85 } },
];
