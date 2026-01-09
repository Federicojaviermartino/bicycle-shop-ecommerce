import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductConfiguration } from './useProductConfiguration';

vi.mock('../services/api', () => ({
  apiService: {
    getProduct: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'test-product',
        name: 'Test Bike',
        categoryId: 'bicycles',
        basePrice: 500,
        isActive: true,
      },
    }),
    getPartTypes: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'frame',
          name: 'Frame',
          productCategoryId: 'bicycles',
          isRequired: true,
          displayOrder: 1,
        },
        {
          id: 'wheels',
          name: 'Wheels',
          productCategoryId: 'bicycles',
          isRequired: true,
          displayOrder: 2,
        },
      ],
    }),
    getPartOptions: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'aluminum',
          name: 'Aluminum',
          partTypeId: 'frame',
          basePrice: 200,
          isActive: true,
          inStock: true,
        },
        {
          id: 'carbon',
          name: 'Carbon',
          partTypeId: 'frame',
          basePrice: 400,
          isActive: true,
          inStock: true,
        },
      ],
    }),
    validateConfiguration: vi.fn().mockResolvedValue({
      success: true,
      data: { isValid: true, errors: [], totalPrice: 700 },
    }),
  },
}));

describe('useProductConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    expect(result.current.selections).toEqual([]);
    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.totalPrice).toBe(0);
  });

  it('loads part types on mount', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBeGreaterThan(0);
    });

    expect(result.current.partTypes).toHaveLength(2);
    expect(result.current.partTypes[0].name).toBe('Frame');
  });

  it('updates selection when updateSelection is called', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.updateSelection('frame', 'aluminum');
    });

    expect(result.current.selections).toContainEqual({
      partTypeId: 'frame',
      partOptionId: 'aluminum',
      quantity: 1,
    });
  });

  it('replaces existing selection for same part type', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.updateSelection('frame', 'aluminum');
    });

    act(() => {
      result.current.updateSelection('frame', 'carbon');
    });

    const frameSelections = result.current.selections.filter((s) => s.partTypeId === 'frame');
    expect(frameSelections).toHaveLength(1);
    expect(frameSelections[0].partOptionId).toBe('carbon');
  });

  it('removes selection when removeSelection is called', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.updateSelection('frame', 'aluminum');
    });

    expect(result.current.selections).toHaveLength(1);

    act(() => {
      result.current.removeSelection('frame');
    });

    expect(result.current.selections).toHaveLength(0);
  });

  it('getSelectedOption returns correct option id', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.updateSelection('frame', 'carbon');
    });

    expect(result.current.getSelectedOption('frame')).toBe('carbon');
    expect(result.current.getSelectedOption('wheels')).toBeNull();
  });

  it('does not load data when productId is empty', () => {
    const { result } = renderHook(() => useProductConfiguration(''));

    expect(result.current.partTypes).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('sorts part types by display order', async () => {
    const { result } = renderHook(() => useProductConfiguration('test-product'));

    await waitFor(() => {
      expect(result.current.partTypes.length).toBe(2);
    });

    expect(result.current.partTypes[0].displayOrder).toBeLessThan(
      result.current.partTypes[1].displayOrder
    );
  });
});
