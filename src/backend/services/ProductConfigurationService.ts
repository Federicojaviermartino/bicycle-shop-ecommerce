    import type { 
    Product, 
    PartType, 
    PartOption, 
    ConfigurationConstraint, 
    ConstraintRule,
    PricingRule,
    PricingCondition,
    PricingEffect,
    ProductConfiguration,
    ConfigurationSelection 
    } from '../types/domain.js';
    import type { DatabaseConnection } from '../database/connection.js';
    import { ProductRepository, PartRepository, ConstraintRepository, PricingRepository, ConfigurationRepository } from '../repositories/index.js';
    export class ProductConfigurationService {
    private productRepo: ProductRepository;
    private partRepo: PartRepository;
    private constraintRepo: ConstraintRepository;
    private pricingRepo: PricingRepository;
    private configRepo: ConfigurationRepository;
    constructor(db: DatabaseConnection) {
        this.productRepo = new ProductRepository(db);
        this.partRepo = new PartRepository(db);
        this.constraintRepo = new ConstraintRepository(db);
        this.pricingRepo = new PricingRepository(db);
        this.configRepo = new ConfigurationRepository(db);
    }
    public async validateConfiguration(
        productId: string, 
        selections: ConfigurationSelection[]
    ): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];
        const product = await this.getProduct(productId);
        if (!product) {
        return { isValid: false, errors: ['Product not found'] };
        }
        const constraints = await this.getConstraintsForProduct(product.categoryId);
        const partTypes = await this.getPartTypesForCategory(product.categoryId);
        const requiredPartTypes = partTypes.filter(pt => pt.isRequired);
        for (const requiredPartType of requiredPartTypes) {
        const hasSelection = selections.some(s => s.partTypeId === requiredPartType.id);
        if (!hasSelection) {
            errors.push(`${requiredPartType.name} is required but not selected`);
        }
        }
        for (const constraint of constraints) {
        if (!constraint.isActive) continue;
        const constraintErrors = await this.validateConstraint(constraint, selections);
        errors.push(...constraintErrors);
        }
        for (const selection of selections) {
        const partOption = await this.getPartOption(selection.partOptionId);
        if (!partOption) {
            errors.push(`Selected part option not found`);
            continue;
        }
        if (!partOption.isActive) {
            errors.push(`${partOption.name} is no longer available`);
        }
        if (!partOption.inStock) {
            errors.push(`${partOption.name} is temporarily out of stock`);
        }
        }
        return { isValid: errors.length === 0, errors };
    }
    public async calculatePrice(
        productId: string, 
        selections: ConfigurationSelection[]
    ): Promise<number> {
        const product = await this.getProduct(productId);
        if (!product) return 0;
        let totalPrice = product.basePrice;
        for (const selection of selections) {
        const partOption = await this.getPartOption(selection.partOptionId);
        if (partOption) {
            totalPrice += partOption.basePrice * selection.quantity;
        }
        }
        const pricingRules = await this.getPricingRulesForProduct(product.categoryId);
        const sortedRules = pricingRules
        .filter(rule => rule.isActive)
        .sort((a, b) => a.priority - b.priority);
        for (const rule of sortedRules) {
        const applicableSelections = await this.getApplicableSelections(rule, selections);
        if (applicableSelections.length > 0) {
            totalPrice = await this.applyPricingRule(rule, selections, totalPrice);
        }
        }
        return Math.max(0, totalPrice);
    }
    public async getAvailableOptions(
        productCategoryId: string,
        partTypeId: string,
        currentSelections: ConfigurationSelection[]
    ): Promise<PartOption[]> {
        const allOptions = await this.getPartOptionsForType(partTypeId);
        const constraints = await this.getConstraintsForProduct(productCategoryId);
        const availableOptions: PartOption[] = [];
        for (const option of allOptions) {
        if (!option.isActive || !option.inStock) continue;
        const isAvailable = await this.isOptionAvailable(
            option, 
            currentSelections, 
            constraints
        );
        if (isAvailable) {
            availableOptions.push(option);
        }
        }
        return availableOptions;
    }
    public async createConfiguration(
        productId: string,
        selections: ConfigurationSelection[]
    ): Promise<ProductConfiguration> {
        const validation = await this.validateConfiguration(productId, selections);
        const totalPrice = validation.isValid ? 
        await this.calculatePrice(productId, selections) : 0;
        const configuration: ProductConfiguration = {
        id: this.generateId(),
        productId,
        selections,
        totalPrice,
        isValid: validation.isValid,
        validationErrors: validation.errors,
        createdAt: new Date()
        };
        await this.saveConfiguration(configuration);
        return configuration;
    }
    private async validateConstraint(
        constraint: ConfigurationConstraint,
        selections: ConfigurationSelection[]
    ): Promise<string[]> {
        const errors: string[] = [];
        const rules = await this.getConstraintRules(constraint.id);
        for (const rule of rules) {
        const triggerSelected = selections.some(s => s.partOptionId === rule.triggerPartOptionId);
        const targetSelected = selections.some(s => s.partOptionId === rule.targetPartOptionId);
        switch (rule.ruleType) {
            case 'REQUIRES':
            if (triggerSelected && !targetSelected) {
                const triggerOption = await this.getPartOption(rule.triggerPartOptionId);
                const targetOption = await this.getPartOption(rule.targetPartOptionId);
                errors.push(`${triggerOption?.name} requires ${targetOption?.name}`);
            }
            break;
            case 'FORBIDS':
            if (triggerSelected && targetSelected) {
                const triggerOption = await this.getPartOption(rule.triggerPartOptionId);
                const targetOption = await this.getPartOption(rule.targetPartOptionId);
                errors.push(`${triggerOption?.name} cannot be combined with ${targetOption?.name}`);
            }
            break;
        }
        }
        return errors;
    }
    private async isOptionAvailable(
        option: PartOption,
        currentSelections: ConfigurationSelection[],
        constraints: ConfigurationConstraint[]
    ): Promise<boolean> {
        for (const constraint of constraints) {
        const rules = await this.getConstraintRules(constraint.id);
        for (const rule of rules) {
            if (rule.targetPartOptionId === option.id && rule.ruleType === 'DISABLES') {
            const triggerSelected = currentSelections.some(s => s.partOptionId === rule.triggerPartOptionId);
            if (triggerSelected) return false;
            }
        }
        }
        return true;
    }
    private async applyPricingRule(
        rule: PricingRule,
        selections: ConfigurationSelection[],
        currentPrice: number
    ): Promise<number> {
        const effects = await this.getPricingEffects(rule.id);
        let newPrice = currentPrice;
        for (const effect of effects) {
        switch (effect.effectType) {
            case 'ADD':
            newPrice += effect.value;
            break;
            case 'MULTIPLY':
            newPrice *= effect.value;
            break;
            case 'REPLACE':
            if (!effect.targetPartOptionId) {
                newPrice = effect.value;
            } else {
                const targetSelection = selections.find(s => s.partOptionId === effect.targetPartOptionId);
                if (targetSelection) {
                const originalOption = await this.getPartOption(effect.targetPartOptionId!);
                if (originalOption) {
                    newPrice = newPrice - originalOption.basePrice + effect.value;
                }
                }
            }
            break;
        }
        }
        return newPrice;
    }
    private async getApplicableSelections(
        rule: PricingRule,
        selections: ConfigurationSelection[]
    ): Promise<ConfigurationSelection[]> {
        const conditions = await this.getPricingConditions(rule.id);
        for (const condition of conditions) {
        const hasSelection = selections.some(s => s.partOptionId === condition.partOptionId);
        switch (condition.conditionType) {
            case 'SELECTED':
            if (!hasSelection) return [];
            break;
            case 'NOT_SELECTED':
            if (hasSelection) return [];
            break;
        }
        }
        return selections;
    }
    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    private async getProduct(productId: string): Promise<Product | null> {
        return this.productRepo.getProduct(productId);
    }
    private async getConstraintsForProduct(categoryId: string): Promise<ConfigurationConstraint[]> {
        return this.constraintRepo.getConstraintsForProduct(categoryId);
    }
    private async getPartTypesForCategory(categoryId: string): Promise<PartType[]> {
        return this.partRepo.getPartTypesForCategory(categoryId);
    }
    private async getPartOption(optionId: string): Promise<PartOption | null> {
        return this.partRepo.getPartOption(optionId);
    }
    private async getPricingRulesForProduct(categoryId: string): Promise<PricingRule[]> {
        return this.pricingRepo.getPricingRulesForProduct(categoryId);
    }
    private async getPartOptionsForType(partTypeId: string): Promise<PartOption[]> {
        return this.partRepo.getPartOptionsForType(partTypeId);
    }
    private async getConstraintRules(constraintId: string): Promise<ConstraintRule[]> {
        return this.constraintRepo.getConstraintRules(constraintId);
    }
    private async getPricingConditions(ruleId: string): Promise<PricingCondition[]> {
        return this.pricingRepo.getPricingConditions(ruleId);
    }
    private async getPricingEffects(ruleId: string): Promise<PricingEffect[]> {
        return this.pricingRepo.getPricingEffects(ruleId);
    }
    private async saveConfiguration(configuration: ProductConfiguration): Promise<void> {
        return this.configRepo.saveConfiguration(configuration);
    }
    }
