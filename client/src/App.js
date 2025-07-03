import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import PublicSign from './pages/PublicSign';
import AuditTrailPage from './pages/AuditTrailPage';
import AuthPage from "./pages/AuthPage";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />       {/* Combined Login/Signup */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/sign/:token" element={<PublicSign />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User/Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit/:documentId" element={<AuditTrailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
