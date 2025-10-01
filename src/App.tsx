import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ObjectsPage from './pages/ObjectPage';
import { authService } from './services/authService';
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    console.log('App auth check:', authenticated);
    setIsAuthenticated(authenticated);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ObjectsPage />
    /*<Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/objects" replace /> : 
            <Navigate to="/auth" replace />
          } 
        />
        <Route 
          path="/auth" 
          element={<AuthPage />}
        />
        <Route 
          path="/objects" 
          element={
            isAuthenticated ? 
            <ObjectsPage /> : 
            <Navigate to="/auth" replace />
          } 
        />
      </Routes>
    </Router>*/
  );
}

export default App;