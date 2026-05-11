import type { Point } from './sensors';

export type MovingObjectType = 'Ground Support Vehicle' | 'Refuelling Vehicle' | 'Maintenance Vehicle' | 'Aircraft' | 'Emergency Vehicle';

export interface MovementSchedule {
  id: string;
  type: MovingObjectType;
  name: string;
  routeId: string;
  speed: number;
  startTime: number;
  repeatInterval: number;
  repeatTrips: number;
  active: boolean;
  riskContribution: number;
}

export interface MovingObjectState extends MovementSchedule {
  currentPosition: Point;
  heading: number;
  status: 'Idle' | 'Moving' | 'Runway Occupied' | 'Complete';
}
