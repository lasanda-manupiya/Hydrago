export type DemandScenarioClass = 'low' | 'medium' | 'high';

export interface HydrogenDemandSummary {
  vehicleHydrogenUsedKg: number;
  refuellingHydrogenUsedKg: number;
  estimatedDailyHydrogenDemandKg: number;
  estimatedMonthlyHydrogenDemandKg: number;
  peakHourlyHydrogenDemandKg: number;
  remainingTankCapacityPct: number;
  demandScenarioClassification: DemandScenarioClass;
  byVehicleType: Record<string, number>;
  byAircraftType: Record<string, number>;
}
