import { useMemo, useState } from 'react';
import type { TankLocation, TankSize, TrafficIntensity } from '../types';
import { heatmapCells } from '../data/sensorHeatmap';

export function SimulatorPage() {
  const [location, setLocation] = useState<TankLocation>('North');
  const [size, setSize] = useState<TankSize>('Medium');
  const [wind, setWind] = useState('NW');
  const [traffic, setTraffic] = useState<TrafficIntensity>('Medium');

  const output = useMemo(() => {
    const sizeFactor = { Small: 0.8, Medium: 1, Large: 1.3 }[size];
    const trafficFactor = { Low: 0.8, Medium: 1, High: 1.25 }[traffic];
    const risk = Math.round(52 * sizeFactor * trafficFactor + (wind === 'E' ? 8 : 0));
    return {
      zone: Math.round(85 * sizeFactor),
      risk,
      demand: Math.round(420 * sizeFactor * trafficFactor),
      explanation: `Moving tank to ${location} with ${size} capacity under ${traffic} traffic raises operational complexity and safety planning requirements.`,
    };
  }, [location, size, wind, traffic]);

  return <div className="grid gap-4 xl:grid-cols-3"><div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-1">
    {[['Tank location', location, setLocation, ['North', 'East', 'South', 'West']], ['Tank size', size, setSize, ['Small', 'Medium', 'Large']], ['Wind direction', wind, setWind, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']], ['Traffic intensity', traffic, setTraffic, ['Low', 'Medium', 'High']]].map(([label, value, setter, options]) => <label key={String(label)} className="block text-sm"><span className="mb-1 block text-slate-300">{label}</span><select className="w-full rounded bg-slate-800 p-2" value={String(value)} onChange={(e)=> (setter as (v:string)=>void)(e.target.value)}>{(options as string[]).map(o=><option key={o}>{o}</option>)}</select></label>)}
    <div className="rounded bg-slate-800 p-3 text-sm"><p>Safety zone radius: <strong>{output.zone}m</strong></p><p>Risk score: <strong>{output.risk}/100</strong></p><p>Demand estimate: <strong>{output.demand} kg/day</strong></p></div><p className="text-xs text-slate-400">{output.explanation}</p></div>
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-2"><svg viewBox="0 0 800 420" className="w-full rounded bg-slate-950"><rect x="60" y="170" width="680" height="60" fill="#334155"/><rect x="120" y="245" width="520" height="28" fill="#1e293b"/><rect x="120" y="70" width="120" height="70" fill="#475569"/><rect x="560" y="70" width="120" height="70" fill="#475569"/><rect x="350" y="300" width="100" height="45" fill="#0e7490"/>
    <circle cx="120" cy="330" r={output.zone} fill="rgba(239,68,68,0.2)"/><circle cx="120" cy="330" r="18" fill="#f59e0b"/>
    {heatmapCells.map((c, i)=><circle key={i} cx={c.x*7} cy={c.y*4.5} r="8" fill={`rgba(34,211,238,${(c.intensity/100)*0.7})`} />)}</svg></div></div>;
}
