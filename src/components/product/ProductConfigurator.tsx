import { useState } from 'react';
import { useProductConfiguration } from '../../hooks/useProductConfiguration';
import { PartSelector } from './PartSelector';
import { PricingSummary } from './PricingSummary';
import { apiService } from '../../services/api';
import { toast, LoadingOverlay } from '../common';

interface ProductConfiguratorProps {
  productId: string;
  onAddToCart: (configurationId: string) => void;
}

export function ProductConfigurator({ productId, onAddToCart }: ProductConfiguratorProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const {
    partTypes,
    selections,
    validation,
    loading,
    updateSelection,
    getSelectedOption,
    getAvailableOptions,
  } = useProductConfiguration(productId);

  const handleAddToCart = async () => {
    if (!validation.isValid) return;

    setIsAddingToCart(true);
    try {
      const response = await apiService.createConfiguration(productId, selections);
      if (response.success && response.data) {
        onAddToCart(response.data.id);
      } else {
        toast.error('Failed to create configuration: ' + response.error);
      }
    } catch {
      toast.error('Error adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-configurator">
        <LoadingOverlay text="Loading configuration options..." />
      </div>
    );
  }

  return (
    <div className="product-configurator">
      <div className="product-configurator__main">
        <div className="product-configurator__parts">
          <h2>Customize Your Product</h2>
          {partTypes.map((partType) => (
            <PartSelector
              key={partType.id}
              partType={partType}
              options={getAvailableOptions(partType.id)}
              selectedOptionId={getSelectedOption(partType.id)}
              onSelectionChange={updateSelection}
            />
          ))}
        </div>
        <div className="product-configurator__sidebar">
          <PricingSummary
            validation={validation}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
    </div>
  );
}
