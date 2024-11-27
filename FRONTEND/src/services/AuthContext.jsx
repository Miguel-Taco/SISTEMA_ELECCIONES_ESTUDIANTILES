// services/AuthContext.jsx
import { createContext, useState } from 'react';

// Crear el contexto de autenticación
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
    const [userId, setUserId] = useState(null); // ID del usuario autenticado

    const logout = () => {
        setIsAuthenticated(false);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userId, setUserId, logout }}>
            {children} {/* El contenido dentro de AuthProvider puede acceder a este contexto */}
        </AuthContext.Provider>
    );
}
