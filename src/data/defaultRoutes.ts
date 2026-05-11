import type { RouteDefinition } from '../types/routes';

export const defaultRoutes: RouteDefinition[] = [
  { id: 'hangar-runway', name: 'Hangar to runway', points: [{ x: 170, y: 110 }, { x: 250, y: 180 }, { x: 420, y: 205 }, { x: 700, y: 200 }], restricted: true },
  { id: 'h2-refuel', name: 'Hydrogen storage to refuelling area', points: [{ x: 150, y: 300 }, { x: 260, y: 285 }, { x: 360, y: 270 }] },
  { id: 'refuel-taxi', name: 'Refuelling area to taxiway', points: [{ x: 360, y: 270 }, { x: 460, y: 250 }, { x: 540, y: 220 }] },
  { id: 'taxi-runway', name: 'Taxiway to runway', points: [{ x: 540, y: 220 }, { x: 640, y: 210 }, { x: 730, y: 200 }], restricted: true },
  { id: 'emergency', name: 'Emergency response route', points: [{ x: 60, y: 380 }, { x: 220, y: 300 }, { x: 360, y: 270 }, { x: 700, y: 200 }] },
  { id: 'perimeter', name: 'Perimeter service road', points: [{ x: 40, y: 390 }, { x: 780, y: 390 }, { x: 780, y: 40 }, { x: 40, y: 40 }, { x: 40, y: 390 }] },
];
