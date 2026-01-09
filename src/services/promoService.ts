import type { PromoCode, PromoValidation } from '../types';

const promoCodes: PromoCode[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    isActive: true,
    description: '10% off your first order',
  },
  {
    code: 'BIKE20',
    type: 'fixed',
    value: 20,
    minOrderValue: 500,
    isActive: true,
    description: '€20 off orders over €500',
  },
  {
    code: 'FREERIDE',
    type: 'percentage',
    value: 15,
    isActive: true,
    description: '15% off - Limited time offer!',
  },
  {
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    minOrderValue: 1000,
    isActive: true,
    description: '25% off orders over €1000',
  },
];

export const promoService = {
  validatePromoCode(code: string, orderTotal: number): PromoValidation {
    const normalizedCode = code.trim().toUpperCase();
    const promo = promoCodes.find((p) => p.code === normalizedCode);

    if (!promo) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Invalid promo code',
      };
    }

    if (!promo.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'This promo code is no longer active',
      };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'This promo code has expired',
      };
    }

    if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
      return {
        isValid: false,
        discountAmount: 0,
        error: `Minimum order value of €${promo.minOrderValue} required`,
      };
    }

    if (promo.maxUses && promo.currentUses && promo.currentUses >= promo.maxUses) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'This promo code has reached its usage limit',
      };
    }

    let discountAmount: number;
    if (promo.type === 'percentage') {
      discountAmount = Math.round(((orderTotal * promo.value) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(promo.value, orderTotal);
    }

    return {
      isValid: true,
      promoCode: promo,
      discountAmount,
    };
  },

  getAvailablePromoCodes(): PromoCode[] {
    return promoCodes.filter((p) => p.isActive);
  },
};
