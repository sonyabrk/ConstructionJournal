// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import AuthPage from './pages/AuthPage';
// import ObjectsPage from './pages/ObjectPage';
// import ObjectForInspector from './pages/ObjectForInspector';
// import { authService } from './services/authService';
// import './App.css'

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);

//   const checkAuth = () => {
//     const authenticated = authService.isAuthenticated();
//     console.log('App auth check:', authenticated);
//     setIsAuthenticated(authenticated);
//     setLoading(false);
//   };

//   useEffect(() => {
//     checkAuth();
//     const handleStorageChange = () => {
//       checkAuth();
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route 
//           path="/" 
//           element={
//             isAuthenticated ? 
//             <Navigate to="/objects" replace /> : 
//             <Navigate to="/auth" replace />
//           } 
//         />
//         <Route 
//           path="/auth" 
//           element={<AuthPage />}
//         />
//         <Route 
//           path="/objects" 
//           element={
//             isAuthenticated ? 
//             <ObjectsPage /> : 
//             <Navigate to="/auth" replace />
//           } 
//         />
//         <Route 
//           path="/objects/:projectId" 
//           element={
//             isAuthenticated ? 
//             <ObjectForInspector /> : 
//             <Navigate to="/auth" replace />
//           } 
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ObjectsPage from './pages/ObjectPage';
import ObjectDetailsPage from './pages/ObjectForInspector';
import { authService } from './services/authService';
import { type User } from './services/types';
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    const userData = authService.getCurrentUser();
    console.log('App auth check:', authenticated, 'User:', userData);
    setIsAuthenticated(authenticated);
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };
    
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }

  return (
    <Router>
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
          element={
            !isAuthenticated ? 
            <AuthPage onAuthSuccess={checkAuth} /> : 
            <Navigate to="/objects" replace />
          }
        />

        {/* Единый маршрут для списка объектов с адаптацией по роли */}
        <Route 
          path="/objects" 
          element={
            isAuthenticated ? 
            <ObjectsPage currentUser={user} /> : 
            <Navigate to="/auth" replace />
          } 
        />

        {/* Единый маршрут для деталей объекта с адаптацией по роли */}
        <Route 
          path="/objects/:projectId" 
          element={
            isAuthenticated ? 
            <ObjectDetailsPage currentUser={user} /> : 
            <Navigate to="/auth" replace />
          } 
        />

        {/* Запасной маршрут */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/objects" : "/auth"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;