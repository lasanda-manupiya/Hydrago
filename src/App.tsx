import { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { ReportsPage } from './pages/ReportsPage';
import { RiskPage } from './pages/RiskPage';
import { SimulatorPage } from './pages/SimulatorPage';

const defaultPage = 'Dashboard Overview';

export default function App() {
  const [page, setPage] = useState<string>(defaultPage);
  return (
    <Layout active={page} onChange={setPage}>
      {page === 'Dashboard Overview' && <DashboardPage />}
      {page === 'Digital Twin Scenario Simulator' && <SimulatorPage />}
      {page === 'Hydrogen Demand Forecast' && <ForecastPage />}
      {page === 'Risk and Safety Assessment' && <RiskPage />}
      {page === 'Project Evidence / Reports' && <ReportsPage />}
    </Layout>
  );
}
