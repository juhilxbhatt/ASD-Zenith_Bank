import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CreateAccount from './CreateAccount';
import TransactionLogs from './TransactionLogs';
import LoginPage from './LoginPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Route for the Create Account page */}
          <Route path="/create-account" element={<CreateAccount />} />

          {/* Route for the Transaction Logs Page*/}
          <Route path="/TransactionLogs" element={<TransactionLogs />} />

          {/* Route for Login Page*/}
          <Route path="/LoginPage" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;