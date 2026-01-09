import { useState } from 'react';

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductMetric {
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

interface ConfigurationMetric {
  name: string;
  count: number;
  percentage: number;
}

const mockSalesData: Record<TimeRange, SalesData[]> = {
  '7d': [
    { date: 'Mon', revenue: 2280, orders: 1 },
    { date: 'Tue', revenue: 1520, orders: 1 },
    { date: 'Wed', revenue: 3800, orders: 2 },
    { date: 'Thu', revenue: 2070, orders: 1 },
    { date: 'Fri', revenue: 4560, orders: 2 },
    { date: 'Sat', revenue: 5280, orders: 3 },
    { date: 'Sun', revenue: 1920, orders: 1 },
  ],
  '30d': [
    { date: 'Week 1', revenue: 12500, orders: 6 },
    { date: 'Week 2', revenue: 15800, orders: 8 },
    { date: 'Week 3', revenue: 18200, orders: 9 },
    { date: 'Week 4', revenue: 21430, orders: 11 },
  ],
  '90d': [
    { date: 'Jan', revenue: 45000, orders: 22 },
    { date: 'Feb', revenue: 52000, orders: 28 },
    { date: 'Mar', revenue: 67930, orders: 34 },
  ],
  '1y': [
    { date: 'Q1', revenue: 165000, orders: 84 },
    { date: 'Q2', revenue: 182000, orders: 95 },
    { date: 'Q3', revenue: 198000, orders: 102 },
    { date: 'Q4', revenue: 215000, orders: 112 },
  ],
};

const mockProductMetrics: ProductMetric[] = [
  { name: 'Custom Mountain Bike', sales: 156, revenue: 312000, percentage: 58 },
  { name: 'City Commuter Bike', sales: 112, revenue: 168000, percentage: 42 },
];

const mockConfigurationMetrics: ConfigurationMetric[] = [
  { name: 'Mountain Frame', count: 156, percentage: 58 },
  { name: 'Road Frame', count: 112, percentage: 42 },
  { name: 'Mountain Wheels (29")', count: 134, percentage: 50 },
  { name: 'Road Wheels (700c)', count: 134, percentage: 50 },
  { name: 'High-Performance Chain', count: 89, percentage: 33 },
  { name: 'Standard Chain', count: 179, percentage: 67 },
  { name: 'Matte Finish', count: 145, percentage: 54 },
  { name: 'Glossy Finish', count: 123, percentage: 46 },
];

const kpiData = {
  '7d': { revenue: 21430, orders: 11, avgOrder: 1948, conversionRate: 3.2 },
  '30d': { revenue: 67930, orders: 34, avgOrder: 1998, conversionRate: 3.5 },
  '90d': { revenue: 164930, orders: 84, avgOrder: 1963, conversionRate: 3.4 },
  '1y': { revenue: 760000, orders: 393, avgOrder: 1934, conversionRate: 3.3 },
};

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const salesData = mockSalesData[timeRange];
  const kpis = kpiData[timeRange];
  const maxRevenue = Math.max(...salesData.map((d) => d.revenue));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(1)}K`;
    return `€${value}`;
  };

  const getGrowthIndicator = () => {
    const growth =
      timeRange === '7d' ? 12.5 : timeRange === '30d' ? 18.2 : timeRange === '90d' ? 24.1 : 15.8;
    return { value: growth, isPositive: true };
  };

  const growth = getGrowthIndicator();

  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Analytics Dashboard</h2>
        <div className="analytics-time-selector">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`analytics-time-selector__btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d'
                ? '7 Days'
                : range === '30d'
                  ? '30 Days'
                  : range === '90d'
                    ? '90 Days'
                    : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-kpis">
        <div className="analytics-kpi">
          <div className="analytics-kpi__icon">💰</div>
          <div className="analytics-kpi__content">
            <span className="analytics-kpi__value">{formatCurrency(kpis.revenue)}</span>
            <span className="analytics-kpi__label">Total Revenue</span>
            <span
              className={`analytics-kpi__growth ${growth.isPositive ? 'positive' : 'negative'}`}
            >
              {growth.isPositive ? '↑' : '↓'} {growth.value}%
            </span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi__icon">📦</div>
          <div className="analytics-kpi__content">
            <span className="analytics-kpi__value">{kpis.orders}</span>
            <span className="analytics-kpi__label">Total Orders</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi__icon">🛒</div>
          <div className="analytics-kpi__content">
            <span className="analytics-kpi__value">{formatCurrency(kpis.avgOrder)}</span>
            <span className="analytics-kpi__label">Avg. Order Value</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi__icon">📈</div>
          <div className="analytics-kpi__content">
            <span className="analytics-kpi__value">{kpis.conversionRate}%</span>
            <span className="analytics-kpi__label">Conversion Rate</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card analytics-card--chart">
          <h3 className="analytics-card__title">Revenue Overview</h3>
          <div className="analytics-chart">
            <div className="analytics-chart__bars">
              {salesData.map((data, index) => (
                <div key={index} className="analytics-chart__bar-container">
                  <div
                    className="analytics-chart__bar"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    title={`${data.date}: ${formatCurrency(data.revenue)}`}
                  />
                  <span className="analytics-chart__label">{data.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3 className="analytics-card__title">Product Performance</h3>
          <div className="analytics-products">
            {mockProductMetrics.map((product, index) => (
              <div key={index} className="analytics-product">
                <div className="analytics-product__header">
                  <span className="analytics-product__name">{product.name}</span>
                  <span className="analytics-product__revenue">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
                <div className="analytics-product__bar-bg">
                  <div
                    className="analytics-product__bar"
                    style={{ width: `${product.percentage}%` }}
                  />
                </div>
                <div className="analytics-product__stats">
                  <span>{product.sales} sales</span>
                  <span>{product.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3 className="analytics-card__title">Popular Configurations</h3>
          <div className="analytics-configs">
            {mockConfigurationMetrics.slice(0, 6).map((config, index) => (
              <div key={index} className="analytics-config">
                <div className="analytics-config__info">
                  <span className="analytics-config__name">{config.name}</span>
                  <span className="analytics-config__count">{config.count} orders</span>
                </div>
                <div className="analytics-config__bar-bg">
                  <div
                    className="analytics-config__bar"
                    style={{ width: `${config.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3 className="analytics-card__title">Recent Activity</h3>
          <div className="analytics-activity">
            <div className="analytics-activity__item">
              <span className="analytics-activity__icon">🛒</span>
              <div className="analytics-activity__content">
                <span className="analytics-activity__text">New order #ORD-2024-005</span>
                <span className="analytics-activity__time">2 hours ago</span>
              </div>
            </div>
            <div className="analytics-activity__item">
              <span className="analytics-activity__icon">📦</span>
              <div className="analytics-activity__content">
                <span className="analytics-activity__text">Order #ORD-2024-002 shipped</span>
                <span className="analytics-activity__time">5 hours ago</span>
              </div>
            </div>
            <div className="analytics-activity__item">
              <span className="analytics-activity__icon">✅</span>
              <div className="analytics-activity__content">
                <span className="analytics-activity__text">Order #ORD-2024-001 delivered</span>
                <span className="analytics-activity__time">1 day ago</span>
              </div>
            </div>
            <div className="analytics-activity__item">
              <span className="analytics-activity__icon">🆕</span>
              <div className="analytics-activity__content">
                <span className="analytics-activity__text">New customer registered</span>
                <span className="analytics-activity__time">2 days ago</span>
              </div>
            </div>
            <div className="analytics-activity__item">
              <span className="analytics-activity__icon">💬</span>
              <div className="analytics-activity__content">
                <span className="analytics-activity__text">Customer inquiry received</span>
                <span className="analytics-activity__time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
