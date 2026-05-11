import type { LeakScenario, ScenarioControls, Sensor, SimulatedSensorReading, SimulationOutput } from '../types/sensors';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const leakFactor: Record<LeakScenario, number> = { None: 0, Minor: 0.35, Moderate: 0.7, Severe: 1 };
const trafficFactor = { Low: 0.75, Medium: 1, High: 1.3 };
const tankFactor = { Small: 0.8, Medium: 1, Large: 1.35 };

function distance(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }

function readingStatus(reading: SimulatedSensorReading, controls: ScenarioControls): SimulatedSensorReading['status'] {
  if (reading.type === 'Hydrogen') return reading.value > controls.customHydrogenThreshold * 1.5 ? 'Critical' : reading.value > controls.customHydrogenThreshold ? 'Warning' : 'Normal';
  if (reading.type === 'Thermal') return reading.value > controls.customThermalThreshold + 20 ? 'Critical' : reading.value > controls.customThermalThreshold ? 'Warning' : 'Normal';
  if (reading.type === 'Pressure') return reading.value > 16 ? 'Critical' : reading.value > 12 ? 'Warning' : 'Normal';
  if (reading.type === 'Weather') return reading.value > 25 ? 'Critical' : reading.value > 18 ? 'Warning' : 'Normal';
  return reading.value < 20 ? 'Critical' : reading.value < 35 ? 'Warning' : 'Normal';
}

export function runSimulation(sensors: Sensor[], controls: ScenarioControls, vehicle: { x: number; y: number }): SimulationOutput {
  const lf = leakFactor[controls.leakScenario];
  const tf = trafficFactor[controls.trafficIntensity];
  const sf = tankFactor[controls.tankSize];
  const timelinePulse = 1 + Math.sin((controls.timelineIndex / 100) * Math.PI * 2) * 0.1;

  const readings = sensors.map<SimulatedSensorReading>((sensor) => {
    const distTank = distance(sensor.position, controls.tankLocation);
    const distVehicle = distance(sensor.position, vehicle);
    const angleToSensor = Math.atan2(sensor.position.y - controls.tankLocation.y, sensor.position.x - controls.tankLocation.x);
    const windRad = (controls.windDirection * Math.PI) / 180;
    const downwind = (Math.cos(angleToSensor - windRad) + 1) / 2;
    const proximityFactor = 1 / (1 + distTank / 120);
    const noise = (Math.random() - 0.5) * 0.08;

    if (sensor.type === 'Hydrogen') {
      const value = clamp((45 + 1200 * lf * sf * proximityFactor * (0.45 + downwind * 0.8) + 140 * tf + 80 * (controls.windSpeed * 0.02) + 60 * noise) * timelinePulse, 20, 1800);
      const reading = { id: sensor.id, type: sensor.type, value: Math.round(value), unit: 'ppm' as const, status: 'Normal' as const };
      return { ...reading, status: readingStatus(reading, controls) };
    }
    if (sensor.type === 'Thermal') {
      const value = clamp((22 + 28 * lf * sf * proximityFactor + 9 * tf + 3 * downwind + 2 * noise + (controls.timeOfDay === 'Night' ? -3 : 2)) * timelinePulse, 15, 100);
      const reading = { id: sensor.id, type: sensor.type, value: Number(value.toFixed(1)), unit: '°C' as const, status: 'Normal' as const };
      return { ...reading, status: readingStatus(reading, controls) };
    }
    if (sensor.type === 'Pressure') {
      const value = clamp((5 + 11 * lf * sf * proximityFactor + 2.5 * tf + noise * 1.5) * timelinePulse, 2, 20);
      const reading = { id: sensor.id, type: sensor.type, value: Number(value.toFixed(2)), unit: 'bar' as const, status: 'Normal' as const };
      return { ...reading, status: readingStatus(reading, controls) };
    }
    if (sensor.type === 'Weather') {
      const value = clamp((controls.windSpeed + 4 * lf + 2 * noise) * timelinePulse, 0, 35);
      const reading = { id: sensor.id, type: sensor.type, value: Number(value.toFixed(1)), unit: 'm/s' as const, status: 'Normal' as const };
      return { ...reading, status: readingStatus(reading, controls) };
    }

    const value = clamp(distVehicle * (0.4 + tf * 0.15) + 10 * (1 - lf) + noise * 2, 5, 200);
    const reading = { id: sensor.id, type: sensor.type, value: Number(value.toFixed(1)), unit: 'm' as const, status: 'Normal' as const };
    return { ...reading, status: readingStatus(reading, controls) };
  });

  const heatmap = Array.from({ length: 190 }).map((_, i) => {
    const x = 50 + (i % 19) * 38;
    const y = 50 + Math.floor(i / 19) * 28;
    const d = distance({ x, y }, controls.tankLocation);
    const directional = Math.cos((Math.atan2(y - controls.tankLocation.y, x - controls.tankLocation.x) - (controls.windDirection * Math.PI) / 180));
    const intensity = clamp((100 * lf * sf * (1 / (1 + d / 140)) * (1 + 0.4 * directional) + 16 * tf) * timelinePulse, 0, 100);
    return { x, y, intensity };
  });

  const safetyZoneRadius = Math.round(60 + 130 * lf * sf + controls.windSpeed * 1.8 + 20 * (tf - 1));
  const overlapWithHangar = distance(controls.tankLocation, { x: 190, y: 110 }) < safetyZoneRadius || distance(controls.tankLocation, { x: 615, y: 110 }) < safetyZoneRadius;
  const criticalCount = readings.filter((r) => r.status === 'Critical').length;
  const warningCount = readings.filter((r) => r.status === 'Warning').length;
  const riskScore = clamp(Math.round(20 + lf * 45 + sf * 17 + tf * 12 + warningCount * 4 + criticalCount * 12 + (overlapWithHangar ? 10 : 0)), 0, 100);
  const riskLevel = riskScore > 84 ? 'Critical' : riskScore > 65 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';
  const highestHydrogen = Math.max(0, ...readings.filter((r) => r.type === 'Hydrogen').map((r) => r.value));
  const highestThermal = Math.max(0, ...readings.filter((r) => r.type === 'Thermal').map((r) => r.value));
  const readinessScore = clamp(100 - riskScore + sensors.length * 2, 5, 98);
  const demandForecast = Math.round(40 + sf * 25 + tf * 20 + (controls.timeOfDay === 'Day' ? 8 : -6));

  const alerts: string[] = [];
  if (highestHydrogen > controls.customHydrogenThreshold) alerts.push('Hydrogen concentration exceeded configured stakeholder threshold.');
  if (highestThermal > controls.customThermalThreshold) alerts.push('Thermal readings are above configured alert threshold.');
  if (readings.some((r) => r.type === 'Proximity' && r.value < 20)) alerts.push('Vehicle entered restricted safety zone.');
  if (overlapWithHangar) alerts.push('Safety exclusion zone overlaps hangar area and requires mitigation.');

  const summary = `Moving the ${controls.tankSize.toLowerCase()} tank to (${Math.round(controls.tankLocation.x)}, ${Math.round(controls.tankLocation.y)}) with ${controls.leakScenario.toLowerCase()} leak and ${controls.trafficIntensity.toLowerCase()} traffic shifts risk to ${riskLevel}. Higher wind (${controls.windSpeed} m/s @ ${controls.windDirection}°) pushes downwind concentration and changes demand index to ${demandForecast}.`;

  return { readings, heatmap, safetyZoneRadius, riskScore, riskLevel, alerts, summary, highestHydrogen, highestThermal, readinessScore, overlapWithHangar, demandForecast };
}
