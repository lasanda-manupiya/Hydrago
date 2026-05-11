export function ReportsPage() {
  const state = (() => { try { return JSON.parse(localStorage.getItem('hyready_latest') || 'null'); } catch { return null; } })();
  return <div className='space-y-4'><div className='rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200'>This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.</div>
  <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-2'>
    <h3 className='font-semibold'>Simulation report summary</h3>
    <p>Flight schedule summary: {state?.flightsConfigured ?? 0} flights configured, {state?.flightsCompleted ?? 0} completed.</p>
    <p>Support vehicle dispatch summary: {state?.activeSupportVehicles ?? 0} active trips observed with hydrogen-powered servicing.</p>
    <p>Hydrogen demand summary: {state?.demand?.vehicleHydrogenUsedKg ?? 0} kg vehicle ops; peak hourly {state?.demand?.peakHourlyHydrogenDemandKg ?? 0} kg.</p>
    <p>Tank capacity trend: remaining capacity {state?.demand?.remainingTankCapacityPct ?? 0}%.</p>
    <p>Highest sensor readings: thermal {state?.highestThermal ?? 0}°C, hydrogen {state?.highestHydrogen ?? 0} ppm. Alert history count: {state?.alerts ?? 0}.</p>
    <p>Turnaround performance: average delay {state?.turnaroundDelay ?? 0} minutes. Recommended mitigation: stagger stand assignments and reduce crossing conflicts near refuelling zone.</p>
  </div></div>;
}
