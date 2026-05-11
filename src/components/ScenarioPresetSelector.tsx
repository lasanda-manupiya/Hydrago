export function ScenarioPresetSelector({ presets, value, onChange }: { presets: string[]; value: string; onChange: (v: string) => void }) {
  return <label className='text-sm'>Scenario preset<select className='ml-2 rounded bg-slate-800 p-2' value={value} onChange={(e)=>onChange(e.target.value)}>{presets.map((p)=><option key={p}>{p}</option>)}</select></label>;
}
