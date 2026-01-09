import { useState, useEffect } from 'react';
import type { Cart } from '../../types';
import { apiService } from '../../services/api';
import { toast, Spinner } from '../common';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

interface CheckoutProps {
  cartId: string;
  onClose: () => void;
  onOrderComplete: () => void;
}

const initialShippingInfo: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Spain',
};

const initialPaymentInfo: PaymentInfo = {
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: '',
};

export function Checkout({ cartId, onClose, onOrderComplete }: CheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(initialShippingInfo);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialPaymentInfo);
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    loadCart();
  }, [cartId]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart(cartId);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const validateShipping = (): boolean => {
    if (!shippingInfo.firstName.trim()) {
      toast.warning('Please enter your first name');
      return false;
    }
    if (!shippingInfo.lastName.trim()) {
      toast.warning('Please enter your last name');
      return false;
    }
    if (!shippingInfo.email.trim() || !shippingInfo.email.includes('@')) {
      toast.warning('Please enter a valid email address');
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      toast.warning('Please enter your phone number');
      return false;
    }
    if (!shippingInfo.address.trim()) {
      toast.warning('Please enter your shipping address');
      return false;
    }
    if (!shippingInfo.city.trim()) {
      toast.warning('Please enter your city');
      return false;
    }
    if (!shippingInfo.postalCode.trim()) {
      toast.warning('Please enter your postal code');
      return false;
    }
    return true;
  };

  const validatePayment = (): boolean => {
    const cardNumberClean = paymentInfo.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      toast.warning('Please enter a valid card number');
      return false;
    }
    if (!paymentInfo.cardName.trim()) {
      toast.warning('Please enter the name on card');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      toast.warning('Please enter expiry date in MM/YY format');
      return false;
    }
    if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      toast.warning('Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order number
      const newOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(newOrderNumber);

      // Clear cart
      localStorage.removeItem('bicycle-shop-cart-id');

      toast.success('Order placed successfully!');
      setStep('confirmation');
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && step !== 'confirmation') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, step]);

  if (loading) {
    return (
      <div className="checkout-overlay">
        <div className="checkout">
          <div className="checkout__loading">
            <Spinner size="lg" />
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-overlay">
        <div className="checkout">
          <div className="checkout__empty">
            <p>Your cart is empty</p>
            <button className="btn btn--primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout">
        <div className="checkout__header">
          <h2>Checkout</h2>
          {step !== 'confirmation' && (
            <button className="checkout__close" onClick={onClose} aria-label="Close checkout">
              ×
            </button>
          )}
        </div>

        <div className="checkout__progress">
          <div
            className={`checkout__progress-step ${step === 'shipping' ? 'active' : ''} ${['payment', 'confirmation'].includes(step) ? 'completed' : ''}`}
          >
            <span className="checkout__progress-number">1</span>
            <span className="checkout__progress-label">Shipping</span>
          </div>
          <div className="checkout__progress-line" />
          <div
            className={`checkout__progress-step ${step === 'payment' ? 'active' : ''} ${step === 'confirmation' ? 'completed' : ''}`}
          >
            <span className="checkout__progress-number">2</span>
            <span className="checkout__progress-label">Payment</span>
          </div>
          <div className="checkout__progress-line" />
          <div
            className={`checkout__progress-step ${step === 'confirmation' ? 'active completed' : ''}`}
          >
            <span className="checkout__progress-number">3</span>
            <span className="checkout__progress-label">Confirmation</span>
          </div>
        </div>

        <div className="checkout__content">
          <div className="checkout__main">
            {step === 'shipping' && (
              <form className="checkout__form" onSubmit={handleShippingSubmit}>
                <h3>Shipping Information</h3>
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="checkout__form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="checkout__form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="checkout__form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />
                </div>
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="checkout__form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="checkout__form-group">
                  <label>Country *</label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                  >
                    <option value="Spain">Spain</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                    <option value="Portugal">Portugal</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                  </select>
                </div>
                <div className="checkout__form-actions">
                  <button type="button" className="btn btn--secondary" onClick={onClose}>
                    Back to Cart
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form className="checkout__form" onSubmit={handlePaymentSubmit}>
                <h3>Payment Information</h3>
                <div className="checkout__payment-icons">
                  <span className="checkout__payment-icon">VISA</span>
                  <span className="checkout__payment-icon">MC</span>
                  <span className="checkout__payment-icon">AMEX</span>
                </div>
                <div className="checkout__form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        cardNumber: formatCardNumber(e.target.value),
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="checkout__form-group">
                  <label>Name on Card *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardName}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardName: e.target.value.toUpperCase() })
                    }
                    placeholder="JOHN DOE"
                    required
                  />
                </div>
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) =>
                        setPaymentInfo({
                          ...paymentInfo,
                          expiryDate: formatExpiryDate(e.target.value),
                        })
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="checkout__form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) =>
                        setPaymentInfo({
                          ...paymentInfo,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div className="checkout__secure-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Your payment information is secure and encrypted</span>
                </div>
                <div className="checkout__form-actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setStep('shipping')}
                  >
                    Back to Shipping
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={processing}>
                    {processing ? (
                      <>
                        <Spinner size="sm" /> Processing...
                      </>
                    ) : (
                      `Pay €${cart.totalAmount.toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'confirmation' && (
              <div className="checkout__confirmation">
                <div className="checkout__confirmation-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Order Confirmed!</h3>
                <p className="checkout__confirmation-order">
                  Order Number: <strong>{orderNumber}</strong>
                </p>
                <p className="checkout__confirmation-message">
                  Thank you for your purchase! We've sent a confirmation email to{' '}
                  <strong>{shippingInfo.email}</strong>.
                </p>
                <div className="checkout__confirmation-details">
                  <h4>Shipping Address</h4>
                  <p>
                    {shippingInfo.firstName} {shippingInfo.lastName}
                    <br />
                    {shippingInfo.address}
                    <br />
                    {shippingInfo.city}, {shippingInfo.postalCode}
                    <br />
                    {shippingInfo.country}
                  </p>
                </div>
                <div className="checkout__confirmation-details">
                  <h4>Estimated Delivery</h4>
                  <p>5-7 business days</p>
                </div>
                <button className="btn btn--primary" onClick={onOrderComplete}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {step !== 'confirmation' && (
            <div className="checkout__sidebar">
              <h3>Order Summary</h3>
              <div className="checkout__items">
                {cart.items.map((item) => (
                  <div key={item.id} className="checkout__item">
                    <div className="checkout__item-info">
                      <span className="checkout__item-name">
                        {item.product?.name || 'Custom Bicycle'}
                      </span>
                      <span className="checkout__item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="checkout__item-price">
                      €{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="checkout__summary-row">
                <span>Subtotal</span>
                <span>€{cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="checkout__summary-row">
                <span>Shipping</span>
                <span className="checkout__free">FREE</span>
              </div>
              <div className="checkout__summary-row checkout__summary-total">
                <span>Total</span>
                <span>€{cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
