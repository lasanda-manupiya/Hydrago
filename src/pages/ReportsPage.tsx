const reports = [
  { title: 'Sensor placement summary', text: 'Lists sensor IDs, types, coordinates, and status history for each scenario run.' },
  { title: 'Scenario comparison', text: 'Compares baseline vs minor/moderate/severe leak assumptions and identifies dominant risk drivers.' },
  { title: 'Risk summary', text: 'Summarises risk score movement, alert count, and operational readiness changes.' },
  { title: 'Heatmap interpretation', text: 'Explains hotspot migration under changing wind direction and tank location inputs.' },
  { title: 'Safety zone recommendation', text: 'Provides exclusion zone radius guidance and overlap implications near hangars and taxiway.' },
];

export function ReportsPage() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map((r) => <article key={r.title} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-semibold">{r.title}</h3><p className="mt-2 text-sm text-slate-300">{r.text}</p><button className="mt-4 rounded bg-cyan-700 px-3 py-2 text-sm">Open mock report</button></article>)}</div>;
}
