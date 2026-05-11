import type { RouteDefinition } from '../types/routes';

export function RouteLayer({ routes }: { routes: RouteDefinition[] }) {
  return <>{routes.map((r) => <polyline key={r.id} points={r.points.map((p) => `${p.x},${p.y}`).join(' ')} fill='none' stroke={r.restricted ? '#f97316' : '#38bdf8'} strokeDasharray='6 4' strokeWidth={2} opacity={0.7} />)}</>;
}
