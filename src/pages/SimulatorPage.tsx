import { useMemo, useState } from 'react';
import { defaultControls, initialSensors } from '../data/simulationDefaults';
import { saveScenario, scenarioMarkdownReport } from '../lib/scenarios';
import { runSimulation } from '../lib/simulationEngine';
import type { SavedScenario, ScenarioControls, Sensor, SensorType } from '../types/sensors';

const sensorColors: Record<SensorType, string> = { Hydrogen: '#22d3ee', Thermal: '#fb7185', Proximity: '#fbbf24', Pressure: '#a78bfa', Weather: '#34d399' };

export function SimulatorPage() {
  const [controls, setControls] = useState(defaultControls);
  const [sensors, setSensors] = useState(initialSensors);
  const [selectedType, setSelectedType] = useState<SensorType>('Hydrogen');
  const [heatmapType, setHeatmapType] = useState<'Hydrogen' | 'Thermal'>('Hydrogen');
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [opacity, setOpacity] = useState(0.45);
  const [saved, setSaved] = useState<SavedScenario[]>([]);

  const vehicle = useMemo(() => ({ x: 640 - ({ Low: 0, Medium: 70, High: 130 }[controls.trafficIntensity]), y: 295 }), [controls.trafficIntensity]);
  const sim = useMemo(() => runSimulation(sensors, controls, vehicle), [sensors, controls, vehicle]);

  const onMapClick = (evt: React.MouseEvent<SVGSVGElement>) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 800;
    const y = ((evt.clientY - rect.top) / rect.height) * 420;
    setSensors((prev) => [...prev, { id: `S-${String(prev.length + 1).padStart(3, '0')}`, type: selectedType, position: { x, y } }]);
  };

  const doReset = () => { setControls(defaultControls); setSensors(initialSensors); };

  return <div className='space-y-4'>
    <div className='grid gap-4 xl:grid-cols-4'>
      <section className='rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2 text-sm'>
        <h3 className='font-semibold'>Advanced Scenario Controls</h3>
        <label>Tank x<input title='Tank location X' type='range' min={80} max={720} value={controls.tankLocation.x} className='w-full' onChange={(e) => setControls({ ...controls, tankLocation: { ...controls.tankLocation, x: Number(e.target.value) } })} /></label>
        <label>Tank y<input type='range' min={230} max={370} value={controls.tankLocation.y} className='w-full' onChange={(e) => setControls({ ...controls, tankLocation: { ...controls.tankLocation, y: Number(e.target.value) } })} /></label>
        <select className='w-full rounded bg-slate-800 p-2' value={controls.tankSize} onChange={(e) => setControls({ ...controls, tankSize: e.target.value as ScenarioControls['tankSize'] })}><option>Small</option><option>Medium</option><option>Large</option></select>
        <select className='w-full rounded bg-slate-800 p-2' value={controls.leakScenario} onChange={(e) => setControls({ ...controls, leakScenario: e.target.value as ScenarioControls['leakScenario'] })}><option>None</option><option>Minor</option><option>Moderate</option><option>Severe</option></select>
        <label>Wind {controls.windSpeed} m/s<input type='range' min={0} max={30} value={controls.windSpeed} className='w-full' onChange={(e) => setControls({ ...controls, windSpeed: Number(e.target.value) })} /></label>
        <label>Direction {controls.windDirection}°<input type='range' min={0} max={359} value={controls.windDirection} className='w-full' onChange={(e) => setControls({ ...controls, windDirection: Number(e.target.value) })} /></label>
        <select className='w-full rounded bg-slate-800 p-2' value={controls.trafficIntensity} onChange={(e) => setControls({ ...controls, trafficIntensity: e.target.value as ScenarioControls['trafficIntensity'] })}><option>Low</option><option>Medium</option><option>High</option></select>
        <select className='w-full rounded bg-slate-800 p-2' value={controls.timeOfDay} onChange={(e) => setControls({ ...controls, timeOfDay: e.target.value as ScenarioControls['timeOfDay'] })}><option>Day</option><option>Night</option></select>
        <label>Timeline replay ({controls.timelineIndex})<input type='range' min={0} max={100} value={controls.timelineIndex} className='w-full' onChange={(e) => setControls({ ...controls, timelineIndex: Number(e.target.value) })} /></label>
        <label>H2 threshold<input type='number' className='w-full rounded bg-slate-800 p-1' value={controls.customHydrogenThreshold} onChange={(e) => setControls({ ...controls, customHydrogenThreshold: Number(e.target.value) })}/></label>
        <label>Thermal threshold<input type='number' className='w-full rounded bg-slate-800 p-1' value={controls.customThermalThreshold} onChange={(e) => setControls({ ...controls, customThermalThreshold: Number(e.target.value) })}/></label>
        <button className='w-full rounded bg-slate-700 p-2' onClick={doReset}>Reset scenario</button>
      </section>
      <section className='rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-3'>
        <div className='flex gap-2 text-sm mb-2'>
          <select title='Click map to add a sensor' className='rounded bg-slate-800 p-2' value={selectedType} onChange={(e) => setSelectedType(e.target.value as SensorType)}><option>Hydrogen</option><option>Thermal</option><option>Proximity</option><option>Pressure</option><option>Weather</option></select>
          <label><input type='checkbox' checked={heatmapOn} onChange={(e) => setHeatmapOn(e.target.checked)} /> Heatmap</label>
          <select className='rounded bg-slate-800 p-2' value={heatmapType} onChange={(e) => setHeatmapType(e.target.value as 'Hydrogen' | 'Thermal')}><option>Hydrogen</option><option>Thermal</option></select>
          <label>Opacity<input type='range' min={0.1} max={0.9} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}/></label>
        </div>
        <svg viewBox='0 0 800 420' className='w-full rounded bg-slate-950' onClick={onMapClick}>
          {heatmapOn && sim.heatmap.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={11} fill={heatmapType === 'Hydrogen' ? `rgba(239,68,68,${(c.intensity / 100) * opacity})` : `rgba(56,189,248,${(c.intensity / 100) * opacity})`} />)}
          <rect x='120' y='70' width='130' height='75' fill='#475569' /><rect x='550' y='70' width='130' height='75' fill='#475569' />
          <rect x='60' y='170' width='680' height='60' fill='#334155' /><rect x='120' y='245' width='520' height='30' fill='#1e293b' />
          <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r={sim.safetyZoneRadius} fill='rgba(245,158,11,0.11)'/>
          <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r='14' fill='#f59e0b' />
          {sensors.map((s) => <g key={s.id}><circle cx={s.position.x} cy={s.position.y} r='8' fill={sensorColors[s.type]} /><text x={s.position.x + 9} y={s.position.y - 10} className='fill-slate-200 text-[10px]'>{s.id}</text></g>)}
        </svg>
      </section>
    </div>
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'>Risk {sim.riskScore} ({sim.riskLevel})<br/>Demand forecast {sim.demandForecast}</div>
      <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 md:col-span-2'><h4 className='font-semibold'>Alert panel</h4><ul className='text-rose-300 list-disc pl-5'>{sim.alerts.length ? sim.alerts.map((a) => <li key={a}>{a}</li>) : <li>No active alerts</li>}</ul><p className='text-slate-300 mt-2'>{sim.summary}</p></div>
    </div>
    <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm'>
      <h4 className='font-semibold'>Data flow diagram</h4>
      <div className='grid grid-cols-4 md:grid-cols-6 gap-2 mt-2 text-xs'>{['Sensor Input','Validation','Model','Output','Alerts','Reports'].map((stage, i) => <div key={stage} className={`rounded p-2 text-center ${i <= (controls.timelineIndex % 6) ? 'bg-cyan-700' : 'bg-slate-800'}`}>{stage}</div>)}</div>
    </div>
    <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 overflow-x-auto'>
      <table className='w-full text-sm'><thead><tr><th>ID</th><th>Type</th><th>Position</th><th>Reading</th><th>Status</th></tr></thead><tbody>{sim.readings.map((r) => { const s = sensors.find((x) => x.id === r.id) as Sensor; return <tr key={r.id} className='border-t border-slate-800'><td>{r.id}</td><td>{r.type}</td><td>{Math.round(s.position.x)},{Math.round(s.position.y)}</td><td>{r.value} {r.unit}</td><td>{r.status}</td></tr>; })}</tbody></table>
    </div>
    <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'>
      <h4 className='font-semibold'>Scenario comparison & reporting</h4>
      <div className='flex gap-2 mt-2'>
        <button className='rounded bg-cyan-700 px-3 py-2 text-sm' onClick={() => setSaved((prev) => [...prev, saveScenario(`Scenario ${prev.length + 1}`, controls, sensors, sim)])}>Save scenario</button>
      </div>
      <div className='grid md:grid-cols-2 gap-2 mt-2'>{saved.map((s) => <article key={s.name} className='rounded bg-slate-800 p-2 text-sm'><b>{s.name}</b><div>Risk {s.output.riskLevel} ({s.output.riskScore}) | Zone {s.output.safetyZoneRadius}m | Demand {s.output.demandForecast}</div><pre className='mt-2 whitespace-pre-wrap text-xs text-slate-300'>{scenarioMarkdownReport(s)}</pre></article>)}</div>
    </div>
  </div>;
}
