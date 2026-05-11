import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AirfieldCanvas, type Asset, type Moving, type Sensor } from '../components/AirfieldCanvas';

const disclaimer = 'This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control output, regulatory approval, or real hydrogen deployment.';

const defaultAssets: Asset[] = [
  { id:'runway',label:'Runway',kind:'runway',x:40,y:70,w:290,h:30,color:'#334155' },
  { id:'taxi',label:'Taxiway',kind:'taxiway',x:220,y:120,w:350,h:18,color:'#475569',draggable:false },
  { id:'hangar',label:'Hangar',kind:'hangar',x:620,y:340,w:130,h:70,color:'#0f766e' },
  { id:'ops',label:'Operations',kind:'ops',x:780,y:360,w:120,h:65,color:'#155e75' },
  { id:'stand',label:'Aircraft Stand',kind:'stand',x:540,y:270,w:95,h:65,color:'#4f46e5' },
  { id:'tank',label:'H₂ Tank',kind:'tank',x:700,y:180,w:55,h:55,color:'#0891b2' },
  { id:'refueller',label:'Refuelling Unit',kind:'refueller',x:640,y:250,w:70,h:42,color:'#0ea5e9' },
  { id:'parking',label:'Support Parking',kind:'parking',x:450,y:420,w:130,h:70,color:'#166534' }
];
const defaultSensors: Sensor[] = Array.from({length:6}).map((_,i)=>({id:['H1','T2','P3','PR4','W5','M6'][i], type:['hydrogen','thermal','proximity','pressure','weather','multi'][i] as Sensor['type'], x:160+i*140,y:440-(i%2)*140,radius:80,value:0,unit:['ppm','°C','events','bar','m/s','mix'][i],status:'normal'}));

