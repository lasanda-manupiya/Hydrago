import { useEffect, useMemo, useState } from 'react';
import { defaultControls, initialSensors } from '../data/simulationDefaults';
import { runSimulation } from '../lib/simulationEngine';
import type { ScenarioControls, Sensor, SensorType } from '../types/sensors';

const sensorColors: Record<SensorType, string> = {
  Hydrogen: '#22d3ee',
  Thermal: '#fb7185',
  Proximity: '#fbbf24',
  Pressure: '#a78bfa',
};

export function SimulatorPage() {
  const [controls, setControls] = useState<ScenarioControls>(defaultControls);
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [selectedType, setSelectedType] = useState<SensorType>('Hydrogen');
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

  const vehicle = useMemo(() => ({ x: 640 - ({ Low: 0, Medium: 70, High: 130 }[controls.trafficIntensity]), y: 295 }), [controls.trafficIntensity]);
  const simulation = useMemo(() => runSimulation(sensors, controls, vehicle), [sensors, controls, vehicle, stageIndex]);

  useEffect(() => {
    const cycle = setInterval(() => setStageIndex((s) => (s + 1) % 6), 500);
    const refresh = setInterval(() => setStageIndex((s) => s + 1), controls.refreshIntervalMs);
    return () => {
      clearInterval(cycle);
      clearInterval(refresh);
    };
  }, [controls.refreshIntervalMs]);

  const selectedSensor = sensors.find((s) => s.id === selectedSensorId);

  const onMapClick = (evt: React.MouseEvent<SVGSVGElement>) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 800;
    const y = ((evt.clientY - rect.top) / rect.height) * 420;
    const id = `S-${String(sensors.length + 1).padStart(3, '0')}`;
    setSensors((prev) => [...prev, { id, type: selectedType, position: { x, y } }]);
  };

  return <div className="space-y-4">
    <div className="grid gap-4 xl:grid-cols-4">
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-1 text-sm">
        <h3 className="font-semibold">Scenario Controls</h3>
        <label className="block">Tank size<select className="mt-1 w-full rounded bg-slate-800 p-2" value={controls.tankSize} onChange={(e) => setControls({ ...controls, tankSize: e.target.value as ScenarioControls['tankSize'] })}><option>Small</option><option>Medium</option><option>Large</option></select></label>
        <label className="block">Leak scenario<select className="mt-1 w-full rounded bg-slate-800 p-2" value={controls.leakScenario} onChange={(e) => setControls({ ...controls, leakScenario: e.target.value as ScenarioControls['leakScenario'] })}><option>None</option><option>Minor</option><option>Moderate</option><option>Severe</option></select></label>
        <label className="block">Wind direction ({controls.windDirection}°)<input type="range" min={0} max={359} className="w-full" value={controls.windDirection} onChange={(e) => setControls({ ...controls, windDirection: Number(e.target.value) })} /></label>
        <label className="block">Wind speed {controls.windSpeed} m/s<input type="range" min={1} max={30} className="w-full" value={controls.windSpeed} onChange={(e) => setControls({ ...controls, windSpeed: Number(e.target.value) })} /></label>
        <label className="block">Traffic intensity<select className="mt-1 w-full rounded bg-slate-800 p-2" value={controls.trafficIntensity} onChange={(e) => setControls({ ...controls, trafficIntensity: e.target.value as ScenarioControls['trafficIntensity'] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
        <label className="block">Refresh interval (ms)<input type="number" min={500} step={100} className="mt-1 w-full rounded bg-slate-800 p-2" value={controls.refreshIntervalMs} onChange={(e) => setControls({ ...controls, refreshIntervalMs: Number(e.target.value) || 1500 })} /></label>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">Add sensor type<select className="rounded bg-slate-800 p-2" value={selectedType} onChange={(e) => setSelectedType(e.target.value as SensorType)}><option>Hydrogen</option><option>Thermal</option><option>Proximity</option><option>Pressure</option></select></div>
          <p className="text-xs text-slate-400">Click map to add sensor. Click existing sensor to move. Delete selected below.</p>
        </div>
        <svg viewBox="0 0 800 420" className="w-full rounded bg-slate-950" onClick={onMapClick}>
          {simulation.heatmap.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={12} fill={`rgba(239,68,68,${c.intensity / 180})`} />)}
          <rect x="60" y="170" width="680" height="60" fill="#334155" />
          <rect x="120" y="245" width="520" height="30" fill="#1e293b" />
          <rect x="120" y="70" width="130" height="75" fill="#475569" />
          <rect x="550" y="70" width="130" height="75" fill="#475569" />
          <rect x="355" y="300" width="110" height="45" fill="#0e7490" />
          <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r={simulation.safetyZoneRadius} fill="rgba(245,158,11,0.15)" />
          <circle cx={controls.tankLocation.x} cy={controls.tankLocation.y} r={18} fill="#f59e0b" onClick={(e) => { e.stopPropagation(); setControls({ ...controls, tankLocation: { x: 130 + Math.random() * 560, y: 250 + Math.random() * 90 } }); }} />
          <rect x={vehicle.x - 16} y={vehicle.y - 10} width={32} height={20} fill="#22c55e" />
          {sensors.map((s) => <g key={s.id} onClick={(e) => { e.stopPropagation(); setSelectedSensorId(s.id); setSensors((prev) => prev.map((p) => p.id === s.id ? { ...p, position: { x: p.position.x + 12, y: p.position.y - 8 } } : p)); }}>
            <circle cx={s.position.x} cy={s.position.y} r={8} fill={sensorColors[s.type]} stroke={selectedSensorId === s.id ? '#fff' : 'none'} strokeWidth={2} />
            <text x={s.position.x + 10} y={s.position.y - 10} className="fill-slate-200 text-[10px]">{s.id}</text>
          </g>)}
        </svg>
      </section>
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h4 className="font-semibold">Dashboard Metrics</h4><ul className="mt-2 space-y-1 text-sm text-slate-300"><li>Overall readiness: <strong>{simulation.readinessScore}%</strong></li><li>Highest hydrogen: <strong>{simulation.highestHydrogen} ppm</strong></li><li>Highest thermal: <strong>{simulation.highestThermal} °C</strong></li><li>Active sensors: <strong>{sensors.length}</strong></li><li>Warnings: <strong>{simulation.readings.filter((r) => r.status !== 'Normal').length}</strong></li><li>Risk level: <strong>{simulation.riskLevel}</strong></li></ul></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-2"><h4 className="font-semibold">Alerts & Explanation</h4><ul className="mt-2 list-disc pl-5 text-sm text-rose-300">{simulation.alerts.length ? simulation.alerts.map((a) => <li key={a}>{a}</li>) : <li>No active alerts.</li>}</ul><p className="mt-3 text-sm text-slate-300">{simulation.summary}</p></div>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h4 className="font-semibold">Sensor Inventory</h4>
      <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-400"><th>ID</th><th>Type</th><th>X/Y</th><th>Current value</th><th>Status</th></tr></thead><tbody>{simulation.readings.map((r) => { const s = sensors.find((sensor) => sensor.id === r.id)!; return <tr key={r.id} className="border-t border-slate-800"><td>{r.id}</td><td>{r.type}</td><td>{Math.round(s.position.x)}/{Math.round(s.position.y)}</td><td>{r.value} {r.unit}</td><td>{r.status}</td></tr>; })}</tbody></table></div>
      {selectedSensor && <button className="mt-3 rounded bg-rose-700 px-3 py-2 text-sm" onClick={() => { setSensors((prev) => prev.filter((s) => s.id !== selectedSensor.id)); setSelectedSensorId(null); }}>Delete selected sensor ({selectedSensor.id})</button>}
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h4 className="font-semibold">Data Pipeline View</h4>
      <div className="mt-3 grid gap-2 md:grid-cols-6 text-xs">{['Sensor Layer', 'Data Acquisition', 'Data Validation', 'Data Processing', 'Digital Twin Model', 'Dashboard Output'].map((s, idx) => <div key={s} className={`rounded p-2 text-center ${idx === stageIndex % 6 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300'}`}>{s}</div>)}</div>
    </div>
  </div>;
}
