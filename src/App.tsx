  import React from 'react';
import './App.css';
import { GoalProvider } from './context/GoalContext';
import { GoalListProvider } from './context/GoalListContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext'; // Import UserProvider
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Nav/Navbar';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Settings from './components/Settings/Settings';
import Auth from './components/Auth/Auth';
import { useAuth } from './context/AuthContext';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const ProtectedRouteWrapper: React.FC<{ element: React.ReactNode }> = ({ element }) => (
  <ProtectedRoute>
    <>
      <Navbar />
      <div className="pt-10">
        {element}
      </div>
    </>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <GoalListProvider>
          <GoalProvider>
            <Router>
              <div className="App min-h-screen bg-background-light dark:bg-background-dark">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRouteWrapper element={<Dashboard />} />} />
                  <Route path="/settings" element={<ProtectedRouteWrapper element={<Settings />} />} />
                </Routes>
              </div>
            </Router>
          </GoalProvider>
        </GoalListProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;