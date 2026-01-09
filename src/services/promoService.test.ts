import { describe, it, expect } from 'vitest';
import { promoService } from './promoService';

describe('promoService', () => {
  describe('validatePromoCode', () => {
    describe('WELCOME10 - 10% discount', () => {
      it('should validate WELCOME10 and return 10% discount', () => {
        const result = promoService.validatePromoCode('WELCOME10', 100);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(10);
        expect(result.promoCode?.type).toBe('percentage');
        expect(result.promoCode?.value).toBe(10);
      });

      it('should calculate 10% correctly for large orders', () => {
        const result = promoService.validatePromoCode('WELCOME10', 1500);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(150);
      });

      it('should handle decimal calculations correctly', () => {
        const result = promoService.validatePromoCode('WELCOME10', 99.99);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBeCloseTo(10, 1);
      });
    });

    describe('BIKE20 - €20 fixed discount with €500 minimum', () => {
      it('should validate BIKE20 for orders over €500', () => {
        const result = promoService.validatePromoCode('BIKE20', 600);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(20);
        expect(result.promoCode?.type).toBe('fixed');
      });

      it('should reject BIKE20 for orders under €500', () => {
        const result = promoService.validatePromoCode('BIKE20', 400);
        expect(result.isValid).toBe(false);
        expect(result.discountAmount).toBe(0);
        expect(result.error).toContain('500');
      });

      it('should accept BIKE20 for orders exactly €500', () => {
        const result = promoService.validatePromoCode('BIKE20', 500);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(20);
      });
    });

    describe('FREERIDE - 15% discount', () => {
      it('should validate FREERIDE and return 15% discount', () => {
        const result = promoService.validatePromoCode('FREERIDE', 200);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(30);
        expect(result.promoCode?.value).toBe(15);
      });
    });

    describe('SUMMER25 - 25% discount with €1000 minimum', () => {
      it('should validate SUMMER25 for orders over €1000', () => {
        const result = promoService.validatePromoCode('SUMMER25', 1200);
        expect(result.isValid).toBe(true);
        expect(result.discountAmount).toBe(300);
      });

      it('should reject SUMMER25 for orders under €1000', () => {
        const result = promoService.validatePromoCode('SUMMER25', 800);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('1000');
      });
    });

    describe('case insensitivity', () => {
      it('should handle lowercase codes', () => {
        const result = promoService.validatePromoCode('welcome10', 100);
        expect(result.isValid).toBe(true);
      });

      it('should handle mixed case codes', () => {
        const result = promoService.validatePromoCode('WeLcOmE10', 100);
        expect(result.isValid).toBe(true);
      });

      it('should trim whitespace', () => {
        const result = promoService.validatePromoCode('  WELCOME10  ', 100);
        expect(result.isValid).toBe(true);
      });
    });

    describe('invalid codes', () => {
      it('should reject invalid promo codes', () => {
        const result = promoService.validatePromoCode('INVALID', 100);
        expect(result.isValid).toBe(false);
        expect(result.discountAmount).toBe(0);
        expect(result.error).toBe('Invalid promo code');
      });

      it('should reject empty string', () => {
        const result = promoService.validatePromoCode('', 100);
        expect(result.isValid).toBe(false);
      });

      it('should reject whitespace only', () => {
        const result = promoService.validatePromoCode('   ', 100);
        expect(result.isValid).toBe(false);
      });
    });

    describe('fixed discount edge cases', () => {
      it('should not exceed order total for fixed discount', () => {
        const result = promoService.validatePromoCode('BIKE20', 510);
        expect(result.discountAmount).toBe(20);
      });
    });
  });

  describe('getAvailablePromoCodes', () => {
    it('should return list of active promo codes', () => {
      const codes = promoService.getAvailablePromoCodes();
      expect(codes.length).toBeGreaterThan(0);
      expect(codes.every((code) => code.isActive)).toBe(true);
    });

    it('should include WELCOME10 in available codes', () => {
      const codes = promoService.getAvailablePromoCodes();
      const welcome10 = codes.find((c) => c.code === 'WELCOME10');
      expect(welcome10).toBeDefined();
      expect(welcome10?.description).toBeDefined();
    });

    it('should include all expected promo codes', () => {
      const codes = promoService.getAvailablePromoCodes();
      const codenames = codes.map((c) => c.code);
      expect(codenames).toContain('WELCOME10');
      expect(codenames).toContain('BIKE20');
      expect(codenames).toContain('FREERIDE');
      expect(codenames).toContain('SUMMER25');
    });
  });
});
