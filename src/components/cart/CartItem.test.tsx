import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItemComponent } from './CartItem';
import type { CartItem } from '../../types';

const mockCartItem: CartItem = {
  id: 'item-1',
  productConfigurationId: 'config-1',
  quantity: 2,
  unitPrice: 150,
  totalPrice: 300,
  configuration: {
    id: 'config-1',
    productId: 'product-1',
    selections: [
      { partTypeId: 'frame', partOptionId: 'aluminum', quantity: 1 },
      { partTypeId: 'wheels', partOptionId: 'road', quantity: 1 },
    ],
    totalPrice: 150,
    isValid: true,
  },
  product: {
    id: 'product-1',
    name: 'Road Bike Pro',
    description: 'Professional road bike',
    categoryId: 'bicycles',
    basePrice: 500,
    isActive: true,
  },
};

describe('CartItemComponent', () => {
  it('renders item name correctly', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Road Bike Pro')).toBeInTheDocument();
  });

  it('displays correct unit price', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Unit Price: €150.00')).toBeInTheDocument();
  });

  it('displays correct total price', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Total: €300.00')).toBeInTheDocument();
  });

  it('displays correct quantity in select', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('2');
  });

  it('calls onUpdateQuantity when quantity changes', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '5' } });

    expect(onUpdateQuantity).toHaveBeenCalledWith('item-1', 5);
  });

  it('calls onRemove when remove button is clicked', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('item-1');
  });

  it('renders configuration selections', () => {
    const onUpdateQuantity = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemComponent
        item={mockCartItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText(/Part: frame - Option: aluminum/)).toBeInTheDocument();
    expect(screen.getByText(/Part: wheels - Option: road/)).toBeInTheDocument();
  });
});
