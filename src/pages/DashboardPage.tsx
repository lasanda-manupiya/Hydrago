import { airfieldMetrics } from '../data/airfieldMetrics';

export function DashboardPage() {
  const cards = [
    ['Airfield readiness score', `${airfieldMetrics.readinessScore}%`],
    ['Estimated hydrogen demand', `${airfieldMetrics.estimatedDemandKgDay} kg/day`],
    ['Active simulated sensors', airfieldMetrics.activeSensors],
    ['Risk level', airfieldMetrics.riskLevel],
    ['Safety zone status', airfieldMetrics.safetyZoneStatus],
  ];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{cards.map(([k, v]) => <div key={String(k)} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">{k}</p><p className="mt-2 text-xl font-semibold">{v}</p></div>)}</div>;
}
