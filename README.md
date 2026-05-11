# HyReady-GA Digital Twin Demonstrator (MVP)

A stakeholder-facing, simulation-only MVP for demonstrating how a hydrogen readiness digital twin can support General Aviation airfield planning.

## What this MVP demonstrates
- Dashboard KPIs for readiness, demand, sensors, risk, and safety status.
- Digital twin scenario simulator with configurable tank position/size, wind, and traffic.
- Simulated airfield map with runway, taxiway, hangars, hydrogen tank, safety exclusion zone, and heatmap.
- Demand forecasting views across daily and monthly horizons with three adoption scenarios.
- Risk and safety assessment with risk matrix and dispersion placeholder visualisation.
- Project evidence/report cards for stakeholder review.

## Simulation disclaimer
This MVP uses mock frontend datasets only and does **not** represent certified safety analysis or operational control output.

## Install
```bash
npm install
```

## Run locally
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Mock data sources
- `src/data/airfieldMetrics.ts`
- `src/data/demandForecast.ts`
- `src/data/sensorHeatmap.ts`
- `src/data/riskScenarios.ts`

## Future development steps
1. Add backend services (scenario engine, model orchestration, evidence repository APIs).
2. Replace mock data with validated model outputs and site telemetry integrations.
3. Add geospatial layering and temporal playback.
4. Add user roles, audit trails, and report export workflows.
5. Integrate certified safety workflows and assurance cases.
