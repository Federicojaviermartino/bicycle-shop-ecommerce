import type { Cart, CartItem, ProductConfiguration } from '../types/domain.js';
import type { DatabaseConnection } from '../database/connection.js';
import { CartRepository } from '../repositories/CartRepository.js';

export class CartService {
  private cartRepo: CartRepository;

  constructor(db: DatabaseConnection) {
    this.cartRepo = new CartRepository(db);
  }

  public async addToCart(
    cartId: string,
    productConfiguration: ProductConfiguration,
    quantity: number = 1
  ): Promise<Cart> {
    const cart = (await this.getCart(cartId)) || (await this.createCart(cartId));

    const existingItem = cart.items.find(
      (item) => item.productConfigurationId === productConfiguration.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
      const cartItem: CartItem = {
        id: this.generateId(),
        productConfigurationId: productConfiguration.id,
        quantity,
        unitPrice: productConfiguration.totalPrice,
        totalPrice: productConfiguration.totalPrice * quantity,
        addedAt: new Date(),
      };
      cart.items.push(cartItem);
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  public async removeFromCart(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.id !== itemId);
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  public async updateQuantity(cartId: string, itemId: string, newQuantity: number): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find((item) => item.id === itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    if (newQuantity <= 0) {
      return this.removeFromCart(cartId, itemId);
    }

    item.quantity = newQuantity;
    item.totalPrice = item.unitPrice * newQuantity;
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  public async clearCart(cartId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  public async getCartWithDetails(cartId: string): Promise<Cart | null> {
    return this.getCart(cartId);
  }

  private async createCart(sessionId: string): Promise<Cart> {
    const cart: Cart = {
      id: this.generateId(),
      sessionId,
      items: [],
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.saveCart(cart);
    return cart;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).slice(2, 11);
  }

  private async getCart(cartId: string): Promise<Cart | null> {
    return this.cartRepo.getCart(cartId);
  }

  private async saveCart(cart: Cart): Promise<void> {
    if (cart.items.length === 0) {
      await this.cartRepo.updateCart(cart);
    } else {
      await this.cartRepo.createCart(cart);
    }
  }
}
