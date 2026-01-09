import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingSummary } from './PricingSummary';
import type { ConfigurationValidation } from '../../types';

describe('PricingSummary', () => {
  const mockOnAddToCart = vi.fn();

  const validConfiguration: ConfigurationValidation = {
    isValid: true,
    errors: [],
    totalPrice: 1299.99,
  };

  const invalidConfiguration: ConfigurationValidation = {
    isValid: false,
    errors: ['Frame type is required', 'Wheels are required'],
    totalPrice: 800,
  };

  const priceBreakdown = [
    { partTypeName: 'Frame Type', optionName: 'Full-Suspension', price: 130 },
    { partTypeName: 'Wheels', optionName: 'Mountain Wheels', price: 120 },
    { partTypeName: 'Rim Color', optionName: 'Blue', price: 20 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('price display', () => {
    it('should display total price', () => {
      render(<PricingSummary validation={validConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText('€1299.99')).toBeInTheDocument();
    });

    it('should display base price when provided', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          productName="Custom Mountain Bike"
          basePrice={800}
        />
      );
      expect(screen.getByText(/€800.00/)).toBeInTheDocument();
      expect(screen.getByText(/Custom Mountain Bike/)).toBeInTheDocument();
    });

    it('should format prices with two decimal places', () => {
      const config: ConfigurationValidation = {
        isValid: true,
        errors: [],
        totalPrice: 999,
      };
      render(<PricingSummary validation={config} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText('€999.00')).toBeInTheDocument();
    });
  });

  describe('price breakdown', () => {
    it('should display price breakdown when provided', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          priceBreakdown={priceBreakdown}
        />
      );
      expect(screen.getByText(/Frame Type/)).toBeInTheDocument();
      expect(screen.getByText(/Full-Suspension/)).toBeInTheDocument();
      expect(screen.getByText(/\+€130.00/)).toBeInTheDocument();
    });

    it('should show Included for zero-price options', () => {
      const breakdown = [{ partTypeName: 'Chain', optionName: 'Standard', price: 0 }];
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          priceBreakdown={breakdown}
        />
      );
      expect(screen.getByText('Included')).toBeInTheDocument();
    });

    it('should calculate options subtotal', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          priceBreakdown={priceBreakdown}
        />
      );
      expect(screen.getByText('€270.00')).toBeInTheDocument(); // 130 + 120 + 20
    });

    it('should toggle breakdown visibility', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          priceBreakdown={priceBreakdown}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /price breakdown/i });
      expect(screen.getByText(/Full-Suspension/)).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.queryByText(/Full-Suspension/)).not.toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText(/Full-Suspension/)).toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('should display validation errors when present', () => {
      render(<PricingSummary validation={invalidConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText('Configuration Issues:')).toBeInTheDocument();
      expect(screen.getByText('Frame type is required')).toBeInTheDocument();
      expect(screen.getByText('Wheels are required')).toBeInTheDocument();
    });

    it('should not display errors section when configuration is valid', () => {
      render(<PricingSummary validation={validConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.queryByText('Configuration Issues:')).not.toBeInTheDocument();
    });

    it('should have alert role for errors', () => {
      render(<PricingSummary validation={invalidConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('add to cart button', () => {
    it('should call onAddToCart when clicked with valid configuration', () => {
      render(<PricingSummary validation={validConfiguration} onAddToCart={mockOnAddToCart} />);

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when configuration is invalid', () => {
      render(<PricingSummary validation={invalidConfiguration} onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      expect(button).toBeDisabled();
    });

    it('should be disabled when adding to cart', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          isAddingToCart={true}
        />
      );

      const button = screen.getByRole('button', { name: /adding to cart/i });
      expect(button).toBeDisabled();
    });

    it('should show loading text when adding to cart', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          isAddingToCart={true}
        />
      );
      expect(screen.getByText(/adding to cart/i)).toBeInTheDocument();
    });
  });

  describe('valid configuration indicator', () => {
    it('should show valid indicator when configuration is complete', () => {
      render(<PricingSummary validation={validConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText(/configuration is valid/i)).toBeInTheDocument();
    });

    it('should not show valid indicator when configuration is invalid', () => {
      render(<PricingSummary validation={invalidConfiguration} onAddToCart={mockOnAddToCart} />);
      expect(screen.queryByText(/configuration is valid/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-live on price display', () => {
      render(<PricingSummary validation={validConfiguration} onAddToCart={mockOnAddToCart} />);
      const priceElement = screen.getByText('€1299.99');
      expect(priceElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-expanded on breakdown toggle', () => {
      render(
        <PricingSummary
          validation={validConfiguration}
          onAddToCart={mockOnAddToCart}
          priceBreakdown={priceBreakdown}
        />
      );
      const toggleButton = screen.getByRole('button', { name: /price breakdown/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
