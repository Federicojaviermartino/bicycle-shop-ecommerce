import { useState, useEffect, useCallback } from 'react';
import type { Cart } from '../../types';
import { CartItemComponent } from './CartItem';
import { apiService } from '../../services/api';
import { toast, Spinner } from '../common';
interface ShoppingCartProps {
  cartId: string;
  isVisible: boolean;
  onClose: () => void;
  refreshTrigger?: number; // Add this to trigger refreshes
}
export function ShoppingCart({ cartId, isVisible, onClose }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
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
    >
      <div className="shopping-cart">
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
              <p>Your cart is empty</p>
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
