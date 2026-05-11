import type { HydrogenDemandSummary } from '../types/demand';

export function HydrogenDemandPanel({ demand, flightsScheduled, flightsCompleted, trips }: { demand: HydrogenDemandSummary; flightsScheduled: number; flightsCompleted: number; trips: number }) {
  return <div className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm'>
    <p className='text-slate-300 mb-2'>Hydrogen demand increases as flight arrivals increase because each aircraft requires support vehicle activity. The simulated support vehicles are hydrogen-powered, so additional trips and longer service times increase fuel demand.</p>
    <div className='grid md:grid-cols-3 gap-2'>
      <div>Flights scheduled: <b>{flightsScheduled}</b></div><div>Flights completed: <b>{flightsCompleted}</b></div><div>Support trips: <b>{trips}</b></div>
      <div>Vehicle use: <b>{demand.vehicleHydrogenUsedKg} kg</b></div><div>Refuelling use: <b>{demand.refuellingHydrogenUsedKg} kg</b></div><div>Peak hourly: <b>{demand.peakHourlyHydrogenDemandKg} kg</b></div>
      <div>Daily est.: <b>{demand.estimatedDailyHydrogenDemandKg} kg</b></div><div>Tank left: <b>{demand.remainingTankCapacityPct}%</b></div><div>Class: <b>{demand.demandScenarioClassification}</b></div>
    </div>
  </div>;
}
