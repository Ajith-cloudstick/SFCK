import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useERPStore } from './store/useERPStore';

// Head Office (Org level — no sidebar)
import { HeadOffice } from './pages/HeadOffice';
import { OrgEmployees } from './pages/OrgEmployees';
import { OrgWages } from './pages/OrgWages';
import { OrgProduction } from './pages/OrgProduction';

// Estate level (with sidebar layout)
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Production } from './pages/Production';
import { Stock } from './pages/Stock';
import { Wages } from './pages/Wages';
import { Employees } from './pages/Employees';
import { Assignments } from './pages/Assignments';
import { MonthlyReport } from './pages/MonthlyReport';
import { YearlyComparison } from './pages/YearlyComparison';
import { EmployeeDetail } from './pages/EmployeeDetail';
import Blocks from './pages/Blocks';

function App() {
  const initData = useERPStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ─── Head Office (Org Level) ─── */}
          <Route path="/" element={<HeadOffice />} />
          <Route path="/head-office" element={<HeadOffice />} />
          <Route path="/org/employees" element={<OrgEmployees />} />
          <Route path="/org/wages" element={<OrgWages />} />
          <Route path="/org/production" element={<OrgProduction />} />

          {/* ─── Estate Level (scoped sidebar) ─── */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/production" element={<Production />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/wages" element={<Wages />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/monthly-report" element={<MonthlyReport />} />
          <Route path="/yearly-comparison" element={<YearlyComparison />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
