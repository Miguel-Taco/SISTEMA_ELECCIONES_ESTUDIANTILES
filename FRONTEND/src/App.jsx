// App.jsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './services/AuthContext'; // Asegúrate de importar AuthContext correctamente
import Login from './components/Login';
import Home from './pages/Home';
import Probabilidades1 from './pages/Probabilidades1';
import Probabilidades2 from './pages/Probabilidades2';

function App() {
  const context = useContext(AuthContext);
  const { isAuthenticated } = context;

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated); // Asegúrate de que el estado cambie
  }, [isAuthenticated]); // Detectar cambios en isAuthenticated

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/home/probabilidades1" element={isAuthenticated ? <Probabilidades1 /> : <Navigate to="/login" />} />
          <Route path="/home/probabilidades2" element={isAuthenticated ? <Probabilidades2 /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
