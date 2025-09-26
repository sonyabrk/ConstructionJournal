import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ObjectsPage from './pages/ObjectPage';
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />}/>
        <Route path="/objects" element={<ObjectsPage />}/>
      </Routes>
    </Router>
  );
}

export default App
