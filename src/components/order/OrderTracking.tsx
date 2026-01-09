import { useState, useEffect } from 'react';

type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

interface OrderTrackingInfo {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  email: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  createdAt: string;
  estimatedDelivery: string;
}

interface OrderTrackingProps {
  orderNumber: string;
  onClose: () => void;
}

const statusSteps: { key: OrderStatus; label: string }[] = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function getEstimatedDelivery(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function OrderTracking({ orderNumber, onClose }: OrderTrackingProps) {
  const [order, setOrder] = useState<OrderTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedOrder = localStorage.getItem(`order-${orderNumber}`);
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      } else {
        setOrder({
          orderNumber,
          status: 'processing',
          customerName: 'Customer',
          email: 'customer@example.com',
          shippingAddress: {
            street: '123 Main Street',
            city: 'Barcelona',
            postalCode: '08001',
            country: 'Spain',
          },
          items: [{ name: 'Custom Bicycle Configuration', quantity: 1, price: 1850 }],
          totalAmount: 1850,
          createdAt: new Date().toISOString(),
          estimatedDelivery: getEstimatedDelivery(),
        });
      }
      setLoading(false);
    };

    loadOrder();
  }, [orderNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getStatusIndex = (status: OrderStatus) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
      <div className="order-tracking-overlay" onClick={handleOverlayClick}>
        <div className="order-tracking">
          <div className="order-tracking__loading">
            <div className="spinner spinner--lg" />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-overlay" onClick={handleOverlayClick}>
        <div className="order-tracking">
          <div className="order-tracking__header">
            <h2>Order Not Found</h2>
            <button className="order-tracking__close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="order-tracking__content">
            <p>We couldn't find an order with number {orderNumber}.</p>
            <button className="btn btn--primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div
      className="order-tracking-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-title"
      onClick={handleOverlayClick}
    >
      <div className="order-tracking" onClick={(e) => e.stopPropagation()}>
        <div className="order-tracking__header">
          <div>
            <h2 id="order-tracking-title">Order #{order.orderNumber}</h2>
            <p className="order-tracking__subtitle">Track your order status</p>
          </div>
          <button
            className="order-tracking__close"
            onClick={onClose}
            aria-label="Close order tracking"
          >
            ×
          </button>
        </div>

        <div className="order-tracking__content">
          <div className="order-tracking__timeline">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div
                  key={step.key}
                  className={`order-tracking__step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="order-tracking__step-dot">
                    {isCompleted && index < currentStatusIndex ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="order-tracking__step-pulse" />
                    ) : null}
                  </div>
                  <span className="order-tracking__step-label">{step.label}</span>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`order-tracking__step-line ${index < currentStatusIndex ? 'completed' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="order-tracking__info">
            <div className="order-tracking__section">
              <h3>Current Status</h3>
              <p className="order-tracking__status-text">
                {order.status === 'confirmed' &&
                  'Your order has been confirmed and is being prepared.'}
                {order.status === 'processing' && 'Your order is being processed and assembled.'}
                {order.status === 'shipped' && 'Your order has been shipped and is on its way!'}
                {order.status === 'delivered' &&
                  'Your order has been delivered. Enjoy your new bike!'}
              </p>
            </div>

            <div className="order-tracking__section">
              <h3>Estimated Delivery</h3>
              <p className="order-tracking__delivery">{order.estimatedDelivery}</p>
            </div>

            <div className="order-tracking__section">
              <h3>Shipping Address</h3>
              <address className="order-tracking__address">
                {order.customerName}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </address>
            </div>

            <div className="order-tracking__section">
              <h3>Order Summary</h3>
              <div className="order-tracking__items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-tracking__item">
                    <span className="order-tracking__item-name">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="order-tracking__item-price">€{item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="order-tracking__total">
                  <span>Total</span>
                  <span>€{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-tracking__actions">
            <button className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
