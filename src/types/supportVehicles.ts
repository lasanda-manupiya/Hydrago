export type SupportVehicleType =
  | 'Hydrogen refuelling vehicle'
  | 'Service tug'
  | 'Maintenance vehicle'
  | 'Inspection vehicle'
  | 'Emergency standby vehicle';

export type SupportVehicleStatus = 'waiting' | 'dispatched' | 'moving to aircraft' | 'servicing aircraft' | 'returning' | 'completed';

export interface SupportVehicleDispatch {
  vehicleId: string;
  vehicleType: SupportVehicleType;
  assignedFlightId: string;
  dispatchTime: number;
  route: string;
  serviceDuration: number;
  returnTime: number;
  hydrogenConsumptionRate: number;
  thermalOutput: number;
  status: SupportVehicleStatus;
  distanceKm: number;
}
