import { useMemo, useRef, useState } from 'react';

export type AssetKind =
  | 'runway' | 'taxiway' | 'hangar' | 'ops' | 'stand' | 'generator' | 'tank' | 'refueller' | 'parking' | 'serviceRoad';
export type Asset = { id: string; label: string; kind: AssetKind; x:number; y:number; w:number; h:number; color:string; draggable?: boolean };
export type Sensor = { id: string; type: 'hydrogen'|'thermal'|'proximity'|'pressure'|'weather'|'multi'; x:number; y:number; radius:number; value:number; unit:string; status:'normal'|'warning'|'critical' };
export type Moving = { id:string; kind:'aircraft'|'vehicle'; x:number; y:number; status:string; color:string; route:{x:number;y:number}[] };

export function AirfieldCanvas({ assets, sensors, movings, heatToggle, onMoveAsset, onMoveSensor, onSelect, selectedId }: {
  assets: Asset[]; sensors: Sensor[]; movings: Moving[];
  heatToggle: { hydrogen:boolean; thermal:boolean; movement:boolean; risk:boolean; coverage:boolean; safety:boolean; routes:boolean; labels:boolean };
  onMoveAsset:(id:string,x:number,y:number)=>void; onMoveSensor:(id:string,x:number,y:number)=>void; onSelect:(id:string)=>void; selectedId?:string;
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

  const tank = assets.find(a=>a.id==='tank');
  const generator = assets.find(a=>a.id==='generator');
  const refueller = assets.find(a=>a.id==='refueller');

  return <svg ref={svgRef} viewBox='0 0 1000 580' className='w-full h-[560px] rounded-xl bg-slate-950 border border-slate-700' onMouseMove={handleMove} onMouseUp={()=>setDrag(null)}>
    <defs>{gradients.map((g)=><radialGradient key={g.id} id={g.id}><stop offset='0%' stopColor='#f97316' stopOpacity='0.4'/><stop offset='100%' stopColor='#f97316' stopOpacity='0'/></radialGradient>)}</defs>
    <rect x='0' y='0' width='1000' height='580' fill='#0b1220'/>
    {heatToggle.hydrogen && tank && <ellipse cx={tank.x+40} cy={tank.y+20} rx='170' ry='80' fill='rgba(6,182,212,0.17)'/>}
    {heatToggle.risk && tank && <ellipse cx={tank.x+40} cy={tank.y+20} rx='120' ry='60' fill='rgba(239,68,68,0.12)'/>}
    {heatToggle.thermal && <ellipse cx='520' cy='345' rx='250' ry='125' fill='rgba(251,146,60,0.12)'/>}
    {heatToggle.movement && movings.map((m)=><circle key={`mv-${m.id}`} cx={m.x} cy={m.y} r='36' fill={`url(#m-${movings.indexOf(m)})`} />)}

    {generator && tank && <line x1={generator.x+generator.w} y1={generator.y+generator.h/2} x2={tank.x} y2={tank.y+tank.h/2} stroke='#38bdf8' strokeWidth='3' />}
    {tank && refueller && <line x1={tank.x+tank.w/2} y1={tank.y+tank.h} x2={refueller.x+refueller.w/2} y2={refueller.y} stroke='#38bdf8' strokeWidth='3' />}

    {heatToggle.routes && <>
      <polyline points='20,120 130,120 300,120 470,170 570,220' stroke='#a855f7' strokeWidth='2' strokeDasharray='4 4' fill='none' />
      <polyline points='570,260 500,220 280,140 100,100 20,90' stroke='#9333ea' strokeWidth='2' strokeDasharray='4 4' fill='none' />
      <polyline points='500,465 560,430 590,300' stroke='#fb923c' strokeWidth='2' strokeDasharray='4 4' fill='none' />
    </>}

    {assets.map((a)=><g key={a.id} onMouseDown={(e)=>a.draggable!==false&&setDrag({type:'asset',id:a.id,dx:e.nativeEvent.offsetX-a.x,dy:e.nativeEvent.offsetY-a.y})} onClick={()=>onSelect(a.id)}>
      <rect x={a.x} y={a.y} width={a.w} height={a.h} fill={a.color} opacity={0.96} rx={7} stroke={selectedId===a.id?'#f8fafc':'transparent'} strokeWidth='2'/>
      {heatToggle.labels && <text x={a.x+4} y={a.y-5} className='fill-slate-200 text-[11px]'>{a.label}</text>}
    </g>)}

    {movings.map((m)=><g key={m.id} onClick={()=>onSelect(m.id)}>
      <circle cx={m.x} cy={m.y} r={m.kind==='aircraft'?10:7} fill={m.kind==='aircraft'?'#a855f7':'#fb923c'} stroke={selectedId===m.id?'#fff':'transparent'} />
      {heatToggle.labels && <text x={m.x+10} y={m.y-8} className='fill-white text-[10px]'>{m.id} {m.status}</text>}
    </g>)}

    {sensors.map((s)=><g key={s.id} onMouseDown={(e)=>setDrag({type:'sensor',id:s.id,dx:e.nativeEvent.offsetX-s.x,dy:e.nativeEvent.offsetY-s.y})} onClick={()=>onSelect(s.id)}>
      {heatToggle.coverage && <circle cx={s.x} cy={s.y} r={s.radius} fill='rgba(34,211,238,0.08)' stroke='rgba(34,211,238,.35)'/>}
      <circle cx={s.x} cy={s.y} r='7' fill={s.status==='critical'?'#ef4444':s.status==='warning'?'#f59e0b':'#22c55e'} stroke={selectedId===s.id?'#fff':'transparent'} />
      {heatToggle.labels && <text x={s.x+8} y={s.y-8} className='fill-slate-100 text-[10px]'>{s.id}</text>}
    </g>)}

    {heatToggle.safety && <rect x='610' y='130' width='250' height='210' fill='rgba(239,68,68,0.08)' stroke='rgba(239,68,68,0.7)' strokeDasharray='6 4'/>}
  </svg>;
}
