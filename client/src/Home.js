import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to Zenith Bank</h1>
      {/* Link to navigate to the Create Account page */}
      <Link to="/create-account">
        <button>Create New Account</button>
      </Link>
    </div>
  );
}

export default Home;