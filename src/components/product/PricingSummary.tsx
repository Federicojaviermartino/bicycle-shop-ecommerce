import { useState } from 'react';
import type { ConfigurationValidation } from '../../types';

interface PriceBreakdownItem {
  partTypeName: string;
  optionName: string | null;
  price: number;
}

interface PricingSummaryProps {
  validation: ConfigurationValidation;
  onAddToCart: () => void;
  isAddingToCart?: boolean;
  productName?: string;
  basePrice?: number;
  priceBreakdown?: PriceBreakdownItem[];
}

export function PricingSummary({
  validation,
  onAddToCart,
  isAddingToCart = false,
  productName,
  basePrice = 0,
  priceBreakdown = [],
}: PricingSummaryProps) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);

  const optionsTotal = priceBreakdown.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="pricing-summary">
      <div className="pricing-summary__content">
        <div className="pricing-summary__breakdown">
          <button
            className="pricing-summary__breakdown-toggle"
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
            aria-expanded={isBreakdownExpanded}
          >
            <span>Price Breakdown</span>
            <span className="pricing-summary__toggle-icon">{isBreakdownExpanded ? '−' : '+'}</span>
          </button>

          {isBreakdownExpanded && (
            <div className="pricing-summary__breakdown-list">
              {productName && (
                <div className="pricing-summary__breakdown-item pricing-summary__breakdown-item--base">
                  <span className="pricing-summary__breakdown-label">
                    Base Price ({productName})
                  </span>
                  <span className="pricing-summary__breakdown-value">€{basePrice.toFixed(2)}</span>
                </div>
              )}

              {priceBreakdown.map((item, index) => (
                <div key={index} className="pricing-summary__breakdown-item">
                  <span className="pricing-summary__breakdown-label">
                    {item.partTypeName}: {item.optionName}
                  </span>
                  <span className="pricing-summary__breakdown-value">
                    {item.price > 0 ? `+€${item.price.toFixed(2)}` : 'Included'}
                  </span>
                </div>
              ))}

              {priceBreakdown.length > 0 && (
                <div className="pricing-summary__breakdown-item pricing-summary__breakdown-item--subtotal">
                  <span className="pricing-summary__breakdown-label">Options Subtotal</span>
                  <span className="pricing-summary__breakdown-value">
                    €{optionsTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pricing-summary__total">
          <span className="pricing-summary__label">Total Price:</span>
          <span className="pricing-summary__amount" aria-live="polite">
            €{validation.totalPrice.toFixed(2)}
          </span>
        </div>

        {validation.errors.length > 0 && (
          <div className="pricing-summary__errors" role="alert">
            <h4>Configuration Issues:</h4>
            <ul>
              {validation.errors.map((error, index) => (
                <li key={index} className="pricing-summary__error">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pricing-summary__actions">
          <button
            className={`btn btn--primary ${!validation.isValid ? 'btn--disabled' : ''}`}
            onClick={onAddToCart}
            disabled={!validation.isValid || isAddingToCart}
          >
            {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
          </button>
        </div>

        {validation.isValid && (
          <div className="pricing-summary__valid">✓ Configuration is valid and ready to order</div>
        )}
      </div>
    </div>
  );
}
