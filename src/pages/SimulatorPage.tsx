import { useEffect, useMemo, useState } from 'react';
import { defaultControls, initialSensors } from '../data/simulationDefaults';
import { runSimulation } from '../lib/simulationEngine';
import { defaultClock } from '../lib/simulationClock';
import { TimelineControls } from '../components/TimelineControls';
import { ScenarioExplanation } from '../components/ScenarioExplanation';
import { FlightDemandControls, type FlightDemandState } from '../components/FlightDemandControls';
import { buildFlightSchedule, resolveFlightStatus } from '../lib/flightScheduler';
import { buildSupportDispatches } from '../lib/supportVehicleScheduler';
import { computeHydrogenDemand } from '../lib/hydrogenDemandEngine';
import { HydrogenDemandPanel } from '../components/HydrogenDemandPanel';
import { DemandCharts } from '../components/DemandCharts';

export function SimulatorPage() {
  const [controls] = useState(defaultControls);
  const [sensors] = useState(initialSensors);
  const [clock, setClock] = useState(defaultClock);
  const [demandCfg, setDemandCfg] = useState<FlightDemandState>({ flightsPerHour: 8, simulationDurationMinutes: 120, arrivalIntervalMinutes: 8, aircraftType: 'training aircraft', averageTurnaroundMinutes: 22, refuellingSupport: true, maintenanceSupport: true, emergencyStandby: false, trafficPattern: 'medium' });


  useEffect(() => {
    if (!clock.isPlaying) return;
    const id = setInterval(() => setClock((c) => ({ ...c, minute: Math.min(demandCfg.simulationDurationMinutes, c.minute + 1) })), 1000 / clock.speed);
    return () => clearInterval(id);
  }, [clock.isPlaying, clock.speed, demandCfg.simulationDurationMinutes]);

  const flights = useMemo(() => buildFlightSchedule(demandCfg), [demandCfg]);
  const flightStates = useMemo(() => flights.map((f) => ({ ...f, status: resolveFlightStatus(f, clock.minute) })), [flights, clock.minute]);
  const dispatches = useMemo(() => buildSupportDispatches(flights, { refuellingEnabled: demandCfg.refuellingSupport, maintenanceEnabled: demandCfg.maintenanceSupport, emergencyEnabled: demandCfg.emergencyStandby, trafficPattern: demandCfg.trafficPattern }), [flights, demandCfg]);
  const activeDispatches = dispatches.filter((d) => clock.minute >= d.dispatchTime && clock.minute <= d.returnTime);
  const demand = useMemo(() => computeHydrogenDemand({ flights, dispatches, tankSizeKg: 120, leakSeverity: controls.leakScenario === 'Severe' ? 0.2 : controls.leakScenario === 'Moderate' ? 0.12 : controls.leakScenario === 'Minor' ? 0.05 : 0, trafficIntensity: demandCfg.trafficPattern === 'peak training day' ? 'high' : demandCfg.trafficPattern === 'low' ? 'low' : 'medium' }), [flights, dispatches, controls.leakScenario, demandCfg.trafficPattern]);

  const simulatedVehiclePos = { x: 200 + activeDispatches.length * 8, y: 210 };
  const sim = useMemo(() => runSimulation(sensors, { ...controls, timelineIndex: Math.round((clock.minute / 60) * 100), customHydrogenThreshold: Math.max(300, controls.customHydrogenThreshold - activeDispatches.length * 4), customThermalThreshold: controls.customThermalThreshold - activeDispatches.length * 0.3 }, simulatedVehiclePos), [sensors, controls, clock.minute, activeDispatches.length]);

  const flightsCompleted = flightStates.filter((f) => f.status === 'departed').length;
  const flightsOnStand = flightStates.filter((f) => ['on stand', 'turnaround'].includes(f.status)).length;
  const explanation = `Flight ${flightStates.find((f) => f.status === 'on stand' || f.status === 'turnaround')?.flightId ?? 'N/A'} has arrived at the stand. ${activeDispatches.length} hydrogen-powered support vehicles are active. Tank pressure trend is down as demand grows.`;
  localStorage.setItem('hyready_latest', JSON.stringify({ flightsConfigured: flights.length, flightsCompleted, activeSupportVehicles: activeDispatches.length, demand, highestThermal: sim.highestThermal, highestHydrogen: sim.highestHydrogen, risk: sim.riskScore, alerts: sim.alerts.length, turnaroundDelay: Math.max(0, activeDispatches.length - 2) }));

  return <div className='space-y-4'>
    <div className='rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200'>This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.</div>
    <section className='rounded-xl border border-slate-800 bg-slate-900 p-4'><FlightDemandControls value={demandCfg} onChange={setDemandCfg} /></section>
    <section className='rounded-xl border border-slate-800 bg-slate-900 p-4'><TimelineControls minute={clock.minute} speed={clock.speed} playing={clock.isPlaying} onPlay={() => setClock((c) => ({ ...c, isPlaying: true }))} onPause={() => setClock((c) => ({ ...c, isPlaying: false }))} onReset={() => setClock(defaultClock)} onStep={() => setClock((c) => ({ ...c, minute: Math.min(120, c.minute + 1) }))} onSpeed={(n) => setClock((c) => ({ ...c, speed: n }))} onMinute={(n) => setClock((c) => ({ ...c, minute: n }))} /></section>
    <HydrogenDemandPanel demand={demand} flightsScheduled={flights.length} flightsCompleted={flightsCompleted} trips={dispatches.length} />
    <DemandCharts demand={demand} />
    <div className='grid md:grid-cols-3 gap-3 text-sm'>{[['Aircraft on stand', flightsOnStand], ['Active support vehicles', activeDispatches.length], ['Runway occupancy', flightStates.some((f) => f.status === 'arriving' || f.status === 'taxiing to runway') ? 'Occupied' : 'Clear'], ['Total hydrogen demand', `${(demand.vehicleHydrogenUsedKg + demand.refuellingHydrogenUsedKg).toFixed(2)} kg`], ['Peak hourly demand', `${demand.peakHourlyHydrogenDemandKg} kg`], ['Remaining tank', `${demand.remainingTankCapacityPct}%`], ['Highest thermal', `${sim.highestThermal} °C`], ['Highest hydrogen', `${sim.highestHydrogen} ppm`], ['Safety alerts', sim.alerts.length], ['Operational risk score', sim.riskScore], ['Avg turnaround delay', `${Math.max(0, activeDispatches.length - 2)} min`]].map(([k,v])=><div key={String(k)} className='rounded bg-slate-900 border border-slate-800 p-3'><div className='text-slate-400'>{k}</div><div className='text-xl font-semibold'>{v}</div></div>)}</div>
    <ScenarioExplanation text={explanation} />
  </div>;
}
