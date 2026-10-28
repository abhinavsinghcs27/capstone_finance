import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/forgotpassword";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import ProfileSetup from "../pages/dashboard/ProfileSetup";
import Transactions from "../pages/dashboard/Transactions";
import Budget from "../pages/dashboard/Budget";
import Goals from "../pages/dashboard/Goals";
import Portfolio from "../pages/dashboard/Portfolio";
import Reports from "../pages/dashboard/Reports";
import RiskIntelligence from "../pages/dashboard/RiskIntelligence";
import AICopilot from "../pages/dashboard/AICopilot";
import TaxSimulator from "../pages/dashboard/TaxSimulator";

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


      {/* Goals & Milestones */}

      <Route
        path="/goals"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Goals />
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
            <DashboardLayout>
              <RiskIntelligence />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/ai-copilot"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AICopilot />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tax-simulator"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <TaxSimulator />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* Route Aliases for backwards compatibility */}
      <Route path="/dashboard/portfolio" element={<Navigate to="/portfolio" replace />} />
      <Route path="/dashboard/transactions" element={<Navigate to="/transactions" replace />} />
      <Route path="/dashboard/goals" element={<Navigate to="/goals" replace />} />
      <Route path="/dashboard/reports" element={<Navigate to="/reports" replace />} />
      <Route path="/dashboard/budget" element={<Navigate to="/budget" replace />} />
      <Route path="/dashboard/security-aml" element={<Navigate to="/security-aml" replace />} />
      <Route path="/dashboard/ai-copilot" element={<Navigate to="/ai-copilot" replace />} />
      <Route path="/dashboard/tax-simulator" element={<Navigate to="/tax-simulator" replace />} />

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