import type { DatabaseConnection } from '../database/connection.js';
import type { Product, PartType, PartOption, ConfigurationConstraint, ConstraintRule, PricingRule, PricingCondition, PricingEffect, ProductConfiguration, ConfigurationSelection } from '../types/domain.js';
export { CartRepository } from './CartRepository.js';
export class ProductRepository {
    private db: DatabaseConnection;
    
    constructor(db: DatabaseConnection) { 
        this.db = db;
    }
    async getProduct(id: string): Promise<Product | null> {
        const result = await this.db.query<Product>(
            'SELECT * FROM products WHERE id = $1 AND is_active = true',
            [id]
        );
        return result.rows[0] || null;
    }
    async getProductsByCategory(categoryId: string): Promise<Product[]> {
        const result = await this.db.query<Product>(
            'SELECT * FROM products WHERE category_id = $1 AND is_active = true ORDER BY name',
            [categoryId]
        );
        return result.rows;
    }
    async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const result = await this.db.query<Product>(
            `INSERT INTO products (name, description, category_id, base_price, is_active) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [product.name, product.description, product.categoryId, product.basePrice, product.isActive]
        );
        return result.rows[0];
    }
    async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];
        const result = await this.db.query<Product>(
            `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }
}
export class PartRepository {
    private db: DatabaseConnection;
    
    constructor(db: DatabaseConnection) { 
        this.db = db;
    }
    async getPartTypesForCategory(categoryId: string): Promise<PartType[]> {
        const result = await this.db.query<PartType>(
            'SELECT * FROM part_types WHERE product_category_id = $1 ORDER BY display_order, name',
            [categoryId]
        );
        return result.rows;
    }
    async getPartOption(id: string): Promise<PartOption | null> {
        const result = await this.db.query<PartOption>(
            'SELECT * FROM part_options WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }
    async getPartOptionsForType(partTypeId: string): Promise<PartOption[]> {
        const result = await this.db.query<PartOption>(
            'SELECT * FROM part_options WHERE part_type_id = $1 AND is_active = true ORDER BY name',
            [partTypeId]
        );
        return result.rows;
    }
    async updatePartOptionStock(id: string, inStock: boolean, stockCount?: number): Promise<PartOption | null> {
        const result = await this.db.query<PartOption>(
            'UPDATE part_options SET in_stock = $2, stock_count = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id, inStock, stockCount]
        );
        return result.rows[0] || null;
    }
    async createPartOption(option: Omit<PartOption, 'id'>): Promise<PartOption> {
        const result = await this.db.query<PartOption>(
            `INSERT INTO part_options (name, description, part_type_id, base_price, is_active, in_stock, stock_count, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                option.name,
                option.description,
                option.partTypeId,
                option.basePrice,
                option.isActive,
                option.inStock,
                option.stockCount,
                option.imageUrl
            ]
        );
        return result.rows[0];
    }
}
export class ConstraintRepository {
    private db: DatabaseConnection;
    
    constructor(db: DatabaseConnection) { 
        this.db = db;
    }
    async getConstraintsForProduct(categoryId: string): Promise<ConfigurationConstraint[]> {
        const result = await this.db.query<ConfigurationConstraint>(
            'SELECT * FROM configuration_constraints WHERE product_category_id = $1 AND is_active = true',
            [categoryId]
        );
        return result.rows;
    }
    async getConstraintRules(constraintId: string): Promise<ConstraintRule[]> {
        const result = await this.db.query<ConstraintRule>(
            'SELECT * FROM constraint_rules WHERE constraint_id = $1',
            [constraintId]
        );
        return result.rows;
    }
    async createConstraint(constraint: Omit<ConfigurationConstraint, 'id'>): Promise<ConfigurationConstraint> {
        const result = await this.db.query<ConfigurationConstraint>(
            `INSERT INTO configuration_constraints (name, description, product_category_id, constraint_type, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
            [constraint.name, constraint.description, constraint.productCategoryId, constraint.constraintType, constraint.isActive]
        );
        return result.rows[0];
    }
    async createConstraintRule(rule: Omit<ConstraintRule, 'id'>): Promise<ConstraintRule> {
        const result = await this.db.query<ConstraintRule>(
            `INSERT INTO constraint_rules (constraint_id, trigger_part_option_id, target_part_option_id, rule_type)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
            [rule.constraintId, rule.triggerPartOptionId, rule.targetPartOptionId, rule.ruleType]
        );
        return result.rows[0];
    }
}
export class PricingRepository {
    private db: DatabaseConnection;
    
    constructor(db: DatabaseConnection) { 
        this.db = db;
    }
    async getPricingRulesForProduct(categoryId: string): Promise<PricingRule[]> {
        const result = await this.db.query<PricingRule>(
            'SELECT * FROM pricing_rules WHERE product_category_id = $1 AND is_active = true ORDER BY priority DESC',
            [categoryId]
        );
        return result.rows;
    }
    async getPricingConditions(ruleId: string): Promise<PricingCondition[]> {
        const result = await this.db.query<PricingCondition>(
            'SELECT * FROM pricing_conditions WHERE pricing_rule_id = $1',
            [ruleId]
        );
        return result.rows;
    }
    async getPricingEffects(ruleId: string): Promise<PricingEffect[]> {
        const result = await this.db.query<PricingEffect>(
            'SELECT * FROM pricing_effects WHERE pricing_rule_id = $1',
            [ruleId]
        );
        return result.rows;
    }
    async createPricingRule(rule: Omit<PricingRule, 'id'>): Promise<PricingRule> {
        const result = await this.db.query<PricingRule>(
            `INSERT INTO pricing_rules (name, description, product_category_id, rule_type, priority, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
            [rule.name, rule.description, rule.productCategoryId, rule.ruleType, rule.priority, rule.isActive]
        );
        return result.rows[0];
    }
}
export class ConfigurationRepository {
    private db: DatabaseConnection;
    
    constructor(db: DatabaseConnection) { 
        this.db = db;
    }
    async saveConfiguration(configuration: ProductConfiguration): Promise<void> {
        await this.db.transaction(async (client) => {
            await client.query(
                `INSERT INTO product_configurations (id, product_id, total_price, is_valid, validation_errors, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    configuration.id,
                    configuration.productId,
                    configuration.totalPrice,
                    configuration.isValid,
                    JSON.stringify(configuration.validationErrors || []),
                    configuration.createdAt
                ]
            );
            for (const selection of configuration.selections) {
                await client.query(
                    `INSERT INTO configuration_selections (configuration_id, part_type_id, part_option_id, quantity)
           VALUES ($1, $2, $3, $4)`,
                    [configuration.id, selection.partTypeId, selection.partOptionId, selection.quantity]
                );
            }
        });
    }
    async getConfiguration(id: string): Promise<ProductConfiguration | null> {
        const configResult = await this.db.query<ProductConfiguration>(
            'SELECT * FROM product_configurations WHERE id = $1',
            [id]
        );
        if (configResult.rows.length === 0) {
            return null;
        }        const config = configResult.rows[0];
        const selectionsResult = await this.db.query<ConfigurationSelection>(
            'SELECT * FROM configuration_selections WHERE configuration_id = $1',
            [id]
        );
        config.selections = selectionsResult.rows;
        return config;
    }
}
