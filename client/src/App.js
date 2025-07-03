import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import PublicSign from './pages/PublicSign';
import AuditTrailPage from './pages/AuditTrailPage';
import AuthPage from "./pages/AuthPage";
import ForgotPassword from './pages/ForgotPassword';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign/:token" element={<PublicSign />} />
         <Route path="/" element={<AuthPage />} />
         <Route path="/forgot" element={<ForgotPassword />} />

        {/* Protected/User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit/:documentId" element={<AuditTrailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
