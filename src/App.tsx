import { useState, useEffect, useCallback } from 'react';
import { ProductConfigurator } from './components/product/ProductConfigurator';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ErrorBoundary, toast } from './components/common';
import { apiService } from './services/api';
import './App.css';

type AppView = 'customer' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('customer');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartId] = useState(() => {
    const storedCartId = localStorage.getItem('bicycle-shop-cart-id');
    if (storedCartId) {
      return storedCartId;
    }
    const newCartId = 'cart-' + Date.now();
    localStorage.setItem('bicycle-shop-cart-id', newCartId);
    return newCartId;
  });

  const updateCartCount = useCallback(async () => {
    try {
      const response = await apiService.getCart(cartId);
      if (response.success && response.data) {
        const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch {
      // Failed to load cart count
    }
  }, [cartId]);

  useEffect(() => {
    updateCartCount();
  }, [updateCartCount]);

  const handleAddToCart = async (configurationId: string) => {
    try {
      const result = await apiService.addToCart(cartId, configurationId, 1);

      if (result.success) {
        toast.success('Product added to cart!');
        updateCartCount();
        setIsCartVisible(true);
      } else {
        toast.error('Failed to add product to cart: ' + result.error);
      }
    } catch {
      toast.error('Error adding product to cart');
    }
  };

  const handleCartClose = () => {
    setIsCartVisible(false);
    updateCartCount();
  };

  if (currentView === 'admin') {
    return (
      <ErrorBoundary>
        <AdminDashboard onBackToCustomer={() => setCurrentView('customer')} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="app__header">
          <div className="app__header-content">
            <div>
              <h1 className="app__title">Marcus's Bicycle Shop</h1>
              <p className="app__subtitle">Build Your Perfect Bicycle</p>
            </div>
            <div className="app__header-buttons">
              <button
                className="app__cart-button"
                onClick={() => setCurrentView(currentView === 'customer' ? 'admin' : 'customer')}
                aria-label={
                  currentView === 'customer' ? 'Go to admin panel' : 'Go to customer view'
                }
              >
                {currentView === 'customer' ? 'Admin' : 'Customer View'}
              </button>
              {currentView === 'customer' && (
                <button
                  className="app__cart-button app__cart-button--with-badge"
                  onClick={() => setIsCartVisible(true)}
                  aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ', empty'}`}
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="app__cart-badge" aria-hidden="true">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" className="app__main">
          <div className="app__intro">
            <h2>Customize Your Dream Bicycle</h2>
            <p>
              Choose from our high-quality components to build the perfect bicycle for your needs.
              Each part is carefully selected and professionally assembled to ensure the best riding
              experience.
            </p>
          </div>
          <ProductConfigurator productId="demo-bicycle-1" onAddToCart={handleAddToCart} />
        </main>
        <ShoppingCart cartId={cartId} isVisible={isCartVisible} onClose={handleCartClose} />
        <footer className="app__footer">
          <p>&copy; 2025 Marcus's Bicycle Shop. Quality bicycles, built to order.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
