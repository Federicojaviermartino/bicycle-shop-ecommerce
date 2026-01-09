import { useState, useEffect, useCallback, useRef } from 'react';
import type { Cart } from '../../types';
import { CartItemComponent } from './CartItem';
import { apiService } from '../../services/api';
import { toast, Spinner } from '../common';
interface ShoppingCartProps {
  cartId: string;
  isVisible: boolean;
  onClose: () => void;
  refreshTrigger?: number;
}
export function ShoppingCart({ cartId, isVisible, onClose }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart(cartId);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      // Cart loading failed
    } finally {
      setLoading(false);
    }
  }, [cartId]);
  useEffect(() => {
    if (isVisible && cartId) {
      loadCart();
    }
  }, [isVisible, cartId, loadCart]);

  // Focus trap and accessibility
  useEffect(() => {
    if (!isVisible) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the modal
    const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('.shopping-cart__close');
    closeButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isVisible, onClose]);

  // Handle click outside to close modal
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await apiService.updateCartItem(cartId, itemId, quantity);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      toast.error('Failed to update quantity');
    }
  };
  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await apiService.removeCartItem(cartId, itemId);

      if (response.success && response.data) {
        setCart(response.data);
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error(
        'Failed to remove item: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="shopping-cart-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      onClick={handleOverlayClick}
    >
      <div className="shopping-cart" ref={modalRef}>
        <div className="shopping-cart__header">
          <h2 id="cart-title">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="shopping-cart__close"
            aria-label="Close shopping cart"
          >
            ×
          </button>
        </div>
        <div className="shopping-cart__content">
          {loading ? (
            <div className="shopping-cart__loading">
              <Spinner size="lg" />
              <span style={{ marginTop: '0.5rem' }}>Loading cart...</span>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="shopping-cart__empty">
              <svg
                className="shopping-cart__empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="shopping-cart__empty-title">Your cart is empty</p>
              <p className="shopping-cart__empty-subtitle">
                Browse our collection and find your perfect bike!
              </p>
              <button className="btn btn--primary" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="shopping-cart__items">
                {cart.items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              <div className="shopping-cart__summary">
                <div className="shopping-cart__total">
                  <strong>Total: €{cart.totalAmount.toFixed(2)}</strong>
                </div>
                <div className="shopping-cart__actions">
                  <button className="btn btn--secondary" onClick={onClose}>
                    Continue Shopping
                  </button>
                  <button className="btn btn--primary">Proceed to Checkout</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
