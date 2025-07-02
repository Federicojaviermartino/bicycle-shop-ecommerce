import { useState, useEffect, useCallback } from "react";
import type { Cart } from "../../types";
import { CartItemComponent } from "./CartItem";
import { apiService } from "../../services/api";
interface ShoppingCartProps {
  cartId: string;
  isVisible: boolean;
  onClose: () => void;
  refreshTrigger?: number; // Add this to trigger refreshes
}
export function ShoppingCart({
  cartId,
  isVisible,
  onClose,
}: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);  const loadCart = useCallback(async () => {
    console.log('Loading cart for cartId:', cartId);
    setLoading(true);
    try {
      const response = await apiService.getCart(cartId);
      console.log('Cart response:', response);
      if (response.success && response.data) {
        console.log('Cart data:', response.data);
        console.log('Cart items count:', response.data.items?.length || 0);
        setCart(response.data);
      } else {
        console.error('Failed to load cart:', response.error);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
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
      const response = await apiService.updateCartItem(
        cartId,
        itemId,
        quantity
      );
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      alert("Failed to update quantity");
    }
  };  const handleRemoveItem = async (itemId: string) => {
    console.log('🗑️ ShoppingCart: Removing item with ID:', itemId);
    console.log('🗑️ ShoppingCart: Current cart before removal:', cart);
    
    try {
      const response = await apiService.removeCartItem(cartId, itemId);
      console.log('🗑️ ShoppingCart: Remove response:', response);
      
      if (response.success && response.data) {
        console.log('🗑️ ShoppingCart: Successfully removed item, updating cart');
        console.log('🗑️ ShoppingCart: New cart data:', response.data);
        setCart(response.data);
        console.log('🗑️ ShoppingCart: Cart state updated');
        
        // Force a re-render by reloading the cart
        setTimeout(() => {
          console.log('🗑️ ShoppingCart: Reloading cart to confirm removal');
          loadCart();
        }, 100);
      } else {
        console.error('🗑️ ShoppingCart: Failed to remove item:', response.error);
        alert("Failed to remove item: " + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('🗑️ ShoppingCart: Error removing item:', error);
      alert("Failed to remove item: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };if (!isVisible) return null;

  console.log('Rendering cart - loading:', loading, 'cart:', cart, 'items:', cart?.items?.length || 0);

  return (
    <div className="shopping-cart-overlay">
      <div className="shopping-cart">
        <div className="shopping-cart__header">
          <h2>Shopping Cart</h2>
          <button onClick={onClose} className="shopping-cart__close">
            ×
          </button>
        </div>
        <div className="shopping-cart__content">
          {loading ? (
            <div className="shopping-cart__loading">Loading cart...</div>
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
                  <button className="btn btn--primary">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
