export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  isActive: boolean;
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

export interface ConfigurationSelection {
  partTypeId: string;
  partOptionId: string;
  quantity: number;
}

export interface ProductConfiguration {
  id: string;
  productId: string;
  selections: ConfigurationSelection[];
  totalPrice: number;
  isValid: boolean;
  validationErrors?: string[];
}

export interface CartItem {
  id: string;
  productConfigurationId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  configuration: ProductConfiguration;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  totalPrice: number;
}
