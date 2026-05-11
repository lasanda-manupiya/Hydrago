import type { SavedScenario, ScenarioControls, Sensor, SimulationOutput } from '../types/sensors';

export function saveScenario(name: string, controls: ScenarioControls, sensors: Sensor[], output: SimulationOutput): SavedScenario {
  return {
    name,
    controls: { ...controls, tankLocation: { ...controls.tankLocation } },
    sensors: sensors.map((s) => ({ ...s, position: { ...s.position } })),
    output: {
      riskScore: output.riskScore,
      riskLevel: output.riskLevel,
      safetyZoneRadius: output.safetyZoneRadius,
      demandForecast: output.demandForecast,
    },
  };
}

export function scenarioMarkdownReport(scenario: SavedScenario): string {
  const sensorRows = scenario.sensors.map((s) => `- ${s.id} (${s.type}) @ (${Math.round(s.position.x)}, ${Math.round(s.position.y)})`).join('\n');
  return `# HyReady-GA Scenario Report: ${scenario.name}\n\n## Summary\n- Risk level: **${scenario.output.riskLevel}** (${scenario.output.riskScore}/100)\n- Safety zone radius: **${scenario.output.safetyZoneRadius}m**\n- Demand forecast index: **${scenario.output.demandForecast}**\n\n## Sensor Layout\n${sensorRows}\n\n## Recommendations\n- Review hangar separation where safety zones approach fixed infrastructure.\n- Consider additional hydrogen and thermal sensors downwind of the tank.\n- Validate assumptions with field-calibrated models before operational use.\n`;
}
