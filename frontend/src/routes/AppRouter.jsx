import { Routes, Route, Navigate } from "react-router";

import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/forgotpassword";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/auth/dashboard/Dashboard";
import ProfileSetup from "../pages/auth/dashboard/ProfileSetup";

function AppRouter() {
  return (
    <Routes>

      {/* ================= AUTH ROUTES ================= */}

      <Route
        path="/auth/login"
        element={<Login />}
      />

      <Route
        path="/auth/signup"
        element={<Signup />}
      />

      <Route
        path="/auth/forgot-password"
        element={<ForgotPassword />}
      />


      {/* ================= DASHBOARD ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />
        {/* Profile Setup */}
      <Route
        path="/profile-setup"
        element={
          <DashboardLayout>
           <ProfileSetup />
          </DashboardLayout>
        }
      />   


      {/* ================= DEFAULT ================= */}

      <Route
        path="/"
        element={<Navigate to="/auth/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/auth/login" replace />}
      />

    </Routes>
  );
}

export default AppRouter;