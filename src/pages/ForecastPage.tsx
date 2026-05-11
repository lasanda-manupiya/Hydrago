import { HydrogenDemandPanel } from '../components/HydrogenDemandPanel';
import { DemandCharts } from '../components/DemandCharts';

export function ForecastPage() {
  const state = (() => { try { return JSON.parse(localStorage.getItem('hyready_latest') || 'null'); } catch { return null; } })();
  if (!state) return <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'>Run a simulation to generate demand forecast data.</div>;
  return <div className='space-y-4'><HydrogenDemandPanel demand={state.demand} flightsScheduled={state.flightsConfigured} flightsCompleted={state.flightsCompleted} trips={state.activeSupportVehicles} /><DemandCharts demand={state.demand} /></div>;
}
