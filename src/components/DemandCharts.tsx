import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import type { HydrogenDemandSummary } from '../types/demand';

export function DemandCharts({ demand }: { demand: HydrogenDemandSummary }) {
  const vehicleData = Object.entries(demand.byVehicleType).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  const aircraftData = Object.entries(demand.byAircraftType).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  return <div className='grid gap-4 md:grid-cols-2'>
    <div className='h-64 rounded-xl border border-slate-800 bg-slate-900 p-4'><ResponsiveContainer><BarChart data={vehicleData}><XAxis dataKey='name' hide/><YAxis/><Tooltip/><Bar dataKey='value' fill='#22d3ee' /></BarChart></ResponsiveContainer></div>
    <div className='h-64 rounded-xl border border-slate-800 bg-slate-900 p-4'><ResponsiveContainer><PieChart><Pie data={aircraftData} dataKey='value' nameKey='name' outerRadius={90}>{aircraftData.map((_,i)=><Cell key={i} fill={['#818cf8','#22d3ee','#f59e0b'][i%3]} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
  </div>;
}
