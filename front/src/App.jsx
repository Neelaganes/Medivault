import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageDiagnostics from './pages/admin/ManageDiagnostics';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyRecords from './pages/patient/MyRecords';
import ManageAccess from './pages/patient/ManageAccess';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientList from './pages/doctor/PatientList';
import PatientRecords from './pages/doctor/PatientRecords';
import CreateDiagnosticRequest from './pages/doctor/CreateDiagnosticRequest';

// Diagnostic Pages
import DiagnosticDashboard from './pages/diagnostic/DiagnosticDashboard';
import RequestList from './pages/diagnostic/RequestList';
import UnassignedTasks from './pages/diagnostic/UnassignedTasks';

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><Navigate to="/admin/dashboard" replace /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><ManageDoctors /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/diagnostics" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><ManageDiagnostics /></AppLayout></ProtectedRoute>} />

        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><AppLayout><Navigate to="/patient/dashboard" replace /></AppLayout></ProtectedRoute>} />
        <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><AppLayout><PatientDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['patient']}><AppLayout><MyRecords /></AppLayout></ProtectedRoute>} />
        <Route path="/patient/access" element={<ProtectedRoute allowedRoles={['patient']}><AppLayout><ManageAccess /></AppLayout></ProtectedRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><AppLayout><Navigate to="/doctor/dashboard" replace /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><AppLayout><DoctorDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><AppLayout><PatientList /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor/patients/:patientId/records" element={<ProtectedRoute allowedRoles={['doctor']}><AppLayout><PatientRecords /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor/diagnostics" element={<ProtectedRoute allowedRoles={['doctor']}><AppLayout><CreateDiagnosticRequest /></AppLayout></ProtectedRoute>} />
        
        {/* Diagnostic Routes */}
        <Route path="/diagnostic" element={<ProtectedRoute allowedRoles={['diagnostic']}><AppLayout><Navigate to="/diagnostic/dashboard" replace /></AppLayout></ProtectedRoute>} />
        <Route path="/diagnostic/dashboard" element={<ProtectedRoute allowedRoles={['diagnostic']}><AppLayout><DiagnosticDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/diagnostic/requests" element={<ProtectedRoute allowedRoles={['diagnostic']}><AppLayout><RequestList /></AppLayout></ProtectedRoute>} />
        <Route path="/diagnostic/unassigned" element={<ProtectedRoute allowedRoles={['diagnostic']}><AppLayout><UnassignedTasks /></AppLayout></ProtectedRoute>} />

      </Routes>
    </Router>
  );
};

export default App;
