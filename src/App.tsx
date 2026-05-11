import { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { ReportsPage } from './pages/ReportsPage';
import { RiskPage } from './pages/RiskPage';
import { SimulatorPage } from './pages/SimulatorPage';

export default function App() {
  const [page, setPage] = useState<string>('Dashboard');
  return (
    <Layout active={page as any} onChange={setPage as any}>
      {page === 'Dashboard' && <DashboardPage />}
      {page === 'Simulation' && <SimulatorPage />}
      {page === 'Demand Forecasting' && <ForecastPage />}
      {page === 'Risk Assessment' && <RiskPage />}
      {page === 'Reports' && <ReportsPage />}
    </Layout>
  );
}
