import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import ClientsPage from './pages/ClientsPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { session } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={session ? <DashboardLayout /> : <Navigate to="/auth" />}>
            <Route index element={<KanbanPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/auth"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;