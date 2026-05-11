import type { MovementSchedule } from '../types/movement';

export const defaultMovementScenarios: Record<string, MovementSchedule[]> = {
  'Normal operation': [
    { id: 'gsv-1', type: 'Ground Support Vehicle', name: 'GSV-1', routeId: 'perimeter', speed: 28, startTime: 2, repeatInterval: 8, repeatTrips: 8, active: true, riskContribution: 4 },
    { id: 'ac-1', type: 'Aircraft', name: 'Trainer A', routeId: 'hangar-runway', speed: 18, startTime: 5, repeatInterval: 15, repeatTrips: 3, active: true, riskContribution: 9 },
  ],
  'High traffic flight school peak': [
    { id: 'ref-1', type: 'Refuelling Vehicle', name: 'Refuel-1', routeId: 'h2-refuel', speed: 16, startTime: 4, repeatInterval: 10, repeatTrips: 6, active: true, riskContribution: 10 },
    { id: 'ac-2', type: 'Aircraft', name: 'Trainer B', routeId: 'hangar-runway', speed: 20, startTime: 3, repeatInterval: 10, repeatTrips: 5, active: true, riskContribution: 12 },
  ],
  'Emergency disruption scenario': [
    { id: 'em-1', type: 'Emergency Vehicle', name: 'Crash Response', routeId: 'emergency', speed: 35, startTime: 1, repeatInterval: 20, repeatTrips: 3, active: true, riskContribution: 15 },
  ],
};
