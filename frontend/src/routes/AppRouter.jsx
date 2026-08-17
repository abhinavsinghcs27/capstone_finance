import { Routes, Route, Navigate } from "react-router";

import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/forgotpassword";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/auth/dashboard/Dashboard";
import ProfileSetup from "../pages/auth/dashboard/ProfileSetup";

const PrivateRoute = ({ children }) =>
  localStorage.getItem("user") ? children : <Navigate to="/auth/login" replace />;

function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/profile-setup"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <ProfileSetup />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AppRouter;