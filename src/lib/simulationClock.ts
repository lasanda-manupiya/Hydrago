export interface SimulationClockState { minute: number; isPlaying: boolean; speed: number; duration: number }
export const defaultClock: SimulationClockState = { minute: 0, isPlaying: false, speed: 1, duration: 60 };
