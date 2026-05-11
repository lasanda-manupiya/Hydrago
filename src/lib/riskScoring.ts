export function operationalRiskLevel(score:number){
  if(score>85) return 'Critical';
  if(score>65) return 'High';
  if(score>40) return 'Medium';
  return 'Low';
}
