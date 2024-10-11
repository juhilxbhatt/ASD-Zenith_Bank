import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MonthlyStatement from '../MonthlyStatement';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock Axios API
jest.mock('axios');

const mockTransactions = [
  { date: '2024-09-01', category: 'Groceries', type: 'deposit', amount: 100 },
  { date: '2024-09-02', category: 'Bills', type: 'withdrawal', amount: 50 },
];

describe('MonthlyStatement Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockTransactions });
  });

  test('renders MonthlyStatement component', async () => {
    render(
      <Router>
        <MonthlyStatement userId="123" />
      </Router>
    );

    // Check if the component renders
    expect(screen.getByText(/monthly bank statement/i)).toBeInTheDocument();

    // Wait for transactions to load
    await waitFor(() => expect(screen.getByText('Groceries - Income')).toBeInTheDocument());
  });
});