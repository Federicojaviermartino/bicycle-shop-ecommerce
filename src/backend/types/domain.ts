    export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    }
    export interface Product {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    basePrice: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    }
    export interface PartType {
    id: string;
    name: string;
    description?: string;
    productCategoryId: string;
    isRequired: boolean;
    displayOrder: number;
    }
    export interface PartOption {
    id: string;
    name: string;
    description?: string;
    partTypeId: string;
    basePrice: number;
    isActive: boolean;
    inStock: boolean;
    stockCount?: number;
    imageUrl?: string;
    }
    export interface ConfigurationConstraint {
    id: string;
    name: string;
    description?: string;
    productCategoryId: string;
    constraintType: 'REQUIRED_COMBINATION' | 'FORBIDDEN_COMBINATION' | 'CONDITIONAL_AVAILABILITY';
    isActive: boolean;
    }
    export interface ConstraintRule {
    id: string;
    constraintId: string;
    triggerPartOptionId: string;
    targetPartOptionId: string;
    ruleType: 'REQUIRES' | 'FORBIDS' | 'ENABLES' | 'DISABLES';
    }
    export interface PricingRule {
    id: string;
    name: string;
    description?: string;
    productCategoryId: string;
    ruleType: 'FLAT_ADDITION' | 'PERCENTAGE_MARKUP' | 'REPLACEMENT_PRICE' | 'CONDITIONAL_PRICE';
    priority: number;
    isActive: boolean;
    }
    export interface PricingCondition {
    id: string;
    pricingRuleId: string;
    partOptionId: string;
    conditionType: 'SELECTED' | 'NOT_SELECTED' | 'SELECTED_WITH';
    }
    export interface PricingEffect {
    id: string;
    pricingRuleId: string;
    targetPartOptionId?: string; // null means applies to total
    effectType: 'ADD' | 'MULTIPLY' | 'REPLACE';
    value: number;
    }
    export interface ProductConfiguration {
    id: string;
    productId: string;
    selections: ConfigurationSelection[];
    totalPrice: number;
    isValid: boolean;
    validationErrors?: string[];
    createdAt: Date;
    }
    export interface ConfigurationSelection {
    partTypeId: string;
    partOptionId: string;
    quantity: number;
    }
    export interface CartItem {
    id: string;
    productConfigurationId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addedAt: Date;
    }
    export interface Cart {
    id: string;
    customerId?: string;
    sessionId: string;
    items: CartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    }
    export interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: Address;
    createdAt: Date;
    }
    export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    }
    export interface Order {
    id: string;
    customerId: string;
    orderNumber: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    orderDate: Date;
    estimatedDelivery?: Date;
    }
    export interface OrderItem {
    id: string;
    orderId: string;
    productConfigurationId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    }
