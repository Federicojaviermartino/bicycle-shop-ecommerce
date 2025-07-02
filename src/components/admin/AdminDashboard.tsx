    import { useState } from 'react';
    import { ProductManager } from './ProductManager.tsx';
    import { PartManager, PricingRuleManager, ConstraintManager } from './PartManager.tsx';
    type AdminTab = 'products' | 'parts' | 'pricing' | 'constraints' | 'orders' | 'analytics';
    interface AdminDashboardProps {
    onBackToCustomer?: () => void;
    }
    export function AdminDashboard({ onBackToCustomer }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('products');
    const tabs = [
        { id: 'products' as AdminTab, label: 'Products', icon: '🏷️' },
        { id: 'parts' as AdminTab, label: 'Parts & Options', icon: '🔧' },
        { id: 'pricing' as AdminTab, label: 'Pricing Rules', icon: '💰' },
        { id: 'constraints' as AdminTab, label: 'Constraints', icon: '⚡' },
        { id: 'orders' as AdminTab, label: 'Orders', icon: '📦' },
        { id: 'analytics' as AdminTab, label: 'Analytics', icon: '📊' },
    ];
    const renderTabContent = () => {
        switch (activeTab) {
        case 'products':
            return <ProductManager />;
        case 'parts':
            return <PartManager />;
        case 'pricing':
            return <PricingRuleManager />;
        case 'constraints':
            return <ConstraintManager />;        case 'orders':
            return (
                <div className="admin-content">
                    <div className="admin-content__header">
                        <h2 className="admin-content__title">Orders Management</h2>
                    </div>
                    <div className="admin-content__body">
                        <div className="admin-content__coming-soon">
                            <h3>Orders Management - Coming Soon</h3>
                            <p>This section will include:</p>
                            <ul>
                                <li>View and manage customer orders</li>
                                <li>Order status tracking</li>
                                <li>Order fulfillment workflow</li>
                                <li>Customer communication tools</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        case 'analytics':
            return (
                <div className="admin-content">
                    <div className="admin-content__header">
                        <h2 className="admin-content__title">Analytics Dashboard</h2>
                    </div>
                    <div className="admin-content__body">
                        <div className="admin-content__coming-soon">
                            <h3>Analytics Dashboard - Coming Soon</h3>
                            <p>This section will include:</p>
                            <ul>
                                <li>Sales performance metrics</li>
                                <li>Popular product configurations</li>
                                <li>Customer behavior insights</li>
                                <li>Revenue and profit reports</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );        default:
            return (
                <div className="admin-content">
                    <div className="admin-content__header">
                        <h2 className="admin-content__title">Welcome to Admin Dashboard</h2>
                    </div>
                    <div className="admin-content__body">
                        <div className="admin-content__coming-soon">
                            <h3>Select a tab to get started</h3>
                            <p>Choose from the navigation above to manage:</p>
                            <ul>
                                <li>Products - Add and edit bicycle models</li>
                                <li>Parts & Options - Manage customizable components</li>
                                <li>Pricing Rules - Set dynamic pricing logic</li>
                                <li>Constraints - Define business rules</li>
                                <li>Orders - Handle customer orders (coming soon)</li>
                                <li>Analytics - View performance data (coming soon)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    };
    return (
        <div className="admin-dashboard">      <header className="admin-dashboard__header">
            <div>
            <h1 className="admin-dashboard__title">
                🛠️ Marcus's Bicycle Shop Admin
            </h1>
            <p className="admin-dashboard__subtitle">
                Manage products, pricing, and business rules
            </p>
            </div>
            {onBackToCustomer && (
            <button 
                className="app__cart-button"
                onClick={onBackToCustomer}
                style={{ alignSelf: 'flex-start' }}
            >
                🏪 Back to Customer View
            </button>
            )}
        </header>
        <nav className="admin-dashboard__nav">
            {tabs.map((tab) => (
            <button
                key={tab.id}
                className={`admin-dashboard__tab ${
                activeTab === tab.id ? 'admin-dashboard__tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
            >
                <span className="admin-dashboard__tab-icon">{tab.icon}</span>
                <span className="admin-dashboard__tab-label">{tab.label}</span>
            </button>
            ))}
        </nav>
        <main className="admin-dashboard__main">
            {renderTabContent()}
        </main>
        </div>
    );
    }
