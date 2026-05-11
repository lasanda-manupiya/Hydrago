const reports = [
  { title: 'Movement scenario summary', text: 'Summarises selected scenario preset, simulation duration, traffic profile, and active movement schedules.' },
  { title: 'Vehicle and aircraft route schedule', text: 'Lists configured route IDs, start times, repeat intervals, and planned trip counts for ground vehicles and aircraft.' },
  { title: 'Safety and threshold events', text: 'Captures safety zone breaches, restricted-zone entries, runway occupancy conflicts, and sensor threshold exceedances.' },
  { title: 'Heatmap & KPI trend summary', text: 'Explains hydrogen, thermal, operational movement, and risk density hotspot behaviour plus KPI changes over time.' },
  { title: 'Recommended mitigation actions', text: 'Provides plain-language actions: reroute vehicles, delay taxi windows, increase monitoring near hydrogen storage, and trigger emergency routing.' },
];

export function ReportsPage() {
  return <div className='space-y-4'><div className='rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200'>This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.</div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map((r) => <article key={r.title} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-semibold">{r.title}</h3><p className="mt-2 text-sm text-slate-300">{r.text}</p><button className="mt-4 rounded bg-cyan-700 px-3 py-2 text-sm">Open mock report</button></article>)}</div></div>;
}
