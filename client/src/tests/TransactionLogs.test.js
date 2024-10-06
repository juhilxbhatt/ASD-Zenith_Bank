import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionLogs from '../TransactionLogs';

test('renders Transaction Logs title', () => {
  render(<TransactionLogs />);
  const titleElement = screen.getByText(/Transaction Logs/i);
  expect(titleElement).toBeInTheDocument();
});