const fallback = { flightsConfigured: 8, flightsCompleted: 3, activeSupportVehicles: 4, demand: { vehicleHydrogenUsedKg: 12.3, peakHourlyHydrogenDemandKg: 6.1, remainingTankCapacityPct: 88 }, highestThermal: 34, highestHydrogen: 422, risk: 44, alerts: 1, turnaroundDelay: 2 };

export function DashboardPage() {
  const state = (() => { try { return JSON.parse(localStorage.getItem('hyready_latest') || 'null') || fallback; } catch { return fallback; } })();
  const cards = [
    ['Number of configured flights', state.flightsConfigured],
    ['Flights completed', state.flightsCompleted],
    ['Active support vehicles', state.activeSupportVehicles],
    ['Total hydrogen demand', `${state.demand.vehicleHydrogenUsedKg} kg`],
    ['Peak hourly demand', `${state.demand.peakHourlyHydrogenDemandKg} kg`],
    ['Remaining tank capacity', `${state.demand.remainingTankCapacityPct}%`],
    ['Highest thermal reading', `${state.highestThermal} °C`],
    ['Highest hydrogen reading', `${state.highestHydrogen} ppm`],
    ['Safety alerts', state.alerts],
    ['Operational risk score', state.risk],
    ['Average turnaround delay', `${state.turnaroundDelay} min`],
  ];
  return <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>{cards.map(([k, v]) => <div key={String(k)} className='rounded-xl border border-slate-800 bg-slate-900 p-4'><p className='text-xs text-slate-400'>{k}</p><p className='mt-2 text-xl font-semibold'>{v}</p></div>)}</div>;
}
