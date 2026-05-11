import type { LeakScenario, ScenarioControls, Sensor, SimulatedSensorReading, SimulationOutput } from '../types/sensors';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const leakFactor: Record<LeakScenario, number> = { None: 0, Minor: 0.35, Moderate: 0.7, Severe: 1 };
const trafficFactor = { Low: 0.75, Medium: 1, High: 1.3 };
const tankFactor = { Small: 0.8, Medium: 1, Large: 1.35 };

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function readingStatus(type: SimulatedSensorReading['type'], value: number): SimulatedSensorReading['status'] {
  if (type === 'Hydrogen') return value > 900 ? 'Critical' : value > 550 ? 'Warning' : 'Normal';
  if (type === 'Thermal') return value > 72 ? 'Critical' : value > 55 ? 'Warning' : 'Normal';
  if (type === 'Pressure') return value > 16 ? 'Critical' : value > 12 ? 'Warning' : 'Normal';
  return value < 20 ? 'Critical' : value < 35 ? 'Warning' : 'Normal';
}

export function runSimulation(sensors: Sensor[], controls: ScenarioControls, vehicle: { x: number; y: number }): SimulationOutput {
  const lf = leakFactor[controls.leakScenario];
  const tf = trafficFactor[controls.trafficIntensity];
  const sf = tankFactor[controls.tankSize];
  const windInfluence = controls.windSpeed * 0.02;

  const readings = sensors.map<SimulatedSensorReading>((sensor) => {
    const distTank = distance(sensor.position, controls.tankLocation);
    const distVehicle = distance(sensor.position, vehicle);
    const angleToSensor = Math.atan2(sensor.position.y - controls.tankLocation.y, sensor.position.x - controls.tankLocation.x);
    const windRad = (controls.windDirection * Math.PI) / 180;
    const downwind = (Math.cos(angleToSensor - windRad) + 1) / 2;
    const proximityFactor = 1 / (1 + distTank / 120);
    const noise = (Math.random() - 0.5) * 0.08;

    if (sensor.type === 'Hydrogen') {
      const value = clamp(45 + 1200 * lf * sf * proximityFactor * (0.45 + downwind * 0.8) + 140 * tf + 80 * windInfluence + 60 * noise, 20, 1800);
      return { id: sensor.id, type: sensor.type, value: Math.round(value), unit: 'ppm', status: readingStatus(sensor.type, value) };
    }
    if (sensor.type === 'Thermal') {
      const value = clamp(22 + 28 * lf * sf * proximityFactor + 9 * tf + 3 * downwind + 2 * noise, 18, 95);
      return { id: sensor.id, type: sensor.type, value: Number(value.toFixed(1)), unit: '°C', status: readingStatus(sensor.type, value) };
    }
    if (sensor.type === 'Pressure') {
      const value = clamp(5 + 11 * lf * sf * proximityFactor + 2.5 * tf + noise * 1.5, 2, 20);
      return { id: sensor.id, type: sensor.type, value: Number(value.toFixed(2)), unit: 'bar', status: readingStatus(sensor.type, value) };
    }

    const value = clamp(distVehicle * (0.4 + tf * 0.15) + 10 * (1 - lf) + noise * 2, 5, 200);
    return { id: sensor.id, type: sensor.type, value: Number(value.toFixed(1)), unit: 'm', status: readingStatus(sensor.type, value) };
  });

  const heatmap = Array.from({ length: 190 }).map((_, i) => {
    const x = 50 + (i % 19) * 38;
    const y = 50 + Math.floor(i / 19) * 28;
    const d = distance({ x, y }, controls.tankLocation);
    const windDirectionalBoost = Math.cos((Math.atan2(y - controls.tankLocation.y, x - controls.tankLocation.x) - (controls.windDirection * Math.PI) / 180));
    const intensity = clamp(100 * lf * sf * (1 / (1 + d / 140)) * (1 + 0.4 * windDirectionalBoost) + 16 * tf, 0, 100);
    return { x, y, intensity };
  });

  const safetyZoneRadius = Math.round(60 + 130 * lf * sf + controls.windSpeed * 1.8 + 20 * (tf - 1));
  const criticalCount = readings.filter((r) => r.status === 'Critical').length;
  const warningCount = readings.filter((r) => r.status === 'Warning').length;
  const riskScore = clamp(Math.round(20 + lf * 45 + sf * 17 + tf * 12 + warningCount * 4 + criticalCount * 12), 0, 100);
  const riskLevel = riskScore > 84 ? 'Critical' : riskScore > 65 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';
  const highestHydrogen = Math.max(0, ...readings.filter((r) => r.type === 'Hydrogen').map((r) => r.value as number));
  const highestThermal = Math.max(0, ...readings.filter((r) => r.type === 'Thermal').map((r) => r.value as number));
  const readinessScore = clamp(100 - riskScore + sensors.length * 2, 5, 98);

  const alerts: string[] = [];
  if (highestHydrogen > 550) alerts.push('Hydrogen concentration warning detected near tank corridor.');
  if (highestThermal > 55) alerts.push('Thermal anomaly detected around refuelling support area.');
  if (readings.some((r) => r.type === 'Proximity' && r.value < 20)) alerts.push('Vehicle entered restricted safety zone.');
  if (criticalCount > 0) alerts.push('Sensor threshold breach has triggered critical alert conditions.');
  if (controls.leakScenario === 'Severe') alerts.push('Emergency scenario detected: severe leak with large exclusion zone.');

  const summary = `With a ${controls.tankSize.toLowerCase()} tank and ${controls.leakScenario.toLowerCase()} leak setting, moving storage to x:${Math.round(controls.tankLocation.x)}, y:${Math.round(controls.tankLocation.y)} under ${controls.trafficIntensity.toLowerCase()} traffic shifts risk to ${riskLevel} and expands the exclusion zone to ${safetyZoneRadius}m.`;

  return { readings, heatmap, safetyZoneRadius, riskScore, riskLevel, alerts, summary, highestHydrogen, highestThermal, readinessScore };
}
