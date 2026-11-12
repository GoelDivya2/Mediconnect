import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Protected } from './components/UI.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Doctors from './pages/Doctors.jsx';
import DoctorDetails from './pages/DoctorDetails.jsx';
import Book from './pages/Book.jsx';
import { DoctorDashboard, PatientDashboard } from './pages/Dashboards.jsx';
import Profile from './pages/Profile.jsx';

const Dash = () => { const { user } = useAuth(); return user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />; };
export default function App() {
  return (<>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/book/:id" element={<Protected role="patient"><Book /></Protected>} />
        <Route path="/dashboard" element={<Protected><Dash /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  </>);
}
