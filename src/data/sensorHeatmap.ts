export const heatmapCells = Array.from({ length: 40 }).map((_, i) => ({
  x: (i % 10) * 10 + 5,
  y: Math.floor(i / 10) * 16 + 8,
  intensity: Math.round(((Math.sin(i) + 1) / 2) * 100),
}));
