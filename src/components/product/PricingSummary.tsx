import type { ConfigurationValidation } from '../../types';
interface PricingSummaryProps {
  validation: ConfigurationValidation;
  onAddToCart: () => void;
  isAddingToCart?: boolean;
}
export function PricingSummary({ validation, onAddToCart, isAddingToCart = false }: PricingSummaryProps) {
  return (
    <div className="pricing-summary">
      <div className="pricing-summary__content">
        <div className="pricing-summary__price">
          <span className="pricing-summary__label">Total Price:</span>
          <span className="pricing-summary__amount">€{validation.totalPrice.toFixed(2)}</span>
        </div>
        {validation.errors.length > 0 && (
          <div className="pricing-summary__errors">
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
          <div className="pricing-summary__valid">
            ✓ Configuration is valid and ready to order
          </div>
        )}
      </div>
    </div>
  );
}
