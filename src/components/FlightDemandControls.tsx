import type { AircraftType } from '../types/flights';

export interface FlightDemandState {
  flightsPerHour: number;
  simulationDurationMinutes: number;
  arrivalIntervalMinutes: number;
  aircraftType: AircraftType;
  averageTurnaroundMinutes: number;
  refuellingSupport: boolean;
  maintenanceSupport: boolean;
  emergencyStandby: boolean;
  trafficPattern: 'low' | 'medium' | 'high' | 'peak training day';
}

export function FlightDemandControls({ value, onChange }: { value: FlightDemandState; onChange: (v: FlightDemandState) => void }) {
  const update = <K extends keyof FlightDemandState>(k: K, v: FlightDemandState[K]) => onChange({ ...value, [k]: v });
  return <div className='grid gap-2 md:grid-cols-5 text-xs'>{[
    ['Flights/hr', 'flightsPerHour'], ['Duration min', 'simulationDurationMinutes'], ['Arrival interval', 'arrivalIntervalMinutes'], ['Turnaround min', 'averageTurnaroundMinutes'],
  ].map(([label, key]) => <label key={key} className='flex flex-col gap-1'>{label}<input className='rounded bg-slate-800 p-2' type='number' value={value[key as keyof FlightDemandState] as number} onChange={(e) => update(key as any, Number(e.target.value))} /></label>)}
  <label className='flex flex-col gap-1'>Aircraft type<select className='rounded bg-slate-800 p-2' value={value.aircraftType} onChange={(e)=>update('aircraftType', e.target.value as AircraftType)}><option>training aircraft</option><option>light GA aircraft</option><option>charter aircraft</option></select></label>
  <label><input type='checkbox' checked={value.refuellingSupport} onChange={(e)=>update('refuellingSupport', e.target.checked)} /> Refuelling support</label>
  <label><input type='checkbox' checked={value.maintenanceSupport} onChange={(e)=>update('maintenanceSupport', e.target.checked)} /> Maintenance support</label>
  <label><input type='checkbox' checked={value.emergencyStandby} onChange={(e)=>update('emergencyStandby', e.target.checked)} /> Emergency standby</label>
  <label className='flex flex-col gap-1'>Traffic preset<select className='rounded bg-slate-800 p-2' value={value.trafficPattern} onChange={(e)=>update('trafficPattern', e.target.value as any)}><option>low</option><option>medium</option><option>high</option><option>peak training day</option></select></label></div>;
}
