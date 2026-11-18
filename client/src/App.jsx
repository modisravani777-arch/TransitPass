import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context';
import Shell from './components/Shell';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/student/Dashboard';
import Apply from './pages/student/Apply';
import Applications from './pages/student/Applications';
import ApplicationDetail from './pages/student/ApplicationDetail';
import Payment from './pages/student/Payment';
import MyPass from './pages/student/MyPass';
import Profile from './pages/student/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUsers from './pages/admin/AdminUsers';
import { AdminRoutes, AdminPassTypes } from './pages/admin/Catalog';
import AdminPasses from './pages/admin/AdminPasses';
import AdminPayments from './pages/admin/AdminPayments';
import VerifyPass from './pages/admin/VerifyPass';
import PassDetails from './pages/PassDetails';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-900" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:number" element={<PassDetails />} />

      <Route path="/app" element={<Guard role="student"><Shell role="student" /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="apply" element={<Apply />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/:id" element={<ApplicationDetail />} />
        <Route path="pay/:id" element={<Payment />} />
        <Route path="pass" element={<MyPass />} />
        <Route path="pass/:id" element={<MyPass />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/admin" element={<Guard role="admin"><Shell role="admin" /></Guard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="pass-types" element={<AdminPassTypes />} />
        <Route path="passes" element={<AdminPasses />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="verify" element={<VerifyPass />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}