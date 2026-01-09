import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ProductConfigurator } from './components/product/ProductConfigurator';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { ErrorBoundary, toast, Spinner } from './components/common';
import { apiService } from './services/api';
import './App.css';

const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const Checkout = lazy(() => import('./components/checkout/Checkout'));

type AppView = 'customer' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('customer');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
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

  const handleProceedToCheckout = () => {
    setIsCartVisible(false);
    setIsCheckoutVisible(true);
  };

  const handleCheckoutClose = () => {
    setIsCheckoutVisible(false);
  };

  const handleOrderComplete = () => {
    setIsCheckoutVisible(false);
    setCartItemCount(0);
    // Generate new cart ID for next session
    const newCartId = 'cart-' + Date.now();
    localStorage.setItem('bicycle-shop-cart-id', newCartId);
    window.location.reload();
  };

  if (currentView === 'admin') {
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="app__loading">
              <Spinner size="lg" />
            </div>
          }
        >
          <AdminDashboard onBackToCustomer={() => setCurrentView('customer')} />
        </Suspense>
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
                className="app__signin-button"
                onClick={() => toast.info('Customer accounts coming soon!')}
                aria-label="Sign in to your account"
              >
                Sign In
              </button>
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
        <ShoppingCart
          cartId={cartId}
          isVisible={isCartVisible}
          onClose={handleCartClose}
          onProceedToCheckout={handleProceedToCheckout}
        />
        {isCheckoutVisible && (
          <Suspense
            fallback={
              <div className="app__loading">
                <Spinner size="lg" />
              </div>
            }
          >
            <Checkout
              cartId={cartId}
              onClose={handleCheckoutClose}
              onOrderComplete={handleOrderComplete}
            />
          </Suspense>
        )}
        <footer className="app__footer">
          <p>&copy; 2025 Marcus's Bicycle Shop. Quality bicycles, built to order.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
