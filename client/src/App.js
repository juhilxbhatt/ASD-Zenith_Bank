// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import TransactionLogs from './components/TransactionLogs';
import LoginPage from './components/LoginPage';
import CreateUser from './components/CreateUser';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Home />
                </ProtectedRoute>
            } />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/transaction-logs" element={<TransactionLogs />} />
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/create-user" element={<CreateUser />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
