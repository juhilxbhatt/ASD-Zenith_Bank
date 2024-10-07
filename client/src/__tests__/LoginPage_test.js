// LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../context/AuthContext');  // Mock the useAuth hook

const mockLogin = jest.fn();

beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
});

test('renders login form', () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('shows error message on invalid login', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Mock the fetch to simulate a failed login response
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Invalid password' }),
        })
    );

    await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    });
});

test('shows success message on valid login', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'valid@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'correctpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Mock the fetch to simulate a successful login response
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ userName: 'Test User' }),
        })
    );

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('Test User');
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
});

test('toggles password visibility', () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    // Initially, the password should be hidden
    expect(passwordInput.type).toBe('password');

    // Click the toggle button to show the password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click the toggle button again to hide the password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
});
