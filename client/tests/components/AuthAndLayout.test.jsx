import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/features/auth/pages/Login';
import AdminLayout from '../../src/components/layout/AdminLayout';

// Mock API and Layout internals to isolate tests
vi.mock('../../../api/auth.api', () => ({
  login: vi.fn()
}));

// We only want to test that AdminLayout renders an Outlet context frame
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
  };
});

describe('Authentication & Layout Components', () => {
  describe('Login Page', () => {
    it('should render login form fields', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });
  });

  describe('AdminLayout Component', () => {
    it('should render structural elements for admin panel', () => {
      render(
        <MemoryRouter>
          <AdminLayout />
        </MemoryRouter>
      );
      // Ensure the navigation shell (Sidebar/Navbar/Outlet) renders
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Sidebar/Navbar
    });
  });
});
