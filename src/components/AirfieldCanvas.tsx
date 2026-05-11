import { useMemo, useRef, useState } from 'react';

export type Asset = { id: string; label: string; kind: 'runway'|'taxiway'|'hangar'|'ops'|'stand'|'tank'|'refueller'|'parking'; x:number; y:number; w:number; h:number; color:string; draggable?: boolean };
export type Sensor = { id: string; type: 'hydrogen'|'thermal'|'proximity'|'pressure'|'weather'|'multi'; x:number; y:number; radius:number; value:number; unit:string; status:'normal'|'warning'|'critical' };
export type Moving = { id:string; kind:'aircraft'|'vehicle'; x:number; y:number; status:string; color:string; route:{x:number;y:number}[] };

export function AirfieldCanvas({ assets, sensors, movings, heatToggle, onMoveAsset, onMoveSensor }: {
  assets: Asset[]; sensors: Sensor[]; movings: Moving[];
  heatToggle: { hydrogen:boolean; thermal:boolean; movement:boolean; risk:boolean; coverage:boolean; safety:boolean };
  onMoveAsset:(id:string,x:number,y:number)=>void; onMoveSensor:(id:string,x:number,y:number)=>void;
}) {
  const [drag, setDrag] = useState<{type:'asset'|'sensor';id:string;dx:number;dy:number}|null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const gradients = useMemo(() => movings.map((m, i)=>({id:`m-${i}`,x:m.x,y:m.y})),[movings]);
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(980, e.clientX - rect.left - drag.dx));
    const y = Math.max(20, Math.min(560, e.clientY - rect.top - drag.dy));
    drag.type === 'asset' ? onMoveAsset(drag.id,x,y) : onMoveSensor(drag.id,x,y);
  };

  return <svg ref={svgRef} viewBox='0 0 1000 580' className='w-full h-[560px] rounded-xl bg-slate-950 border border-slate-700' onMouseMove={handleMove} onMouseUp={()=>setDrag(null)}>
    <defs>{gradients.map((g)=><radialGradient key={g.id} id={g.id}><stop offset='0%' stopColor='#f97316' stopOpacity='0.45'/><stop offset='100%' stopColor='#f97316' stopOpacity='0'/></radialGradient>)}</defs>
    {heatToggle.hydrogen && <ellipse cx='700' cy='220' rx='180' ry='90' fill='rgba(56,189,248,0.18)'/>}
    {heatToggle.risk && <ellipse cx='700' cy='230' rx='140' ry='70' fill='rgba(239,68,68,0.18)'/>}
    {heatToggle.movement && movings.map((m)=><circle key={`mv-${m.id}`} cx={m.x} cy={m.y} r='42' fill={`url(#m-${movings.indexOf(m)})`} />)}
    {heatToggle.thermal && <ellipse cx='560' cy='340' rx='220' ry='120' fill='rgba(251,146,60,0.15)'/>}
    {assets.map((a)=><g key={a.id} onMouseDown={(e)=>a.draggable!==false&&setDrag({type:'asset',id:a.id,dx:e.nativeEvent.offsetX-a.x,dy:e.nativeEvent.offsetY-a.y})}>
      <rect x={a.x} y={a.y} width={a.w} height={a.h} fill={a.color} opacity={0.95} rx={6}/>
      <text x={a.x+4} y={a.y-4} className='fill-slate-200 text-[11px]'>{a.label}</text>
    </g>)}
    <polyline points='60,80 240,130 460,220 740,300' stroke='#22d3ee' strokeDasharray='5 4' fill='none' />
    {movings.map((m)=><g key={m.id}><circle cx={m.x} cy={m.y} r={m.kind==='aircraft'?10:7} fill={m.color} /><text x={m.x+10} y={m.y-8} className='fill-white text-[10px]'>{m.id} {m.status}</text></g>)}
    {sensors.map((s)=><g key={s.id} onMouseDown={(e)=>setDrag({type:'sensor',id:s.id,dx:e.nativeEvent.offsetX-s.x,dy:e.nativeEvent.offsetY-s.y})}>
      {heatToggle.coverage && <circle cx={s.x} cy={s.y} r={s.radius} fill='rgba(34,197,94,0.08)' stroke='rgba(34,197,94,.4)'/>}
      <circle cx={s.x} cy={s.y} r='7' fill={s.status==='critical'?'#ef4444':s.status==='warning'?'#f59e0b':'#22c55e'} />
      <text x={s.x+8} y={s.y-8} className='fill-slate-100 text-[10px]'>{s.id}</text>
    </g>)}
    {heatToggle.safety && <rect x='610' y='140' width='220' height='180' fill='rgba(239,68,68,0.08)' stroke='rgba(239,68,68,0.6)' strokeDasharray='6 4'/>}
  </svg>;
}
