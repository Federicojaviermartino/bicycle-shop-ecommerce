import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductConfigurator } from './ProductConfigurator';

vi.mock('../../services/api', () => ({
  apiService: {
    getProduct: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'test-product',
        name: 'Test Product',
        categoryId: 'test-category',
        basePrice: 100,
        isActive: true,
      },
    }),
    getPartTypes: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getPartOptions: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    validateConfiguration: vi.fn().mockResolvedValue({
      success: true,
      data: {
        isValid: false,
        errors: [],
        totalPrice: 0,
      },
    }),
  },
}));

describe('ProductConfigurator', () => {
  it('renders loading state initially', () => {
    render(<ProductConfigurator productId="test-product" onAddToCart={vi.fn()} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders the configurator title after loading', async () => {
    render(<ProductConfigurator productId="test-product" onAddToCart={vi.fn()} />);
    expect(await screen.findByText(/customize your product/i)).toBeInTheDocument();
  });
});
