import { useEffect, useMemo, useState } from 'react';
import { defaultControls, initialSensors } from '../data/simulationDefaults';
import { defaultRoutes } from '../data/defaultRoutes';
import { defaultMovementScenarios } from '../data/defaultMovementScenarios';
import { saveScenario, scenarioMarkdownReport } from '../lib/scenarios';
import { runSimulation } from '../lib/simulationEngine';
import { simulateMovement } from '../lib/movementEngine';
import { defaultClock } from '../lib/simulationClock';
import { MovementControls } from '../components/MovementControls';
import { MovingObjectLayer } from '../components/MovingObjectLayer';
import { RouteLayer } from '../components/RouteLayer';
import { TimelineControls } from '../components/TimelineControls';
import { ScenarioPresetSelector } from '../components/ScenarioPresetSelector';
import { ScenarioExplanation } from '../components/ScenarioExplanation';
import type { MovementSchedule } from '../types/movement';
import type { SavedScenario, SensorType } from '../types/sensors';

const sensorColors: Record<SensorType, string> = { Hydrogen: '#22d3ee', Thermal: '#fb7185', Proximity: '#fbbf24', Pressure: '#a78bfa', Weather: '#34d399' };

export function SimulatorPage() {
  const [controls] = useState(defaultControls); const [sensors, setSensors] = useState(initialSensors);
  const [selectedType, setSelectedType] = useState<SensorType>('Hydrogen'); const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [clock, setClock] = useState(defaultClock); const [preset, setPreset] = useState('Normal operation');
  const [schedules, setSchedules] = useState<MovementSchedule[]>(defaultMovementScenarios[preset]);

  useEffect(() => { setSchedules(defaultMovementScenarios[preset] ?? defaultMovementScenarios['Normal operation']); }, [preset]);
  useEffect(() => { if (!clock.isPlaying) return; const id = setInterval(() => setClock((c) => ({ ...c, minute: Math.min(c.duration, c.minute + 1) })), 1000 / clock.speed); return () => clearInterval(id); }, [clock.isPlaying, clock.speed]);
  const movement = useMemo(() => simulateMovement(schedules, defaultRoutes, clock.minute), [schedules, clock.minute]);
  const vehicle = movement[0]?.currentPosition ?? { x: 640, y: 295 };
  const sim = useMemo(() => runSimulation(sensors, { ...controls, timelineIndex: Math.round((clock.minute / 60) * 100) }, vehicle), [sensors, controls, vehicle, clock.minute]);
  const explanation = `At minute ${clock.minute}, ${movement.filter((m) => m.status === 'Moving' || m.status === 'Runway Occupied').length} moving assets are active. Runway occupancy: ${movement.some((m) => m.status === 'Runway Occupied') ? 'Yes' : 'No'}. Current risk is ${sim.riskLevel} (${sim.riskScore}).`;

  const onMapClick = (evt: React.MouseEvent<SVGSVGElement>) => { const rect = evt.currentTarget.getBoundingClientRect(); const x = ((evt.clientX - rect.left) / rect.width) * 800; const y = ((evt.clientY - rect.top) / rect.height) * 420; setSensors((prev) => [...prev, { id: `S-${String(prev.length + 1).padStart(3, '0')}`, type: selectedType, position: { x, y } }]); };

  return <div className='space-y-4'>
    <div className='rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200'>This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.</div>
    <section className='rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3'>
      <div className='flex flex-wrap gap-3 items-center'><select title='Click map to add a sensor' className='rounded bg-slate-800 p-2 text-sm' value={selectedType} onChange={(e) => setSelectedType(e.target.value as SensorType)}><option>Hydrogen</option><option>Thermal</option><option>Proximity</option><option>Pressure</option><option>Weather</option></select><ScenarioPresetSelector presets={Object.keys(defaultMovementScenarios)} value={preset} onChange={setPreset} /><TimelineControls minute={clock.minute} speed={clock.speed} playing={clock.isPlaying} onPlay={() => setClock((c) => ({ ...c, isPlaying: true }))} onPause={() => setClock((c) => ({ ...c, isPlaying: false }))} onReset={() => setClock(defaultClock)} onStep={() => setClock((c) => ({ ...c, minute: Math.min(60, c.minute + 1) }))} onSpeed={(n) => setClock((c) => ({ ...c, speed: n }))} onMinute={(n) => setClock((c) => ({ ...c, minute: n }))} /></div>
      <MovementControls item={schedules[0]} routes={defaultRoutes} onChange={(v) => setSchedules((prev) => [v, ...prev.slice(1)])} />
    </section>
    <svg viewBox='0 0 800 420' className='w-full rounded bg-slate-950' onClick={onMapClick}>
      {sim.heatmap.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={11} fill={`rgba(239,68,68,${(c.intensity / 100) * 0.35})`} />)}
      <RouteLayer routes={defaultRoutes} />
      <rect x='120' y='70' width='130' height='75' fill='#475569' /><rect x='550' y='70' width='130' height='75' fill='#475569' />
      <rect x='60' y='170' width='680' height='60' fill='#334155' /><rect x='120' y='245' width='520' height='30' fill='#1e293b' />
      <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r={sim.safetyZoneRadius} fill='rgba(245,158,11,0.11)'/>
      <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r='14' fill='#f59e0b' />
      {sensors.map((s) => <circle key={s.id} cx={s.position.x} cy={s.position.y} r='7' fill={sensorColors[s.type]} />)}
      <MovingObjectLayer objects={movement} />
    </svg>
    <ScenarioExplanation text={explanation} />
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'>Runway occupancy {movement.some((m) => m.status === 'Runway Occupied') ? 'Occupied' : 'Clear'}<br/>Active vehicles {movement.filter((m) => m.type !== 'Aircraft' && m.status !== 'Idle').length}<br/>Active aircraft {movement.filter((m) => m.type === 'Aircraft' && m.status !== 'Idle').length}<br/>Alerts {sim.alerts.length}</div>
      <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 md:col-span-2'><ul className='text-rose-300 list-disc pl-5'>{sim.alerts.length ? sim.alerts.map((a) => <li key={a}>{a}</li>) : <li>No active alerts</li>}</ul></div>
    </div>
    <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'>
      <button className='rounded bg-cyan-700 px-3 py-2 text-sm' onClick={() => setSaved((prev) => [...prev, saveScenario(`Scenario ${prev.length + 1}`, controls, sensors, sim)])}>Save scenario</button>
      <div className='grid md:grid-cols-2 gap-2 mt-2'>{saved.map((s) => <article key={s.name} className='rounded bg-slate-800 p-2 text-sm'><b>{s.name}</b><pre className='mt-2 whitespace-pre-wrap text-xs text-slate-300'>{scenarioMarkdownReport(s)}</pre></article>)}</div>
    </div>
  </div>;
}
