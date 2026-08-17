import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './components/layout/RequireAuth';

import { Dashboard } from './pages/Dashboard';
import { Approvals } from './pages/Approvals';
import { Users } from './pages/Users';
import { UserDetails } from './pages/UserDetails';
import { Content } from './pages/Content';
import { Complaints } from './pages/Complaints';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { Regions } from './pages/Regions';
import { Admins } from './pages/Admins';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/content" element={<Content />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:type/:id" element={<UserDetails />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
