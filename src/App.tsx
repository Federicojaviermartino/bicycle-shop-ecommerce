import { useState } from 'react'
import { ProductConfigurator } from './components/product/ProductConfigurator'
import { ShoppingCart } from './components/cart/ShoppingCart'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { apiService } from './services/api'
import './App.css'
type AppView = 'customer' | 'admin';
function App() {
  const [currentView, setCurrentView] = useState<AppView>('customer')
  const [isCartVisible, setIsCartVisible] = useState(false)
  const [cartId] = useState(() => 'cart-' + Date.now()) // Simple session-based cart ID
  const handleAddToCart = async (configurationId: string) => {
    console.log('Adding configuration to cart:', configurationId)
    
    try {
      const result = await apiService.addToCart(cartId, configurationId, 1)
      
      if (result.success) {
        console.log('Product successfully added to cart:', result.data)
        alert('Product added to cart!')
        setIsCartVisible(true)
      } else {
        console.error('Failed to add product to cart:', result.error)
        alert('Failed to add product to cart: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding product to cart:', error)
      alert('Error adding product to cart')
    }
  }
  if (currentView === 'admin') {
    return <AdminDashboard onBackToCustomer={() => setCurrentView('customer')} />;
  }
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <div>
            <h1 className="app__title">Marcus's Bicycle Shop</h1>
            <p className="app__subtitle">Build Your Perfect Bicycle</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="app__cart-button"
              onClick={() => setCurrentView(currentView === 'customer' ? 'admin' : 'customer')}
            >
              {currentView === 'customer' ? '⚙️ Admin' : '🏪 Customer View'}
            </button>
            {currentView === 'customer' && (
              <button 
                className="app__cart-button"
                onClick={() => setIsCartVisible(true)}
              >
                🛒 Cart
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="app__main">
        <div className="app__intro">
          <h2>Customize Your Dream Bicycle</h2>
          <p>
            Choose from our high-quality components to build the perfect bicycle for your needs. 
            Each part is carefully selected and professionally assembled to ensure the best riding experience.
          </p>
        </div>
        <ProductConfigurator
          productId="demo-bicycle-1"
          onAddToCart={handleAddToCart}
        />
      </main>
      <ShoppingCart
        cartId={cartId}
        isVisible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
      />
      <footer className="app__footer">
        <p>&copy; 2025 Marcus's Bicycle Shop. Quality bicycles, built to order.</p>
      </footer>
    </div>
  )
}
export default App
