import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth(); // Get the user object from context

    if (!user.isAuthenticated) {
        return <Navigate to="/login-page" replace />;
    }
    return children;
};

export default ProtectedRoute;
