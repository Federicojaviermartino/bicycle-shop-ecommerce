import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderTracking } from './OrderTracking';

describe('OrderTracking', () => {
  const mockOnClose = vi.fn();
  const mockOrderNumber = 'ORD-123456';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      expect(screen.getByText(/loading order details/i)).toBeInTheDocument();
    });

    it('should render order number after loading', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(`Order #${mockOrderNumber}`)).toBeInTheDocument();
      });
    });

    it('should render status timeline', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText('Confirmed')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
        expect(screen.getByText('Shipped')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
      });
    });

    it('should render current status section', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText('Current Status')).toBeInTheDocument();
      });
    });

    it('should render estimated delivery section', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText('Estimated Delivery')).toBeInTheDocument();
      });
    });

    it('should render shipping address section', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });
    });

    it('should render order summary section', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(`Order #${mockOrderNumber}`)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close order tracking/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(`Order #${mockOrderNumber}`)).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking content inside modal', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(`Order #${mockOrderNumber}`)).toBeInTheDocument();
      });

      const title = screen.getByText(`Order #${mockOrderNumber}`);
      fireEvent.click(title);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    it('should load order from localStorage if available', async () => {
      const storedOrder = {
        orderNumber: mockOrderNumber,
        status: 'shipped',
        customerName: 'John Doe',
        email: 'john@example.com',
        shippingAddress: {
          street: '456 Test Ave',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        items: [{ name: 'Test Bike', quantity: 1, price: 999 }],
        totalAmount: 999,
        createdAt: new Date().toISOString(),
        estimatedDelivery: 'Friday, January 10, 2025',
      };

      localStorage.setItem(`order-${mockOrderNumber}`, JSON.stringify(storedOrder));

      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(/has been shipped/i)).toBeInTheDocument();
      });
    });

    it('should use default order data if not in localStorage', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByText(/being processed/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have dialog role', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have aria-modal attribute', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('should have aria-labelledby pointing to title', async () => {
      render(<OrderTracking orderNumber={mockOrderNumber} onClose={mockOnClose} />);
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby', 'order-tracking-title');
      });
    });
  });
});
