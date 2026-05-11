import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AirfieldCanvas, type Asset, type Moving, type Sensor } from '../components/AirfieldCanvas';

const disclaimer = 'This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.';

const defaultAssets: Asset[] = [
  { id:'runway',label:'Runway',kind:'runway',x:30,y:105,w:280,h:32,color:'#334155' },
  { id:'taxi',label:'Taxiway',kind:'taxiway',x:320,y:165,w:280,h:18,color:'#475569' },
  { id:'stand',label:'Aircraft Stand',kind:'stand',x:570,y:220,w:110,h:70,color:'#4f46e5' },
  { id:'hangar',label:'Hangar',kind:'hangar',x:750,y:360,w:140,h:80,color:'#0f766e' },
  { id:'ops',label:'Operations Building',kind:'ops',x:760,y:260,w:145,h:70,color:'#155e75' },
  { id:'generator',label:'Hydrogen Generator',kind:'generator',x:630,y:90,w:120,h:65,color:'#0ea5e9' },
  { id:'tank',label:'Hydrogen Storage Tank',kind:'tank',x:790,y:120,w:70,h:70,color:'#0284c7' },
  { id:'refueller',label:'Hydrogen Refuelling Station',kind:'refueller',x:650,y:285,w:135,h:55,color:'#38bdf8' },
  { id:'parking',label:'Support Vehicle Parking',kind:'parking',x:480,y:430,w:155,h:70,color:'#166534' },
  { id:'serviceRoad',label:'Service Road',kind:'serviceRoad',x:470,y:395,w:220,h:20,color:'#64748b',draggable:false }
];
const defaultSensors: Sensor[] = [
  { id:'H1', type:'hydrogen', x:830, y:210, radius:90, value:0, unit:'ppm', status:'normal' },
  { id:'T2', type:'thermal', x:620, y:360, radius:90, value:0, unit:'°C', status:'normal' },
  { id:'P3', type:'proximity', x:520, y:280, radius:95, value:0, unit:'events', status:'normal' },
  { id:'PR4', type:'pressure', x:780, y:210, radius:70, value:0, unit:'bar', status:'normal' },
  { id:'W5', type:'weather', x:920, y:65, radius:60, value:0, unit:'m/s', status:'normal' },
  { id:'M6', type:'multi', x:700, y:350, radius:90, value:0, unit:'index', status:'normal' }
];

