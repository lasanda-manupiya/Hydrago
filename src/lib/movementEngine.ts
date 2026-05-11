import type { MovingObjectState, MovementSchedule } from '../types/movement';
import type { RouteDefinition } from '../types/routes';

const dist = (a: {x:number;y:number}, b:{x:number;y:number}) => Math.hypot(a.x-b.x,a.y-b.y);
const lerp = (a:number,b:number,t:number)=>a+(b-a)*t;

function pointOnRoute(route: RouteDefinition, progress: number){
  const segments = route.points.slice(1).map((p,i)=>dist(route.points[i],p));
  const total = segments.reduce((a,b)=>a+b,0) || 1;
  let target = progress * total;
  for(let i=0;i<segments.length;i++){
    if(target<=segments[i]){
      const t = target/segments[i];
      const a = route.points[i], b = route.points[i+1];
      return { x: lerp(a.x,b.x,t), y: lerp(a.y,b.y,t), heading: Math.atan2(b.y-a.y,b.x-a.x)};
    }
    target -= segments[i];
  }
  const last = route.points[route.points.length-1], prev = route.points[route.points.length-2] ?? last;
  return { x:last.x, y:last.y, heading: Math.atan2(last.y-prev.y,last.x-prev.x)};
}

export function simulateMovement(schedules: MovementSchedule[], routes: RouteDefinition[], minute:number): MovingObjectState[] {
  return schedules.filter(s=>s.active).map((s)=>{
    const route = routes.find(r=>r.id===s.routeId) ?? routes[0];
    const cycle = Math.max(1, s.repeatInterval);
    const elapsed = minute - s.startTime;
    const trip = Math.floor(elapsed / cycle);
    if(elapsed < 0 || trip >= s.repeatTrips) return { ...s, currentPosition: route.points[0], heading: 0, status: 'Idle' };
    const progress = (elapsed % cycle) / cycle;
    const p = pointOnRoute(route, progress);
    const status = s.type === 'Aircraft' && progress > 0.75 ? 'Runway Occupied' : 'Moving';
    return { ...s, currentPosition: {x:p.x,y:p.y}, heading: p.heading, status };
  });
}
