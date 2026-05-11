import { ReactNode } from 'react';

const navItems = ['Dashboard', 'Simulation', 'Demand Forecasting', 'Risk Assessment', 'Reports'] as const;

type NavItem = (typeof navItems)[number];

export function Layout({ active, onChange, children }: { active: NavItem; onChange: (v: NavItem) => void; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-800 bg-slate-900 p-5">
        <h1 className="text-lg font-semibold">HyReady-GA</h1>
        <p className="mt-1 text-xs text-slate-400">Hydrogen Readiness Digital Twin</p>
        <nav className="mt-6 space-y-2">{navItems.map((item) => <button key={item} onClick={() => onChange(item)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${item === active ? 'bg-cyan-700 text-white' : 'bg-slate-800/50 text-slate-300'}`}>{item}</button>)}</nav>
      </aside>
      <main className="ml-72 p-6">
        <header className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4"><h2 className="text-2xl font-semibold">HyReady-GA Interactive Demonstrator</h2></header>
        {children}
        <p className="mt-6 text-xs text-slate-400">This MVP uses simulated data for demonstration purposes only and does not represent certified safety analysis or regulatory approval.</p>
      </main>
    </div>
  );
}
