import type { MovingObjectState } from '../types/movement';

const colors: Record<string, string> = { Aircraft: '#f8fafc', 'Emergency Vehicle': '#ef4444', 'Refuelling Vehicle': '#f59e0b', 'Ground Support Vehicle': '#34d399', 'Maintenance Vehicle': '#818cf8' };
export function MovingObjectLayer({ objects }: { objects: MovingObjectState[] }) {
  return <>{objects.map((o) => <g key={o.id} transform={`translate(${o.currentPosition.x},${o.currentPosition.y}) rotate(${(o.heading*180)/Math.PI})`}><circle r='7' fill={colors[o.type] ?? '#22d3ee'} stroke={o.status === 'Runway Occupied' ? '#ef4444' : '#0f172a'} strokeWidth={2} /><line x1='0' y1='0' x2='10' y2='0' stroke='#0f172a' strokeWidth={2} /></g>)}</>;
}
