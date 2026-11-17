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


function AppRouter() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />

      {/* Authenticated Dashboard Shell (Persistent Single Layout with Outlet) */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/upload-statement" element={<UploadStatement />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/security-aml" element={<RiskIntelligence />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-copilot" element={<AICopilot />} />
        <Route path="/tax-simulator" element={<TaxSimulator />} />
      </Route>

      {/* Route Aliases for backwards compatibility */}
      <Route path="/dashboard/portfolio" element={<Navigate to="/portfolio" replace />} />
      <Route path="/dashboard/transactions" element={<Navigate to="/transactions" replace />} />
      <Route path="/dashboard/goals" element={<Navigate to="/goals" replace />} />
      <Route path="/dashboard/reports" element={<Navigate to="/reports" replace />} />
      <Route path="/dashboard/budget" element={<Navigate to="/budget" replace />} />
      <Route path="/dashboard/security-aml" element={<Navigate to="/security-aml" replace />} />
      <Route path="/dashboard/ai-copilot" element={<Navigate to="/ai-copilot" replace />} />
      <Route path="/dashboard/tax-simulator" element={<Navigate to="/tax-simulator" replace />} />

      {/* Fallback Defaults */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
