import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartSelector } from './PartSelector';
import type { PartType, PartOption } from '../../types';

const mockPartType: PartType = {
  id: 'frame-type',
  name: 'Frame Type',
  description: 'Choose your frame style',
  productCategoryId: 'bicycles',
  isRequired: true,
  displayOrder: 1,
};

const mockOptions: PartOption[] = [
  {
    id: 'aluminum',
    name: 'Aluminum Frame',
    description: 'Lightweight and durable',
    partTypeId: 'frame-type',
    basePrice: 200,
    isActive: true,
    inStock: true,
    stockCount: 25,
  },
  {
    id: 'carbon',
    name: 'Carbon Frame',
    description: 'Ultra-light racing frame',
    partTypeId: 'frame-type',
    basePrice: 500,
    isActive: true,
    inStock: true,
    stockCount: 5,
  },
  {
    id: 'steel',
    name: 'Steel Frame',
    description: 'Classic steel construction',
    partTypeId: 'frame-type',
    basePrice: 150,
    isActive: true,
    inStock: false,
    stockCount: 0,
  },
];

describe('PartSelector', () => {
  it('renders part type name and description', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('Frame Type')).toBeInTheDocument();
    expect(screen.getByText('Choose your frame style')).toBeInTheDocument();
  });

  it('shows required indicator for required parts', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders available options correctly', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('Aluminum Frame')).toBeInTheDocument();
    expect(screen.getByText('Carbon Frame')).toBeInTheDocument();
  });

  it('does not render out of stock options in main list', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    const mainList = screen.queryByRole('radio', { name: /steel/i });
    expect(mainList).not.toBeInTheDocument();
  });

  it('shows out of stock section when items are unavailable', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('Currently out of stock:')).toBeInTheDocument();
    expect(screen.getByText(/Steel Frame/)).toBeInTheDocument();
  });

  it('displays prices correctly', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('+€200.00')).toBeInTheDocument();
    expect(screen.getByText('+€500.00')).toBeInTheDocument();
  });

  it('shows low stock warning for items with stock < 10', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('Only 5 left in stock')).toBeInTheDocument();
  });

  it('calls onSelectionChange when option is clicked', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    const aluminumOption = screen.getByText('Aluminum Frame').closest('.part-option');
    fireEvent.click(aluminumOption!);

    expect(onSelectionChange).toHaveBeenCalledWith('frame-type', 'aluminum');
  });

  it('marks selected option correctly', () => {
    const onSelectionChange = vi.fn();

    render(
      <PartSelector
        partType={mockPartType}
        options={mockOptions}
        selectedOptionId="carbon"
        onSelectionChange={onSelectionChange}
      />
    );

    const carbonRadio = screen.getAllByRole('radio')[1];
    expect(carbonRadio).toBeChecked();
  });

  it('shows no options message when no available options', () => {
    const onSelectionChange = vi.fn();
    const emptyOptions: PartOption[] = [];

    render(
      <PartSelector
        partType={mockPartType}
        options={emptyOptions}
        selectedOptionId={null}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });
});
