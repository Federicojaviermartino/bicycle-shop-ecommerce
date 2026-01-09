import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from './api';

vi.mock('./mockApi', () => ({
  mockApiService: {
    getProduct: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'test-product',
        name: 'Test Bike',
        description: 'A test bicycle',
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
      ],
    }),
    validateConfiguration: vi.fn().mockResolvedValue({
      success: true,
      data: { isValid: true, errors: [], totalPrice: 700 },
    }),
    createConfiguration: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'config-1',
        productId: 'test-product',
        selections: [],
        totalPrice: 700,
        isValid: true,
      },
    }),
    getCart: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'cart-1', items: [], totalAmount: 0 },
    }),
    addToCart: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'cart-1', items: [], totalAmount: 700 },
    }),
    updateCartItem: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'cart-1', items: [], totalAmount: 1400 },
    }),
    removeCartItem: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'cart-1', items: [], totalAmount: 0 },
    }),
  },
}));

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProduct', () => {
    it('returns product data successfully', async () => {
      const result = await apiService.getProduct('test-product');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Bike');
    });

    it('returns correct product structure', async () => {
      const result = await apiService.getProduct('test-product');

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('basePrice');
      expect(result.data).toHaveProperty('categoryId');
    });
  });

  describe('getPartTypes', () => {
    it('returns part types for category', async () => {
      const result = await apiService.getPartTypes('bicycles');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('returns part types with required fields', async () => {
      const result = await apiService.getPartTypes('bicycles');

      expect(result.data?.[0]).toHaveProperty('id');
      expect(result.data?.[0]).toHaveProperty('name');
      expect(result.data?.[0]).toHaveProperty('isRequired');
    });
  });

  describe('getPartOptions', () => {
    it('returns options for part type', async () => {
      const result = await apiService.getPartOptions('frame');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it('returns options with price information', async () => {
      const result = await apiService.getPartOptions('frame');

      expect(result.data?.[0]).toHaveProperty('basePrice');
      expect(result.data?.[0]).toHaveProperty('inStock');
    });
  });

  describe('validateConfiguration', () => {
    it('returns validation result', async () => {
      const selections = [{ partTypeId: 'frame', partOptionId: 'aluminum', quantity: 1 }];
      const result = await apiService.validateConfiguration('test-product', selections);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('isValid');
      expect(result.data).toHaveProperty('totalPrice');
    });

    it('includes errors array in response', async () => {
      const selections = [{ partTypeId: 'frame', partOptionId: 'aluminum', quantity: 1 }];
      const result = await apiService.validateConfiguration('test-product', selections);

      expect(result.data).toHaveProperty('errors');
      expect(result.data?.errors).toBeInstanceOf(Array);
    });
  });

  describe('createConfiguration', () => {
    it('creates configuration successfully', async () => {
      const selections = [{ partTypeId: 'frame', partOptionId: 'aluminum', quantity: 1 }];
      const result = await apiService.createConfiguration('test-product', selections);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });
  });

  describe('getCart', () => {
    it('returns cart data', async () => {
      const result = await apiService.getCart('cart-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('items');
      expect(result.data).toHaveProperty('totalAmount');
    });
  });

  describe('addToCart', () => {
    it('adds item to cart', async () => {
      const result = await apiService.addToCart('cart-1', 'config-1', 1);

      expect(result.success).toBe(true);
    });
  });

  describe('updateCartItem', () => {
    it('updates cart item quantity', async () => {
      const result = await apiService.updateCartItem('cart-1', 'item-1', 2);

      expect(result.success).toBe(true);
    });
  });

  describe('removeCartItem', () => {
    it('removes item from cart', async () => {
      const result = await apiService.removeCartItem('cart-1', 'item-1');

      expect(result.success).toBe(true);
    });
  });
});
