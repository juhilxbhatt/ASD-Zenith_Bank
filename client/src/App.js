import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CreateAccount from './CreateAccount';
import TransactionLogs from './TransactionLogs';
import LoginPage from './LoginPage';
import CreateUser from './CreateUser';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create-account" element={<CreateAccount />} />
                    <Route path="/TransactionLogs" element={<TransactionLogs />} />
                    <Route path="/login-page" element={<LoginPage />} />
                    <Route path="/create-user" element={<CreateUser />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
