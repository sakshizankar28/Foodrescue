// App.jsx - Root application component
// Defines all routes and wraps the app with Navbar and Footer

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import AddFood from './pages/AddFood';
import MyRequests from './pages/MyRequests';

import './index.css';
import './App.css';

// ── Protected Route Helper ────────────────────────────────────────
// Redirects to /login if no token is found in localStorage
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to={user.role === 'donor' ? '/donor-dashboard' : '/ngo-dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/"        element={<Home />} />
          <Route path="/about"   element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Browse food route (accessible to all, action triggers auth if needed) */}
          <Route path="/food" element={<NGODashboard />} />

          {/* User profile (accessible to any authenticated donor or NGO) */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Donor-only routes */}
          <Route path="/donor-dashboard" element={
            <ProtectedRoute requiredRole="donor">
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-food" element={
            <ProtectedRoute requiredRole="donor">
              <AddFood />
            </ProtectedRoute>
          } />

          {/* NGO-only routes */}
          <Route path="/ngo-dashboard" element={
            <ProtectedRoute requiredRole="ngo">
              <NGODashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute requiredRole="ngo">
              <MyRequests />
            </ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '5rem' }}>🍽️</div>
              <h2>Page Not Found</h2>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
