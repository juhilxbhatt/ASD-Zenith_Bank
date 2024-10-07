import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function Home() {
    const { user, logout } = useAuth(); // Access user and logout function from Auth context

    console.log(user); // Add this to check what is stored in `user`

    return (
        <div>
            {/* Welcome message at the top */}
            <h1>Welcome to Zenith Bank</h1>

            {/* Display user name and logout button in a flexbox container */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {user.isAuthenticated && (
                    <h2 style={{ textAlign: 'left' }}>
                        Hello, {user.first_name} {user.last_name}
                    </h2>
                )}

                {user.isAuthenticated && (
                  <button
                    onClick={logout}
                    style={{
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        transition: 'background-color 0.3s ease-in-out', // Transition effect added here
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6666'} // Change background on hover
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4d4d'} // Revert background when not hovering
                >
                    Logout
                </button>
                )}
            </div>

            {/* Buttons for navigating to create account and transaction logs */}
            <Link to="/create-account">
                <button>Create New Account</button>
            </Link>

            <Link to="/transaction-logs">
                <button>View Transaction Logs</button>
            </Link>
        </div>
    );
}

export default Home;
