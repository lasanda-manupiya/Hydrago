export function ScenarioExplanation({ text }: { text: string }) {
  return <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-cyan-100'><h4 className='font-semibold mb-1'>Scenario explanation</h4>{text}</div>;
}
