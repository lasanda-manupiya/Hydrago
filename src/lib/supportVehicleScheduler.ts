import type { Flight } from '../types/flights';
import type { SupportVehicleDispatch, SupportVehicleType } from '../types/supportVehicles';

const baseRates: Record<SupportVehicleType, number> = {
  'Hydrogen refuelling vehicle': 2.2,
  'Service tug': 1.1,
  'Maintenance vehicle': 1.4,
  'Inspection vehicle': 0.8,
  'Emergency standby vehicle': 0.4,
};

export function buildSupportDispatches(
  flights: Flight[],
  opts: { refuellingEnabled: boolean; maintenanceEnabled: boolean; emergencyEnabled: boolean; trafficPattern: 'low' | 'medium' | 'high' | 'peak training day' }
): SupportVehicleDispatch[] {
  const list: SupportVehicleDispatch[] = [];
  flights.forEach((f, idx) => {
    const make = (vehicleType: SupportVehicleType, offset: number, serviceDuration = 10, distanceKm = 0.9) => {
      const dispatchTime = f.turnaroundStartTime + offset;
      list.push({
        vehicleId: `V-${idx + 1}-${list.length + 1}`,
        vehicleType,
        assignedFlightId: f.flightId,
        dispatchTime,
        route: `YARD-${f.standId}`,
        serviceDuration,
        returnTime: dispatchTime + serviceDuration + 5,
        hydrogenConsumptionRate: baseRates[vehicleType],
        thermalOutput: vehicleType.includes('refuelling') ? 18 : 10,
        status: 'waiting',
        distanceKm,
      });
    };

    make('Service tug', 0, 8, 0.6);
    if (opts.refuellingEnabled) make('Hydrogen refuelling vehicle', 1, 14, 1.2);
    if (opts.maintenanceEnabled) make('Maintenance vehicle', 2, 12, 0.9);
    if (opts.trafficPattern === 'high' || opts.trafficPattern === 'peak training day') {
      make('Service tug', 3, 9, 0.7);
      make('Inspection vehicle', 4, 7, 0.8);
    }
    if (opts.emergencyEnabled) make('Emergency standby vehicle', 0, 30, 0.5);
  });
  return list;
}
