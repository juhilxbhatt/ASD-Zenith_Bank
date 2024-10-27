import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user data from localStorage or set default values
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : { first_name: '', last_name: '', isAuthenticated: false };
    });

    // Login function to authenticate the user
    const login = (first_name, last_name) => {
        const newUser = { first_name, last_name, isAuthenticated: true };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser)); // Persist user data
    };

    // Logout function to clear user data
    const logout = () => {
        setUser({ first_name: '', last_name: '', isAuthenticated: false });
        localStorage.removeItem('user'); // Clear user data from localStorage
    };

    useEffect(() => {
        // Optional: Rehydrate user session if needed
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
