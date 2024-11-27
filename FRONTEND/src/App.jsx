// App.jsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './services/AuthContext'; // Asegúrate de importar AuthContext correctamente
import Login from './components/Login';
import Home from './pages/Home';

function App() {
  const context = useContext(AuthContext);
  const { isAuthenticated } = context;

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated); // Asegúrate de que el estado cambie
  }, [isAuthenticated]); // Detectar cambios en isAuthenticated

  return (
    <Router>
      <div>
        <h1>Hola Mundo</h1>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
