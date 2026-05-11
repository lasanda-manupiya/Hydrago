# HyReady-GA Hydrogen Readiness Digital Twin MVP

A React + TypeScript + Vite demonstrator for a **simulation-only** hydrogen-readiness digital twin for General Aviation airfields.

## What is simulated
This MVP simulates:
- Airfield assets (runway, taxiway, hangars, hydrogen storage, refuelling area, vehicle movement).
- Virtual sensor placement (Hydrogen, Thermal, Proximity, Pressure).
- Sensor readings influenced by tank size/location, leak severity, wind direction/speed, traffic intensity, and random noise.
- Hydrogen/thermal heatmap intensity, safety exclusion zones, alerts, and risk/readiness KPIs.
- A staged digital workflow panel: Sensor Layer → Data Acquisition → Data Validation → Data Processing → Digital Twin Model → Dashboard Output.

## MVP demonstration scope
This MVP demonstrates the feasibility workflow requested in the appendix-style concept:
- simulated sensors,
- data acquisition,
- validation,
- heatmap generation,
- safety zone evolution,
- scenario testing and plain-English scenario interpretation.

## Disclaimer
> This MVP uses simulated data for demonstration and feasibility purposes only. It does not represent certified safety analysis, operational control, or regulatory approval.

## Run in Codespaces
```bash
npm install
npm run dev
```
Then open the forwarded Vite port.

## Build and check
```bash
npm run build
```

## Key files
- `src/pages/SimulatorPage.tsx` – interactive digital twin canvas, controls, alerts, KPI cards, data pipeline, sensor inventory.
- `src/lib/simulationEngine.ts` – mock simulation engine.
- `src/types/sensors.ts` – sensor/scenario types.
- `src/data/simulationDefaults.ts` – starter sensors and scenario configuration.
- `src/pages/ReportsPage.tsx` – mock report outputs.

## Future development steps
1. Replace random/noise assumptions with calibrated dispersion and thermal sub-models.
2. Add backend persistence, authentication, and scenario versioning.
3. Add time-series history with replay and exportable report generation.
4. Support geospatial coordinates and integration with operational telemetry.
5. Add assurance/certification evidence workflows.
