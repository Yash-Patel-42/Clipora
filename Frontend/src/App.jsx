import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/Landing_Page';
import NewEditingPage from './pages/New_Editing_Page';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/" element={<NewEditingPage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={
          <ProtectedRoute>
            <NewEditingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