export function SimulatorPage(){
  const [assets,setAssets]=useState(defaultAssets); const [sensors,setSensors]=useState(defaultSensors);
  const [minute,setMinute]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(1);
  const [controls,setControls]=useState({flightsPerHour:8,duration:180,arrivalInterval:8,turnaround:22,taxiSpeed:14,tankSize:1200,leak:8,windDir:120,windSpeed:12,traffic:6,vehicleActivity:6});
  const [saved,setSaved]=useState<Record<string,unknown>>({});
  const [layers,setLayers]=useState({hydrogen:true,thermal:true,movement:true,risk:true,coverage:true,safety:true});

  useEffect(()=>{if(!playing)return; const id=setInterval(()=>setMinute((m)=>Math.min(controls.duration,m+1)),800/speed); return()=>clearInterval(id);},[playing,speed,controls.duration]);

  const aircraft = useMemo(()=>{
    const count=Math.max(1,Math.floor((controls.flightsPerHour*controls.duration)/60));
    return Array.from({length:count}).map((_,i)=>{const start=i*controls.arrivalInterval; const t=minute-start; const stand=assets.find(a=>a.id==='stand')!; const runway=assets.find(a=>a.id==='runway')!;
      let x=20,y=80,status='Scheduled';
      if(t>0&&t<12){x=20+t*22;y=80+t*10;status='Arriving';}
      else if(t>=12&&t<24){x=280+(t-12)*20;y=200+(t-12)*4;status='Taxiing';}
      else if(t>=24&&t<24+controls.turnaround){x=stand.x+35;y=stand.y+24;status=t<32?'On stand':'Turnaround';}
      else if(t>=24+controls.turnaround&&t<42+controls.turnaround){x=stand.x-(t-(24+controls.turnaround))*18;y=stand.y-(t-(24+controls.turnaround))*8;status='Departing';}
      else if(t>=42+controls.turnaround){x=runway.x+runway.w-20;y=runway.y+12;status='Departed';}
      return {id:`A${i+1}`,kind:'aircraft' as const,x,y,status,color:'#e2e8f0',route:[]};
    });
  },[minute,controls,assets]);

  const vehicles = useMemo(()=>{const stand=assets.find(a=>a.id==='stand')!; const park=assets.find(a=>a.id==='parking')!;
    const activeAircraft=aircraft.filter(a=>a.status==='On stand'||a.status==='Turnaround').length;
    const types=['Refuel','Tug','Maint','Inspect','Emergency'];
    return Array.from({length:Math.max(1,activeAircraft*Math.max(1,Math.round(controls.vehicleActivity/3)))}).map((_,i)=>{const phase=(minute+i*3)%30; const toStand=phase<15; return {id:`V${i+1}`,kind:'vehicle' as const, x:toStand?park.x+20+(phase*8):stand.x+20+((phase-15)*-8),y:toStand?park.y+22+(phase*2):stand.y+14+((phase-15)*4),status:toStand?'Moving to aircraft':'Returning',color:'#f59e0b',route:[], vehicleType:types[i%types.length],assignedAircraft: aircraft.find(a=>a.status==='On stand')?.id ?? 'N/A'};});
  },[aircraft,assets,minute,controls.vehicleActivity]);

  const movings: Moving[] = [...aircraft,...vehicles];
  const highestHydrogen=Math.max(...sensors.map(s=>s.type==='hydrogen'||s.type==='multi'?s.value:0));
  const highestThermal=Math.max(...sensors.map(s=>s.type==='thermal'||s.type==='multi'?s.value:0));
  const demand=(controls.flightsPerHour*18)+(vehicles.length*2.8)+(controls.leak*1.2)+(controls.traffic*10);
  const remaining=Math.max(0,100-((demand*minute/60)/controls.tankSize)*100);
  const pressure=Math.max(15,320-((100-remaining)*2.2));
  const risk=Math.min(100, Math.round((controls.leak*4)+(vehicles.length*1.7)+(highestHydrogen/12)+(highestThermal/2.5)+(100-remaining)/4));

  useEffect(()=>{
    setSensors((prev)=>prev.map((s)=>{const tank=assets.find(a=>a.id==='tank')!; const dist=Math.hypot(s.x-tank.x,s.y-tank.y); const vehicleHeat=vehicles.reduce((acc,v)=>acc+Math.max(0,70-Math.hypot(s.x-v.x,s.y-v.y))/10,0);
      const prox=[...vehicles,...aircraft].filter(v=>Math.hypot(s.x-v.x,s.y-v.y)<s.radius).length;
      const hydrogen=Math.max(0, (controls.leak*22)+(controls.windSpeed*1.4)-dist/8 + (controls.windDir>90&&controls.windDir<210?18:0));
      const thermal=23+vehicleHeat+ (aircraft.filter(a=>a.status==='Turnaround').length*1.8);
      const value = s.type==='hydrogen'?hydrogen:s.type==='thermal'?thermal:s.type==='proximity'?prox:s.type==='pressure'?pressure:s.type==='weather'?controls.windSpeed:(hydrogen+thermal+prox)/3;
      const status=value>(s.type==='proximity'?6:s.type==='pressure'?80:90)?'critical':value>(s.type==='proximity'?3:s.type==='pressure'?130:55)?'warning':'normal';
      return {...s,value:Number(value.toFixed(1)),status};
    }));
  },[minute,assets,vehicles,aircraft,controls,pressure]);

  const alerts = useMemo(()=>{
    const a:string[]=[]; if(highestHydrogen>80)a.push('Hydrogen critical threshold exceeded.'); else if(highestHydrogen>55)a.push('Hydrogen warning threshold exceeded.');
    if(highestThermal>70)a.push('Thermal anomaly detected near aircraft stand.');
    if(vehicles.some(v=>v.x>610&&v.x<830&&v.y>140&&v.y<320))a.push('Vehicle entered restricted safety zone.');
    if(remaining<30)a.push('High demand reducing tank capacity.'); if(pressure<90)a.push('Tank pressure warning threshold reached.');
    return a;
  },[highestHydrogen,highestThermal,vehicles,remaining,pressure]);

  const trend = Array.from({length:12}).map((_,i)=>({t:i*15,demand:Math.round(demand*(0.5+i/14)),pressure:Math.round(320-(i*17)-(controls.leak*2))}));
  const moveAsset=(id:string,x:number,y:number)=>setAssets((a)=>a.map(it=>it.id===id?{...it,x,y}:it));
  const moveSensor=(id:string,x:number,y:number)=>setSensors((s)=>s.map(it=>it.id===id?{...it,x,y}:it));

  const explanation = `Minute ${minute}: ${aircraft.filter(a=>a.status==='On stand'||a.status==='Turnaround').length} aircraft are on stand and ${vehicles.length} hydrogen-powered vehicles are active. Demand is ${demand.toFixed(1)} kg-equivalent and risk is ${risk}/100. Downwind sensors are elevated under leak severity ${controls.leak}.`;

  return <div className='space-y-3'>
    <div className='rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200'>{disclaimer}</div>
    <div className='grid grid-cols-12 gap-3'>
      <aside className='col-span-12 lg:col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 text-xs'>{Object.entries({flightsPerHour:'Flights/hr',duration:'Duration',arrivalInterval:'Arrival int',turnaround:'Turnaround',taxiSpeed:'Taxi speed',tankSize:'Tank size',leak:'Leak severity',windDir:'Wind dir',windSpeed:'Wind speed',traffic:'Traffic',vehicleActivity:'Vehicle act'}).map(([k,l])=><label key={k} className='block'><span className='text-slate-400'>{l}</span><input type='range' min={k==='windDir'?0:1} max={k==='tankSize'?3000:k==='duration'?360:k==='windDir'?360:k==='flightsPerHour'?30:20} value={(controls as any)[k]} onChange={e=>setControls(c=>({...c,[k]:Number(e.target.value)}))} className='w-full'/><span>{(controls as any)[k]}</span></label>)}
      <div className='grid grid-cols-2 gap-1'>{Object.keys(layers).map((k)=><button key={k} onClick={()=>setLayers((s:any)=>({...s,[k]:!s[k]}))} className='rounded bg-slate-800 px-2 py-1'>{k}</button>)}</div>
      <button className='rounded bg-emerald-600 py-1' onClick={()=>setPlaying(true)}>Run</button><label className='block'>Speed<input type='range' min={1} max={5} value={speed} onChange={e=>setSpeed(Number(e.target.value))} className='w-full'/>{speed}x</label><button className='rounded bg-slate-700 py-1' onClick={()=>setPlaying(false)}>Pause</button><button className='rounded bg-slate-700 py-1' onClick={()=>setMinute((m)=>Math.min(controls.duration,m+1))}>Step</button><button className='rounded bg-slate-700 py-1' onClick={()=>{setMinute(0);setAssets(defaultAssets);setSensors(defaultSensors);}}>Reset</button>
      <button className='rounded bg-indigo-700 py-1' onClick={()=>setSaved((s)=>({...s,A:{assets,sensors,controls}}))}>Save A</button><button className='rounded bg-indigo-700 py-1' onClick={()=>setSaved((s)=>({...s,B:{assets,sensors,controls}}))}>Save B</button><button className='rounded bg-indigo-700 py-1' onClick={()=>setSaved((s)=>({...s,C:{assets,sensors,controls}}))}>Save C</button>
      </aside>
      <main className='col-span-12 lg:col-span-7'><AirfieldCanvas assets={assets} sensors={sensors} movings={movings} heatToggle={layers} onMoveAsset={moveAsset} onMoveSensor={moveSensor} /></main>
      <aside className='col-span-12 lg:col-span-3 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 text-xs'><h3 className='font-semibold'>Sensor readings & alerts</h3>{sensors.map(s=><div key={s.id} className='rounded bg-slate-800 p-2'>{s.id} {s.type}: <b>{s.value} {s.unit}</b> <span className={s.status==='critical'?'text-red-400':s.status==='warning'?'text-amber-400':'text-emerald-400'}>{s.status}</span></div>)}<h4 className='font-semibold pt-2'>Alerts</h4>{alerts.length?alerts.map((a,i)=><div key={i} className='text-amber-300'>• {a}</div>):<div className='text-emerald-400'>No active alerts</div>}<div className='rounded border border-slate-600 p-2 text-slate-200'>{explanation}</div></aside>
    </div>
    <section className='bg-slate-900 border border-slate-700 rounded-xl p-3 grid lg:grid-cols-4 gap-3'>
      <div className='lg:col-span-2'><div className='text-xs text-slate-400 mb-1'>Timeline minute {minute}</div><input type='range' min={0} max={controls.duration} value={minute} onChange={e=>setMinute(Number(e.target.value))} className='w-full' /><ResponsiveContainer width='100%' height={180}><AreaChart data={trend}><CartesianGrid strokeDasharray='3 3' stroke='#334155'/><XAxis dataKey='t' stroke='#94a3b8'/><YAxis stroke='#94a3b8'/><Tooltip /><Area type='monotone' dataKey='demand' stroke='#22d3ee' fill='#0891b288' /><Area type='monotone' dataKey='pressure' stroke='#f59e0b' fill='#f59e0b33' /></AreaChart></ResponsiveContainer></div>
      <div className='space-y-2 text-sm'>{[['Configured flights',Math.floor((controls.flightsPerHour*controls.duration)/60)],['Flights completed',aircraft.filter(a=>a.status==='Departed').length],['Aircraft on stand',aircraft.filter(a=>a.status==='On stand'||a.status==='Turnaround').length],['Active support vehicles',vehicles.length],['Total hydrogen demand',`${demand.toFixed(1)} kg`],['Peak hourly demand',`${(demand*1.32).toFixed(1)} kg`],['Remaining tank',`${remaining.toFixed(1)}%`],['Tank pressure',`${pressure.toFixed(1)} bar`],['Highest hydrogen',highestHydrogen.toFixed(1)],['Highest thermal',highestThermal.toFixed(1)],['Warnings/Critical',alerts.length],['Risk level',`${risk}/100`]].map(([k,v])=><div key={String(k)} className='rounded bg-slate-800 p-2'><span className='text-slate-400'>{k}</span><div className='font-semibold'>{v}</div></div>)}</div>
      <div className='space-y-2 text-xs bg-slate-800 rounded p-3'><h3 className='font-semibold'>Scenario comparison + report</h3><div>Saved scenarios: {Object.keys(saved).join(', ') || 'none'}</div><button className='rounded bg-sky-700 px-2 py-1' onClick={()=>{const blob=new Blob([JSON.stringify({saved,alerts,controls,assets,sensors,disclaimer},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='hyready-report.json'; a.click();}}>Export JSON report</button><button className='rounded bg-sky-700 px-2 py-1 ml-2' onClick={()=>window.print()}>Printable page</button><div className='text-slate-300 pt-2'>CSV export can be generated from the JSON report in spreadsheet tools.</div></div>
    </section>
  </div>;
}
