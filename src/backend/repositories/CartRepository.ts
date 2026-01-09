import type { DatabaseConnection } from '../database/connection';
import type { Cart, CartItem } from '../types/domain';
export class CartRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  async getCart(cartId: string): Promise<Cart | null> {
    const cartResult = await this.db.query<Cart>('SELECT * FROM carts WHERE id = $1', [cartId]);
    if (cartResult.rows.length === 0) {
      return null;
    }
    const cart = cartResult.rows[0];
    const itemsResult = await this.db.query<CartItem>(
      `SELECT ci.*, pc.product_id, pc.total_price as unit_price
                FROM cart_items ci
                JOIN product_configurations pc ON ci.product_configuration_id = pc.id
                WHERE ci.cart_id = $1
                ORDER BY ci.added_at DESC`,
      [cartId]
    );
    cart.items = itemsResult.rows;
    return cart;
  }
  async createCart(cart: Cart): Promise<Cart> {
    const result = await this.db.query<Cart>(
      `INSERT INTO carts (id, customer_id, session_id, total_amount, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
      [cart.id, cart.customerId, cart.sessionId, cart.totalAmount, cart.createdAt, cart.updatedAt]
    );
    return result.rows[0];
  }
  async updateCart(cart: Cart): Promise<Cart> {
    const result = await this.db.query<Cart>(
      `UPDATE carts 
        SET total_amount = $2, updated_at = $3
        WHERE id = $1
       RETURNING *`,
      [cart.id, cart.totalAmount, cart.updatedAt]
    );
    return result.rows[0];
  }
  async addCartItem(cartId: string, item: CartItem): Promise<CartItem> {
    const result = await this.db.query<CartItem>(
      `INSERT INTO cart_items (id, cart_id, product_configuration_id, quantity, unit_price, total_price, added_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
      [
        item.id,
        cartId,
        item.productConfigurationId,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        item.addedAt,
      ]
    );
    return result.rows[0];
  }
  async updateCartItem(
    itemId: string,
    quantity: number,
    totalPrice: number
  ): Promise<CartItem | null> {
    const result = await this.db.query<CartItem>(
      `UPDATE cart_items 
        SET quantity = $2, total_price = $3
        WHERE id = $1
        RETURNING *`,
      [itemId, quantity, totalPrice]
    );
    return result.rows[0] || null;
  }
  async removeCartItem(itemId: string): Promise<void> {
    await this.db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
  }
  async clearCart(cartId: string): Promise<void> {
    await this.db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  }
}
