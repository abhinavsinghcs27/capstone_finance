import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/forgotpassword";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import ProfileSetup from "../pages/dashboard/ProfileSetup";
import Transactions from "../pages/dashboard/Transactions";
import Budget from "../pages/dashboard/Budget";
import Portfolio from "../pages/dashboard/Portfolio";

import UploadStatement from "../pages/upload/UploadStatement";


function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");

  return user ? children : <Navigate to="/auth/login" replace />;
}


function PlaceholderPage({ title }) {
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

      {/* Authentication */}

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


      {/* Profile */}

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


      {/* Statement Upload */}

      <Route
        path="/upload-statement"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <UploadStatement />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* Transactions */}

      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Transactions />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* Budget */}

      <Route
        path="/budget"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Budget />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* Portfolio */}

      <Route
        path="/portfolio"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Portfolio />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* Remaining pages */}

      <Route
        path="/security-aml"
        element={
          <PrivateRoute>
            <PlaceholderPage title="Risk & AML" />
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <PlaceholderPage title="Reports" />
          </PrivateRoute>
        }
      />

      <Route
        path="/ai-copilot"
        element={
          <PrivateRoute>
            <PlaceholderPage title="AI Copilot" />
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