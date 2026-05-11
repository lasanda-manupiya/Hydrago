import type { Flight, FlightScheduleConfig } from '../types/flights';

export function buildFlightSchedule(config: FlightScheduleConfig): Flight[] {
  const countByRate = Math.floor((config.flightsPerHour * config.simulationDurationMinutes) / 60);
  const countByInterval = Math.floor(config.simulationDurationMinutes / Math.max(1, config.arrivalIntervalMinutes));
  const totalFlights = Math.max(1, Math.min(40, Math.min(countByRate || 1, countByInterval || 1)));

  return Array.from({ length: totalFlights }).map((_, idx) => {
    const arrivalTime = idx * config.arrivalIntervalMinutes;
    const taxiMinutes = 3;
    const turnaroundStartTime = arrivalTime + taxiMinutes;
    const turnaroundEndTime = turnaroundStartTime + config.averageTurnaroundMinutes;
    const departureTime = turnaroundEndTime + 4;
    return {
      flightId: `A${idx + 1}`,
      aircraftType: config.aircraftType,
      arrivalTime,
      taxiRoute: idx % 2 === 0 ? 'RWY-1-TO-STAND-A' : 'RWY-1-TO-STAND-B',
      standId: `ST-${(idx % 4) + 1}`,
      turnaroundStartTime,
      turnaroundEndTime,
      departureTime,
      status: 'scheduled',
    } as Flight;
  });
}

export function resolveFlightStatus(flight: Flight, minute: number): Flight['status'] {
  if (minute < flight.arrivalTime) return 'scheduled';
  if (minute < flight.arrivalTime + 1) return 'arriving';
  if (minute < flight.turnaroundStartTime) return 'taxiing to stand';
  if (minute < flight.turnaroundStartTime + 1) return 'on stand';
  if (minute < flight.turnaroundEndTime) return 'turnaround';
  if (minute < flight.departureTime) return 'taxiing to runway';
  return 'departed';
}
