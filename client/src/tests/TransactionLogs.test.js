import React from 'react';
import { render, screen } from '@testing-library/react';
import TransactionLogs from '../TransactionLogs';
const axios = require('axios');

test('renders transaction logs when available', async () => {
  const mockData = { logs: [{ id: 1, message: 'Test Log', date: '2023-01-01' }] };
  axios.get.mockResolvedValue({ data: mockData });

  render(<TransactionLogs />);
  
  // Ensure the log appears on the page
  const logMessage = await screen.findByText(/Test Log/i);
  expect(logMessage).toBeInTheDocument();
});