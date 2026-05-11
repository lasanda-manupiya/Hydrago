export type AircraftType = 'training aircraft' | 'light GA aircraft' | 'charter aircraft';
export type FlightStatus = 'scheduled' | 'arriving' | 'taxiing to stand' | 'on stand' | 'turnaround' | 'taxiing to runway' | 'departed';

export interface FlightScheduleConfig {
  flightsPerHour: number;
  simulationDurationMinutes: number;
  arrivalIntervalMinutes: number;
  aircraftType: AircraftType;
  averageTurnaroundMinutes: number;
}

export interface Flight {
  flightId: string;
  aircraftType: AircraftType;
  arrivalTime: number;
  taxiRoute: string;
  standId: string;
  turnaroundStartTime: number;
  turnaroundEndTime: number;
  departureTime: number;
  status: FlightStatus;
}
