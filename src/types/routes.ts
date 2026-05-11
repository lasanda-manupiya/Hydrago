import type { Point } from './sensors';

export interface RouteDefinition {
  id: string;
  name: string;
  points: Point[];
  restricted?: boolean;
}
