import type { Flight } from '../types/flights';
import type { HydrogenDemandSummary } from '../types/demand';
import type { SupportVehicleDispatch } from '../types/supportVehicles';

export function computeHydrogenDemand(params: {
  flights: Flight[];
  dispatches: SupportVehicleDispatch[];
  tankSizeKg: number;
  leakSeverity: number;
  trafficIntensity: 'low' | 'medium' | 'high';
}): HydrogenDemandSummary {
  const intensityFactor = params.trafficIntensity === 'high' ? 1.2 : params.trafficIntensity === 'medium' ? 1 : 0.85;
  const vehicleUse = params.dispatches.reduce((s, d) => s + d.hydrogenConsumptionRate * (d.serviceDuration / 60) * d.distanceKm * intensityFactor, 0);
  const refuelUse = params.dispatches.filter((d) => d.vehicleType === 'Hydrogen refuelling vehicle').reduce((s, d) => s + 3.4 * (d.serviceDuration / 60), 0);
  const leakLoss = (vehicleUse + refuelUse) * params.leakSeverity;
  const total = vehicleUse + refuelUse + leakLoss;
  const remainingPct = Math.max(0, ((params.tankSizeKg - total) / params.tankSizeKg) * 100);
  const byVehicleType: Record<string, number> = {};
  params.dispatches.forEach((d) => {
    byVehicleType[d.vehicleType] = (byVehicleType[d.vehicleType] || 0) + d.hydrogenConsumptionRate * (d.serviceDuration / 60) * d.distanceKm;
  });
  const byAircraftType: Record<string, number> = {};
  params.flights.forEach((f) => { byAircraftType[f.aircraftType] = (byAircraftType[f.aircraftType] || 0) + total / Math.max(1, params.flights.length); });

  return {
    vehicleHydrogenUsedKg: Number(vehicleUse.toFixed(2)),
    refuellingHydrogenUsedKg: Number(refuelUse.toFixed(2)),
    estimatedDailyHydrogenDemandKg: Number((total * (1440 / 120)).toFixed(1)),
    estimatedMonthlyHydrogenDemandKg: Number((total * 30 * (1440 / 120)).toFixed(1)),
    peakHourlyHydrogenDemandKg: Number((total / 2).toFixed(2)),
    remainingTankCapacityPct: Number(remainingPct.toFixed(1)),
    demandScenarioClassification: total > 35 ? 'high' : total > 15 ? 'medium' : 'low',
    byVehicleType,
    byAircraftType,
  };
}
