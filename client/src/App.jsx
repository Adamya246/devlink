import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DevDashboard from './components/Developer/DevDashboard';
import CompanyDashboard from './components/Company/CompanyDashboard';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'developer'
    ? <Navigate to="/developer" />
    : <Navigate to="/company" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/developer" element={
            <PrivateRoute role="developer"><DevDashboard /></PrivateRoute>
          } />
          <Route path="/company" element={
            <PrivateRoute role="company"><CompanyDashboard /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}