export function SimulatorPage(){
  const [assets,setAssets]=useState(defaultAssets); const [sensors,setSensors]=useState(defaultSensors);
  const [minute,setMinute]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(1); const [selectedId,setSelectedId]=useState<string>('runway');
  const [controls,setControls]=useState({flightsPerHour:8,duration:180,arrivalInterval:8,turnaround:22,taxiSpeed:14,vehicleCount:8,vehicleSpeed:13,fuelThreshold:25,vehicleConsumption:2.4,serviceDuration:14,refuelDuration:10,generatorCapacity:1500,productionRate:62,generatorSpeed:78,tankCapacity:1200,tankStart:900,stationSpeed:9,bays:2,leak:8,windDir:120,windSpeed:12,traffic:6,safetyRadius:110});
  const [layers,setLayers]=useState({hydrogen:true,thermal:true,movement:true,risk:true,coverage:true,safety:true,routes:true,labels:true});

  useEffect(()=>{if(!playing)return; const id=setInterval(()=>setMinute((m)=>Math.min(controls.duration,m+1)),850/speed); return()=>clearInterval(id);},[playing,speed,controls.duration]);

  const aircraft = useMemo(()=>Array.from({length:Math.max(1,Math.floor((controls.flightsPerHour*controls.duration)/60))}).map((_,i)=>{const start=i*controls.arrivalInterval; const t=minute-start; const stand=assets.find(a=>a.id==='stand')!; const runway=assets.find(a=>a.id==='runway')!; let x=20,y=90,status='Scheduled';
    if(t>0&&t<12){x=20+t*23;y=90+t*9;status='Approaching';}
    else if(t>=12&&t<24){x=runway.x+40+(t-12)*18;y=runway.y+8;status='Landing';}
    else if(t>=24&&t<32){x=300+(t-24)*30;y=165+(t-24)*7;status='Taxiing to stand';}
    else if(t>=32&&t<32+controls.turnaround){x=stand.x+40;y=stand.y+30;status=t<40?'On stand':'Turnaround';}
    else if(t>=32+controls.turnaround&&t<50+controls.turnaround){x=stand.x-(t-(32+controls.turnaround))*16;y=stand.y-(t-(32+controls.turnaround))*8;status='Taxiing to runway';}
    else if(t>=50+controls.turnaround&&t<58+controls.turnaround){x=runway.x+120+(t-(50+controls.turnaround))*22;y=runway.y+8;status='Taking off';}
    else if(t>=58+controls.turnaround){x=980;y=60;status='Departed';}
    return {id:`A${i+1}`,kind:'aircraft' as const,x,y,status,color:'#a855f7',route:[]};
  }),[minute,controls,assets]);

  const vehicles = useMemo(()=>{const stand=assets.find(a=>a.id==='stand')!; const park=assets.find(a=>a.id==='parking')!; const ref=assets.find(a=>a.id==='refueller')!; const active=aircraft.filter(a=>a.status==='On stand'||a.status==='Turnaround').length;
    return Array.from({length:controls.vehicleCount}).map((_,i)=>{const phase=(minute+i*4)%40; const fuel=100-((minute*(controls.vehicleConsumption/5)+(i*2))%100); const lowFuel=fuel<controls.fuelThreshold; const supporting=active>0 && phase<20 && !lowFuel;
      const refuelRun=lowFuel || phase>=32; let x=park.x+15+(i%5)*24; let y=park.y+20+Math.floor(i/5)*20; let status='Waiting at support parking'; let task='Idle';
      if(supporting){x=park.x+20+phase*4.8;y=park.y+20-phase*2.3;status='Moving to aircraft';task='Dispatched to aircraft';}
      else if(phase>=20&&phase<30&&!lowFuel){x=stand.x+20+((phase-20)*2);y=stand.y+18;status='Servicing aircraft';task='Service';}
      else if(phase>=30&&!refuelRun){x=stand.x+30-(phase-30)*6;y=stand.y+20+(phase-30)*5;status='Returning to support parking';task='Return';}
      else if(refuelRun){x=ref.x+10+((i%3)*16);y=ref.y+15;status='Refuelling';task='Refuel';}
      return {id:`V${i+1}`,kind:'vehicle' as const,x,y,status,color:'#fb923c',route:[],vehicleType:['Refuel','Tug','Maintenance','Inspection','Emergency'][i%5],fuel:Math.max(5,Number(fuel.toFixed(1))),task};
    });
  },[aircraft,assets,minute,controls]);

  const movings: Moving[] = [...aircraft,...vehicles];
  const demand = vehicles.reduce((a,v)=>a+(100-(v as any).fuel)*0.08,0)+(controls.flightsPerHour*7);
  const produced = minute*(controls.productionRate*(controls.generatorSpeed/100))/60;
  const consumed = minute*(demand/60);
  const tankLevel = Math.max(0, Math.min(controls.tankCapacity, controls.tankStart + produced - consumed - (controls.leak*minute*0.12)));
  const pressure = 40 + (tankLevel/controls.tankCapacity)*260;

  useEffect(()=>{setSensors(prev=>prev.map(s=>{const tank=assets.find(a=>a.id==='tank')!; const dist=Math.hypot(s.x-(tank.x+tank.w/2),s.y-(tank.y+tank.h/2)); const trafficHeat=vehicles.reduce((acc,v)=>acc+Math.max(0,95-Math.hypot(s.x-v.x,s.y-v.y))/11,0);
    const prox=[...vehicles,...aircraft].filter(v=>Math.hypot(s.x-v.x,s.y-v.y)<s.radius).length; const downwind = controls.windDir>80&&controls.windDir<220?1.25:0.8;
    const hydrogen=Math.max(0,(controls.leak*15*downwind)+(controls.windSpeed*1.1)-dist/9); const thermal=22+trafficHeat+(aircraft.filter(a=>a.status==='Turnaround').length*1.3);
    const value=s.type==='hydrogen'?hydrogen:s.type==='thermal'?thermal:s.type==='proximity'?prox:s.type==='pressure'?pressure:s.type==='weather'?controls.windSpeed:(hydrogen+thermal+prox)/3;
    const status=value>(s.type==='proximity'?8:s.type==='pressure'?280:88)?'critical':value>(s.type==='proximity'?4:s.type==='pressure'?160:55)?'warning':'normal';
    return {...s,value:Number(value.toFixed(1)),status};
  }));},[minute,assets,vehicles,aircraft,controls,pressure]);

  const alerts = useMemo(()=>{const a:string[]=[]; if(tankLevel<controls.tankCapacity*0.2)a.push('Tank level low.'); if(controls.productionRate*(controls.generatorSpeed/100)<demand)a.push('Generator production cannot meet demand.'); if(vehicles.filter(v=>v.status==='Refuelling').length>controls.bays)a.push('Refuelling queue increasing.'); if(sensors.some(s=>s.type==='hydrogen'&&s.status!=='normal'))a.push('Hydrogen plume threshold triggered.'); return a;},[tankLevel,controls,demand,sensors,vehicles]);

  const selected = [...assets,...sensors,...movings].find((x:any)=>x.id===selectedId);
  const moveAsset=(id:string,x:number,y:number)=>setAssets((a)=>a.map(it=>it.id===id?{...it,x,y}:it));
  const moveSensor=(id:string,x:number,y:number)=>setSensors((s)=>s.map(it=>it.id===id?{...it,x,y}:it));

  return <div className='space-y-3'>
    <div className='rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200'>{disclaimer}</div>
    <div className='grid grid-cols-12 gap-3'>
      <aside className='col-span-12 lg:col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 text-xs overflow-y-auto max-h-[560px]'>
        {Object.entries({flightsPerHour:'Flights/hr',arrivalInterval:'Arrival interval',turnaround:'Turnaround',vehicleCount:'Vehicles',vehicleSpeed:'Vehicle speed',fuelThreshold:'Fuel threshold',generatorCapacity:'Generator cap',productionRate:'Production rate',generatorSpeed:'Generator speed',tankCapacity:'Tank cap',stationSpeed:'Refuel speed',bays:'Bays',leak:'Leak',windDir:'Wind dir',windSpeed:'Wind speed',traffic:'Traffic'}).map(([k,l])=><label key={k} className='block'><span className='text-slate-400'>{l}</span><input type='range' min={1} max={k.includes('Capacity')?3000:k==='windDir'?360:k==='vehicleCount'?20:120} value={(controls as any)[k]} onChange={e=>setControls(c=>({...c,[k]:Number(e.target.value)}))} className='w-full'/><span>{(controls as any)[k]}</span></label>)}
        <div className='grid grid-cols-2 gap-1'>{Object.keys(layers).map((k)=><button key={k} onClick={()=>setLayers((s:any)=>({...s,[k]:!s[k]}))} className='rounded bg-slate-800 px-2 py-1'>{k}</button>)}</div>
        <div className='flex gap-1 flex-wrap'><button className='rounded bg-emerald-600 px-2 py-1' onClick={()=>setPlaying(true)}>Play</button><button className='rounded bg-slate-700 px-2 py-1' onClick={()=>setPlaying(false)}>Pause</button><button className='rounded bg-slate-700 px-2 py-1' onClick={()=>setMinute((m)=>Math.min(controls.duration,m+1))}>Step</button><button className='rounded bg-slate-700 px-2 py-1' onClick={()=>{setMinute(0);setAssets(defaultAssets);setSensors(defaultSensors);}}>Reset</button></div>
      </aside>
      <main className='col-span-12 lg:col-span-7'>
        <AirfieldCanvas assets={assets} sensors={sensors} movings={movings} heatToggle={layers} onMoveAsset={moveAsset} onMoveSensor={moveSensor} onSelect={setSelectedId} selectedId={selectedId} />
        <div className='mt-2 rounded bg-slate-900 border border-slate-700 p-2 text-xs text-slate-200'>Legend: <span className='text-purple-400'>Aircraft</span> · <span className='text-orange-300'>Support vehicle</span> · <span className='text-sky-300'>Hydrogen assets</span> · <span className='text-cyan-300'>Sensors</span> · <span className='text-red-300'>Safety zone</span></div>
      </main>
      <aside className='col-span-12 lg:col-span-3 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 text-xs'><h3 className='font-semibold'>Object details</h3><div className='rounded bg-slate-800 p-2'>{selected?Object.entries(selected as any).slice(0,9).map(([k,v])=><div key={k}><span className='text-slate-400'>{k}</span>: {String(v)}</div>):'Select an object'}</div><h4 className='font-semibold pt-2'>Alerts</h4>{alerts.length?alerts.map((a,i)=><div key={i} className='text-amber-300'>• {a}</div>):<div className='text-emerald-400'>No active alerts</div>}<div className='rounded border border-slate-600 p-2 text-slate-200'>Minute {minute}: {aircraft.filter(a=>a.status.includes('stand')||a.status==='Turnaround').length} aircraft on stand triggered {vehicles.filter(v=>v.status==='Moving to aircraft').length} dispatches. Hydrogen demand is {demand.toFixed(1)} kg-eq and tank level is {tankLevel.toFixed(1)} kg.</div></aside>
    </div>
    <section className='bg-slate-900 border border-slate-700 rounded-xl p-3 grid lg:grid-cols-4 gap-3'>
      <div className='lg:col-span-2'><div className='text-xs text-slate-400 mb-1'>Timeline minute {minute}</div><input type='range' min={0} max={controls.duration} value={minute} onChange={e=>setMinute(Number(e.target.value))} className='w-full' /><label className='text-xs'>Speed {speed}x<input type='range' min={1} max={6} value={speed} onChange={e=>setSpeed(Number(e.target.value))} className='w-full'/></label><ResponsiveContainer width='100%' height={180}><AreaChart data={Array.from({length:12}).map((_,i)=>({t:i*15,demand:Math.round(demand*(0.5+i/15)),tank:Math.round(tankLevel-(i*18))}))}><CartesianGrid strokeDasharray='3 3' stroke='#334155'/><XAxis dataKey='t' stroke='#94a3b8'/><YAxis stroke='#94a3b8'/><Tooltip /><Area type='monotone' dataKey='demand' stroke='#22d3ee' fill='#0891b288' /><Area type='monotone' dataKey='tank' stroke='#f59e0b' fill='#f59e0b33' /></AreaChart></ResponsiveContainer></div>
      <div className='space-y-2 text-sm'>{[['Flights configured',Math.floor((controls.flightsPerHour*controls.duration)/60)],['Flights completed',aircraft.filter(a=>a.status==='Departed').length],['Aircraft on stand',aircraft.filter(a=>a.status==='On stand'||a.status==='Turnaround').length],['Active support vehicles',vehicles.length],['Vehicles refuelling',vehicles.filter(v=>v.status==='Refuelling').length],['Hydrogen produced',`${produced.toFixed(1)} kg`],['Hydrogen consumed',`${consumed.toFixed(1)} kg`],['Tank level',`${tankLevel.toFixed(1)} kg`],['Tank pressure',`${pressure.toFixed(1)} bar`],['Warnings',alerts.length]].map(([k,v])=><div key={String(k)} className='rounded bg-slate-800 p-2'><span className='text-slate-400'>{k}</span><div className='font-semibold'>{v}</div></div>)}</div>
      <div className='space-y-2 text-xs bg-slate-800 rounded p-3'><h3 className='font-semibold'>Report output</h3><button className='rounded bg-sky-700 px-2 py-1' onClick={()=>{const blob=new Blob([JSON.stringify({scenario:'Custom',controls,assets,sensors,alerts,kpis:{produced,consumed,tankLevel,pressure},disclaimer},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='hyready-report.json'; a.click();}}>Export JSON</button><button className='rounded bg-sky-700 px-2 py-1 ml-2' onClick={()=>window.print()}>Printable page</button><div className='text-slate-300 pt-2'>CSV export available from JSON conversion.</div></div>
    </section>
  </div>;
}
