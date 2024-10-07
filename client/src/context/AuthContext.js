import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user data from localStorage
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : { first_name: '', last_name: '', isAuthenticated: false };
    });

    const login = (first_name, last_name) => {
        const newUser = { first_name, last_name, isAuthenticated: true };
        setUser(newUser);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser({ first_name: '', last_name: '', isAuthenticated: false });
        // Remove user data from localStorage
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
