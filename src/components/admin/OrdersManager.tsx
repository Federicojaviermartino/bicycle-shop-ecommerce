import { useState, useEffect } from 'react';
import { toast } from '../common';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  productName: string;
  configuration: string[];
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    status: 'delivered',
    items: [
      {
        id: '1',
        productName: 'Custom Mountain Bike',
        configuration: ['Mountain Frame', 'Mountain Wheels (29")', 'High-Performance Chain'],
        quantity: 1,
        unitPrice: 2280,
      },
    ],
    totalAmount: 2280,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    shippingAddress: '123 Main St, New York, NY 10001',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Emma Johnson',
    customerEmail: 'emma.j@email.com',
    status: 'shipped',
    items: [
      {
        id: '2',
        productName: 'City Commuter Bike',
        configuration: ['Road Frame', 'Road Wheels (700c)', 'Standard Chain'],
        quantity: 1,
        unitPrice: 1520,
      },
    ],
    totalAmount: 1520,
    createdAt: '2024-01-18T14:15:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Michael Brown',
    customerEmail: 'mbrown@email.com',
    status: 'processing',
    items: [
      {
        id: '3',
        productName: 'Custom Mountain Bike',
        configuration: [
          'Mountain Frame',
          'Mountain Wheels (29")',
          'Standard Chain',
          'Matte Finish',
        ],
        quantity: 1,
        unitPrice: 2070,
      },
    ],
    totalAmount: 2070,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    shippingAddress: '789 Pine Rd, Chicago, IL 60601',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Sarah Davis',
    customerEmail: 'sarah.d@email.com',
    status: 'confirmed',
    items: [
      {
        id: '4',
        productName: 'City Commuter Bike',
        configuration: [
          'Road Frame',
          'Road Wheels (700c)',
          'High-Performance Chain',
          'Glossy Finish',
        ],
        quantity: 2,
        unitPrice: 1680,
      },
    ],
    totalAmount: 3360,
    createdAt: '2024-01-21T16:45:00Z',
    updatedAt: '2024-01-21T17:00:00Z',
    shippingAddress: '321 Elm St, Houston, TX 77001',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: 'David Wilson',
    customerEmail: 'dwilson@email.com',
    status: 'pending',
    items: [
      {
        id: '5',
        productName: 'Custom Mountain Bike',
        configuration: ['Mountain Frame', 'Road Wheels (700c)', 'Standard Chain'],
        quantity: 1,
        unitPrice: 1920,
      },
    ],
    totalAmount: 1920,
    createdAt: '2024-01-22T08:30:00Z',
    updatedAt: '2024-01-22T08:30:00Z',
    shippingAddress: '654 Maple Dr, Phoenix, AZ 85001',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@email.com',
    status: 'cancelled',
    items: [
      {
        id: '6',
        productName: 'City Commuter Bike',
        configuration: ['Road Frame', 'Road Wheels (700c)', 'Standard Chain'],
        quantity: 1,
        unitPrice: 1520,
      },
    ],
    totalAmount: 1520,
    createdAt: '2024-01-10T11:20:00Z',
    updatedAt: '2024-01-11T09:00:00Z',
    shippingAddress: '987 Cedar Ln, Seattle, WA 98101',
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  processing: { label: 'Processing', color: '#8b5cf6' },
  shipped: { label: 'Shipped', color: '#06b6d4' },
  delivered: { label: 'Delivered', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
    toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Orders Management</h2>
      </div>

      <div className="orders-stats">
        <div className="orders-stats__card">
          <span className="orders-stats__value">{orderStats.total}</span>
          <span className="orders-stats__label">Total Orders</span>
        </div>
        <div className="orders-stats__card orders-stats__card--pending">
          <span className="orders-stats__value">{orderStats.pending}</span>
          <span className="orders-stats__label">Pending</span>
        </div>
        <div className="orders-stats__card orders-stats__card--processing">
          <span className="orders-stats__value">{orderStats.processing}</span>
          <span className="orders-stats__label">In Progress</span>
        </div>
        <div className="orders-stats__card orders-stats__card--shipped">
          <span className="orders-stats__value">{orderStats.shipped}</span>
          <span className="orders-stats__label">Shipped</span>
        </div>
        <div className="orders-stats__card orders-stats__card--delivered">
          <span className="orders-stats__value">{orderStats.delivered}</span>
          <span className="orders-stats__label">Delivered</span>
        </div>
      </div>

      <div className="orders-filters">
        <div className="orders-filters__search">
          <input
            type="text"
            placeholder="Search by order #, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-form__input"
          />
        </div>
        <div className="orders-filters__status">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="admin-form__select"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-content__body">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="admin-table__cell--primary">{order.orderNumber}</td>
                  <td>
                    <div className="admin-table__primary-text">{order.customerName}</div>
                    <div className="admin-table__secondary-text">{order.customerEmail}</div>
                  </td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</td>
                  <td className="admin-table__cell--price">€{order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span
                      className="orders-status-badge"
                      style={{ backgroundColor: statusConfig[order.status].color }}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="admin-table__cell--date">{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--view"
                        onClick={() => setSelectedOrder(order)}
                        title="View details"
                      >
                        👁️
                      </button>
                      {getNextStatus(order.status) && (
                        <button
                          className="admin-table__action-btn admin-table__action-btn--advance"
                          onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
                          title={`Advance to ${statusConfig[getNextStatus(order.status)!].label}`}
                        >
                          ➡️
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          className="admin-table__action-btn admin-table__action-btn--cancel"
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          title="Cancel order"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="admin-content__empty">
              <p>No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Order {selectedOrder.orderNumber}</h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="order-details">
              <div className="order-details__section">
                <h4>Customer Information</h4>
                <p>
                  <strong>Name:</strong> {selectedOrder.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.customerEmail}
                </p>
                <p>
                  <strong>Shipping Address:</strong> {selectedOrder.shippingAddress}
                </p>
              </div>

              <div className="order-details__section">
                <h4>Order Status</h4>
                <div className="order-status-timeline">
                  {statusFlow.map((status, index) => {
                    const currentIndex = statusFlow.indexOf(selectedOrder.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = status === selectedOrder.status;
                    return (
                      <div
                        key={status}
                        className={`order-status-timeline__step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className="order-status-timeline__dot" />
                        <span className="order-status-timeline__label">
                          {statusConfig[status].label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {selectedOrder.status === 'cancelled' && (
                  <p className="order-details__cancelled">This order has been cancelled.</p>
                )}
              </div>

              <div className="order-details__section">
                <h4>Order Items</h4>
                <table className="order-details__items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Configuration</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>
                          <ul className="order-details__config-list">
                            {item.configuration.map((config, i) => (
                              <li key={i}>{config}</li>
                            ))}
                          </ul>
                        </td>
                        <td>{item.quantity}</td>
                        <td>€{item.unitPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>
                        <strong>Total</strong>
                      </td>
                      <td>
                        <strong>€{selectedOrder.totalAmount.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="order-details__section">
                <h4>Timeline</h4>
                <p>
                  <strong>Created:</strong> {formatDate(selectedOrder.createdAt)}
                </p>
                <p>
                  <strong>Last Updated:</strong> {formatDate(selectedOrder.updatedAt)}
                </p>
              </div>

              <div className="order-details__actions">
                {getNextStatus(selectedOrder.status) && (
                  <button
                    className="admin-modal__btn admin-modal__btn--save"
                    onClick={() =>
                      handleStatusChange(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                    }
                  >
                    Advance to {statusConfig[getNextStatus(selectedOrder.status)!].label}
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    className="admin-modal__btn admin-modal__btn--cancel"
                    onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
