import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/forgotpassword";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/auth/dashboard/Dashboard";
import ProfileSetup from "../pages/auth/dashboard/ProfileSetup";

function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");

  return user ? children : <Navigate to="/auth/login" replace />;
}

function Page({ title }) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <h1 className="text-2xl font-semibold text-[#07111f]">
          {title}
        </h1>
      </div>
    </DashboardLayout>
  );
}

function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route
        path="/auth/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Dashboard */}
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

      {/* My Profile */}
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

      {/* Other modules */}
      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Page title="Transactions" />
          </PrivateRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <PrivateRoute>
            <Page title="Budget" />
          </PrivateRoute>
        }
      />

      <Route
        path="/portfolio"
        element={
          <PrivateRoute>
            <Page title="Portfolio" />
          </PrivateRoute>
        }
      />

      <Route
        path="/security-aml"
        element={
          <PrivateRoute>
            <Page title="Risk & AML" />
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Page title="Reports" />
          </PrivateRoute>
        }
      />

      <Route
        path="/ai-copilot"
        element={
          <PrivateRoute>
            <Page title="AI Copilot" />
          </PrivateRoute>
        }
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/auth/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default AppRouter;