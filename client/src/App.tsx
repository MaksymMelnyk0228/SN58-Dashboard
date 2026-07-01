import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MinerDetailsPage } from './pages/MinerDetailsPage';
import { MinersPage } from './pages/MinersPage';
import { SettingsPage } from './pages/SettingsPage';
import { ValidatorsPage } from './pages/ValidatorsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/validators" element={<ValidatorsPage />} />
        <Route path="/miners" element={<MinersPage />} />
        <Route path="/miners/:id" element={<MinerDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
