import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyState from '../../src/components/common/EmptyState';
import PageHeader from '../../src/components/common/PageHeader';

describe('Views & Layout Elements', () => {
  describe('PageHeader Component', () => {
    it('should render the title and subtitle correctly', () => {
      render(
        <MemoryRouter>
          <PageHeader 
            title="Vendor Dashboard" 
            description="Manage your connected vendors" 
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Vendor Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Manage your connected vendors')).toBeInTheDocument();
    });
  });

  describe('EmptyState Component', () => {
    it('should render icon, title, and action button', () => {
      const mockAction = vi.fn();
      
      render(
        <EmptyState 
          title="No vendors found" 
          message="Try adjusting your search criteria"
          actionLabel="Clear Filters"
          onAction={mockAction}
        />
      );

      expect(screen.getByText('No vendors found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
    });
  });
});
