import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockApiService } from './mockApi';

describe('mockApiService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getProduct', () => {
    it('should return product data', async () => {
      const result = await mockApiService.getProduct('demo-bicycle-1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Custom Mountain Bike');
    });

    it('should return product with correct structure', async () => {
      const result = await mockApiService.getProduct('demo-bicycle-1');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('categoryId');
      expect(result.data).toHaveProperty('basePrice');
      expect(result.data).toHaveProperty('isActive');
    });
  });

  describe('getPartTypes', () => {
    it('should return part types for bicycles category', async () => {
      const result = await mockApiService.getPartTypes('bicycles');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should include all expected part types', async () => {
      const result = await mockApiService.getPartTypes('bicycles');
      const partTypeIds = result.data?.map((pt) => pt.id) || [];
      expect(partTypeIds).toContain('frame-type');
      expect(partTypeIds).toContain('frame-finish');
      expect(partTypeIds).toContain('wheels');
      expect(partTypeIds).toContain('rim-color');
      expect(partTypeIds).toContain('chain');
    });

    it('should have correct part type structure', async () => {
      const result = await mockApiService.getPartTypes('bicycles');
      const partType = result.data?.[0];
      expect(partType).toHaveProperty('id');
      expect(partType).toHaveProperty('name');
      expect(partType).toHaveProperty('description');
      expect(partType).toHaveProperty('isRequired');
      expect(partType).toHaveProperty('displayOrder');
    });
  });

  describe('getPartOptions', () => {
    it('should return options for frame-type', async () => {
      const result = await mockApiService.getPartOptions('frame-type');
      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should include full-suspension option', async () => {
      const result = await mockApiService.getPartOptions('frame-type');
      const options = result.data?.map((o) => o.id) || [];
      expect(options).toContain('full-suspension');
      expect(options).toContain('diamond');
      expect(options).toContain('step-through');
    });

    it('should filter out unavailable options based on constraints', async () => {
      const selections = [{ partTypeId: 'wheels', partOptionId: 'fat-bike-wheels' }];
      const result = await mockApiService.getPartOptions('rim-color', selections);
      const options = result.data?.map((o) => o.id) || [];
      expect(options).not.toContain('red-rim');
    });

    it('should filter mountain wheels when non-full-suspension frame selected', async () => {
      const selections = [{ partTypeId: 'frame-type', partOptionId: 'diamond' }];
      const result = await mockApiService.getPartOptions('wheels', selections);
      const options = result.data?.map((o) => o.id) || [];
      expect(options).not.toContain('mountain-wheels');
    });
  });

  describe('validateConfiguration', () => {
    it('should validate complete valid configuration', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
      expect(result.data?.errors).toHaveLength(0);
    });

    it('should detect missing required parts', async () => {
      const selections = [{ partTypeId: 'frame-type', partOptionId: 'diamond' }];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.errors.length).toBeGreaterThan(0);
    });

    it('should detect mountain wheels without full-suspension constraint', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'mountain-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.errors).toContain('Mountain wheels require full-suspension frame');
    });

    it('should detect fat bike wheels with red rim constraint', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'full-suspension' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'fat-bike-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'red-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.errors).toContain('Red rim color is not available for fat bike wheels');
    });

    it('should calculate correct total price', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      // Base: 800 + Diamond: 100 + Matte: 35 + Road: 80 + Black: 15 + Single: 43 = 1073
      expect(result.data?.totalPrice).toBe(1073);
    });

    it('should apply matte finish premium for full-suspension', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'full-suspension' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.validateConfiguration('demo-bicycle-1', selections);
      // Base: 800 + Full-Suspension: 130 + Matte (premium): 50 + Road: 80 + Black: 15 + Single: 43 = 1118
      expect(result.data?.totalPrice).toBe(1118);
    });
  });

  describe('createConfiguration', () => {
    it('should create valid configuration', async () => {
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const result = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.productId).toBe('demo-bicycle-1');
    });

    it('should reject invalid configuration', async () => {
      const selections = [{ partTypeId: 'frame-type', partOptionId: 'diamond' }];
      const result = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('cart operations', () => {
    it('should get empty cart initially', async () => {
      const result = await mockApiService.getCart('test-cart');
      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(0);
      expect(result.data?.totalAmount).toBe(0);
    });

    it('should add item to cart', async () => {
      const cartId = 'add-test-cart-' + Date.now();
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const config = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      const result = await mockApiService.addToCart(cartId, config.data!.id, 1);

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.totalAmount).toBeGreaterThan(0);
    });

    it('should update cart item quantity', async () => {
      const cartId = 'update-test-cart-' + Date.now();
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const config = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      await mockApiService.addToCart(cartId, config.data!.id, 1);
      const cart = await mockApiService.getCart(cartId);
      const itemId = cart.data!.items[0].id;

      const result = await mockApiService.updateCartItem(cartId, itemId, 3);
      expect(result.success).toBe(true);
      expect(result.data?.items[0].quantity).toBe(3);
    });

    it('should remove item from cart', async () => {
      const cartId = 'remove-test-cart-' + Date.now();
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const config = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      await mockApiService.addToCart(cartId, config.data!.id, 1);
      const cart = await mockApiService.getCart(cartId);
      const itemId = cart.data!.items[0].id;

      const result = await mockApiService.removeCartItem(cartId, itemId);
      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(0);
    });

    it('should persist cart to localStorage', async () => {
      const cartId = 'persist-test-cart-' + Date.now();
      const selections = [
        { partTypeId: 'frame-type', partOptionId: 'diamond' },
        { partTypeId: 'frame-finish', partOptionId: 'matte' },
        { partTypeId: 'wheels', partOptionId: 'road-wheels' },
        { partTypeId: 'rim-color', partOptionId: 'black-rim' },
        { partTypeId: 'chain', partOptionId: 'single-speed' },
      ];
      const config = await mockApiService.createConfiguration('demo-bicycle-1', selections);
      await mockApiService.addToCart(cartId, config.data!.id, 1);

      const stored = localStorage.getItem('bicycle-shop-carts');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed[cartId]).toBeDefined();
    });
  });
});
