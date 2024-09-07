import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CreateAccount from './CreateAccount';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Route for the Create Account page */}
          <Route path="/create-account" element={<CreateAccount />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;