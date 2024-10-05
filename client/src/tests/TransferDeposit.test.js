import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TransferDeposit from '../TransferDeposit';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock Axios API
jest.mock('axios');

describe('TransferDeposit Component', () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({ data: { message: 'Transaction added successfully' } });
  });

  test('renders TransferDeposit component', () => {
    render(
      <Router>
        <TransferDeposit userId="123" />
      </Router>
    );

    // Check if the component renders
    expect(screen.getByText(/transfer & deposit/i)).toBeInTheDocument();
  });

  test('allows user to submit transfer form', async () => {
    render(
      <Router>
        <TransferDeposit userId="123" />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByText(/submit/i));

    // Check for success message
    await waitFor(() => expect(screen.getByText(/transfer of/i)).toBeInTheDocument());
  });
});
