import type { Product, PartType, PartOption, ConfigurationSelection, ConfigurationValidation, Cart, CartItem, ProductConfiguration } from '../types';
const mockProduct: Product = {
    id: 'demo-bicycle-1',
    name: 'Custom Mountain Bike',
    description: 'Build your perfect mountain bike with premium components',
    categoryId: 'bicycles',
    basePrice: 800,
    isActive: true,
};
const mockPartTypes: PartType[] = [
    {
        id: 'frame-type',
        name: 'Frame Type',
        description: 'Choose your frame style',
        productCategoryId: 'bicycles',
        isRequired: true,
        displayOrder: 1,
    },
    {
        id: 'frame-finish',
        name: 'Frame Finish',
        description: 'Select the frame finish',
        productCategoryId: 'bicycles',
        isRequired: true,
        displayOrder: 2,
    },
    {
        id: 'wheels',
        name: 'Wheels',
        description: 'Choose your wheel type',
        productCategoryId: 'bicycles',
        isRequired: true,
        displayOrder: 3,
    },
    {
        id: 'rim-color',
        name: 'Rim Color',
        description: 'Pick your rim color',
        productCategoryId: 'bicycles',
        isRequired: true,
        displayOrder: 4,
    },
    {
        id: 'chain',
        name: 'Chain',
        description: 'Select chain type',
        productCategoryId: 'bicycles',
        isRequired: true,
        displayOrder: 5,
    },
];
const mockPartOptions: Record<string, PartOption[]> = {
    'frame-type': [
        {
            id: 'full-suspension',
            name: 'Full-Suspension',
            description: 'Premium suspension system for rough terrain',
            partTypeId: 'frame-type',
            basePrice: 130,
            isActive: true,
            inStock: true,
            stockCount: 15,
        },
        {
            id: 'diamond',
            name: 'Diamond',
            description: 'Classic diamond frame design',
            partTypeId: 'frame-type',
            basePrice: 100,
            isActive: true,
            inStock: true,
            stockCount: 25,
        },
        {
            id: 'step-through',
            name: 'Step-Through',
            description: 'Easy-access step-through design',
            partTypeId: 'frame-type',
            basePrice: 110,
            isActive: true,
            inStock: true,
            stockCount: 20,
        },
    ],
    'frame-finish': [
        {
            id: 'matte',
            name: 'Matte',
            description: 'Professional matte finish',
            partTypeId: 'frame-finish',
            basePrice: 35, // Base price, varies by frame type
            isActive: true,
            inStock: true,
        },
        {
            id: 'shiny',
            name: 'Shiny',
            description: 'High-gloss shiny finish',
            partTypeId: 'frame-finish',
            basePrice: 30,
            isActive: true,
            inStock: true,
        },
    ],
    'wheels': [
        {
            id: 'road-wheels',
            name: 'Road Wheels',
            description: 'Lightweight wheels for road cycling',
            partTypeId: 'wheels',
            basePrice: 80,
            isActive: true,
            inStock: true,
            stockCount: 30,
        },
        {
            id: 'mountain-wheels',
            name: 'Mountain Wheels',
            description: 'Heavy-duty wheels for mountain biking',
            partTypeId: 'wheels',
            basePrice: 120,
            isActive: true,
            inStock: true,
            stockCount: 18,
        },
        {
            id: 'fat-bike-wheels',
            name: 'Fat Bike Wheels',
            description: 'Extra-wide wheels for sand and snow',
            partTypeId: 'wheels',
            basePrice: 200,
            isActive: true,
            inStock: true,
            stockCount: 8,
        },
    ],
    'rim-color': [
        {
            id: 'red-rim',
            name: 'Red',
            description: 'Vibrant red rim color',
            partTypeId: 'rim-color',
            basePrice: 20,
            isActive: true,
            inStock: true,
        },
        {
            id: 'black-rim',
            name: 'Black',
            description: 'Classic black rim color',
            partTypeId: 'rim-color',
            basePrice: 15,
            isActive: true,
            inStock: true,
        },
        {
            id: 'blue-rim',
            name: 'Blue',
            description: 'Cool blue rim color',
            partTypeId: 'rim-color',
            basePrice: 20,
            isActive: true,
            inStock: true,
        },
    ],
    'chain': [
        {
            id: 'single-speed',
            name: 'Single-Speed Chain',
            description: 'Simple and reliable single-speed chain',
            partTypeId: 'chain',
            basePrice: 43,
            isActive: true,
            inStock: true,
            stockCount: 50,
        },
        {
            id: '8-speed',
            name: '8-Speed Chain',
            description: 'Versatile 8-speed chain system',
            partTypeId: 'chain',
            basePrice: 65,
            isActive: true,
            inStock: true,
            stockCount: 35,
        },
    ],
};
const validateConfiguration = (selections: ConfigurationSelection[]): ConfigurationValidation => {
    const errors: string[] = [];
    let totalPrice = mockProduct.basePrice;
    const selectedOptions = selections.map(s => {
        const partOptions = mockPartOptions[s.partTypeId] || [];
        return partOptions.find(opt => opt.id === s.partOptionId);
    }).filter(Boolean) as PartOption[];
    totalPrice += selectedOptions.reduce((sum, opt) => sum + opt.basePrice, 0);
    const requiredPartTypes = mockPartTypes.filter(pt => pt.isRequired);
    for (const partType of requiredPartTypes) {
        const hasSelection = selections.some(s => s.partTypeId === partType.id);
        if (!hasSelection) {
            errors.push(`${partType.name} is required but not selected`);
        }
    }
    const mountainWheelsSelected = selections.some(s => s.partOptionId === 'mountain-wheels');
    const fullSuspensionSelected = selections.some(s => s.partOptionId === 'full-suspension');
    if (mountainWheelsSelected && !fullSuspensionSelected) {
        errors.push('Mountain wheels require full-suspension frame');
    }
    const fatBikeWheelsSelected = selections.some(s => s.partOptionId === 'fat-bike-wheels');
    const redRimSelected = selections.some(s => s.partOptionId === 'red-rim');
    if (fatBikeWheelsSelected && redRimSelected) {
        errors.push('Red rim color is not available for fat bike wheels');
    }
    const frameFinishSelection = selections.find(s => s.partTypeId === 'frame-finish');
    const frameTypeSelection = selections.find(s => s.partTypeId === 'frame-type');
    if (frameFinishSelection && frameTypeSelection) {
        const isMatte = frameFinishSelection.partOptionId === 'matte';
        const isFullSuspension = frameTypeSelection.partOptionId === 'full-suspension';
        if (isMatte && isFullSuspension) {
            totalPrice = totalPrice - 35 + 50; // Remove base price, add full-suspension price
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        totalPrice: Math.max(0, totalPrice),
    };
};
const getAvailableOptions = (partTypeId: string, currentSelections: ConfigurationSelection[]): PartOption[] => {
    const allOptions = mockPartOptions[partTypeId] || [];
    return allOptions.filter(option => {
        if (partTypeId === 'rim-color' && option.id === 'red-rim') {
            const fatBikeSelected = currentSelections.some(s => s.partOptionId === 'fat-bike-wheels');
            if (fatBikeSelected) return false;
        }
        if (partTypeId === 'wheels' && option.id === 'mountain-wheels') {
            const frameSelection = currentSelections.find(s => s.partTypeId === 'frame-type');
            if (frameSelection && frameSelection.partOptionId !== 'full-suspension') {
                return false;
            }
        }
        return option.isActive && option.inStock;
    });
};
class MockApiService {
    private mockCarts: Record<string, Cart> = {};
    private mockConfigurations: Record<string, ProductConfiguration> = {};

    async getProduct(_id: string) {
        void _id;
        await this.delay(200);
        return { success: true, data: mockProduct };
    }
    async getPartTypes(_categoryId: string) {
        void _categoryId;
        await this.delay(150);
        return { success: true, data: mockPartTypes };
    }
    async getPartOptions(partTypeId: string, currentSelections?: ConfigurationSelection[]) {
        await this.delay(100);
        const options = getAvailableOptions(partTypeId, currentSelections || []);
        return { success: true, data: options };
    }
    async validateConfiguration(_productId: string, selections: ConfigurationSelection[]) {
        await this.delay(100);
        const validation = validateConfiguration(selections);
        return { success: true, data: validation };
    }    async createConfiguration(productId: string, selections: ConfigurationSelection[]) {
        await this.delay(200);
        const validation = validateConfiguration(selections);
        if (!validation.isValid) {
            return { success: false, error: 'Configuration is invalid' };
        }
        const configuration = {
            id: 'config-' + Date.now(),
            productId,
            selections,
            totalPrice: validation.totalPrice,
            isValid: true,
        };
        
        // Store the configuration for later retrieval
        this.mockConfigurations[configuration.id] = configuration;
        
        return { success: true, data: configuration };
    }    async getCart(cartId: string): Promise<{ success: boolean; data?: Cart }> {
        console.log('MockAPI: getCart called with cartId:', cartId);
        console.log('MockAPI: Available carts:', Object.keys(this.mockCarts));
        await this.delay(100);
        
        // Si el carrito no existe, crearlo vacío
        if (!this.mockCarts[cartId]) {
            console.log('MockAPI: Cart not found, creating empty cart');
            this.mockCarts[cartId] = {
                id: cartId,
                items: [],
                totalAmount: 0,
            };
        }
        
        console.log('MockAPI: Returning cart:', this.mockCarts[cartId]);
        return {
            success: true,
            data: this.mockCarts[cartId]
        };
    }    async addToCart(cartId: string, configurationId: string, quantity: number = 1) {
        console.log('MockAPI: addToCart called with cartId:', cartId, 'configurationId:', configurationId);
        await this.delay(200);
        
        // Get the stored configuration to get the real price
        const storedConfiguration = this.mockConfigurations[configurationId];
        if (!storedConfiguration) {
            console.log('MockAPI: Configuration not found for id:', configurationId);
            return { success: false, error: 'Configuration not found' };
        }
        
        console.log('MockAPI: Found configuration:', storedConfiguration);
        
        // Obtener o crear el carrito
        if (!this.mockCarts[cartId]) {
            console.log('MockAPI: Creating new cart for cartId:', cartId);
            this.mockCarts[cartId] = {
                id: cartId,
                items: [],
                totalAmount: 0,
            };
        }
        
        const cart = this.mockCarts[cartId];
        console.log('MockAPI: Cart before adding item:', cart);
        
        // Use the actual configuration with real price
        const actualUnitPrice = storedConfiguration.totalPrice;
        const mockCartItem: CartItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productConfigurationId: configurationId,
            quantity,
            unitPrice: actualUnitPrice,
            totalPrice: actualUnitPrice * quantity,
            configuration: {
                id: configurationId,
                productId: storedConfiguration.productId,
                selections: storedConfiguration.selections,
                totalPrice: storedConfiguration.totalPrice,
                isValid: storedConfiguration.isValid,
            },
            product: mockProduct
        };
        
        console.log('MockAPI: Created cart item:', mockCartItem);
        
        // Verificar si ya existe un item con la misma configuración
        const existingItemIndex = cart.items.findIndex(
            item => item.productConfigurationId === configurationId
        );
        
        if (existingItemIndex >= 0) {
            // Actualizar cantidad del item existente
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice = 
                cart.items[existingItemIndex].unitPrice * cart.items[existingItemIndex].quantity;
            console.log('MockAPI: Updated existing item');
        } else {
            // Agregar nuevo item
            cart.items.push(mockCartItem);
            console.log('MockAPI: Added new item to cart');
        }
        
        // Recalcular total del carrito
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        
        console.log('MockAPI: Cart after adding item:', cart);
        console.log('MockAPI: All carts now:', this.mockCarts);
        
        return { success: true, data: cart };
    }async updateCartItem(cartId: string, itemId: string, quantity: number) {
        await this.delay(150);
        
        if (!this.mockCarts[cartId]) {
            return { success: false, error: 'Cart not found' };
        }
        
        const cart = this.mockCarts[cartId];
        const item = cart.items.find(item => item.id === itemId);
        
        if (!item) {
            return { success: false, error: 'Item not found' };
        }
        
        item.quantity = quantity;
        item.totalPrice = item.unitPrice * quantity;
        
        // Recalcular total del carrito
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        
        return { success: true, data: cart };
    }      async removeCartItem(cartId: string, itemId: string) {
        console.log('🗑️ MockAPI: removeCartItem called with cartId:', cartId, 'itemId:', itemId);
        await this.delay(150);
        
        if (!this.mockCarts[cartId]) {
            console.log('🗑️ MockAPI: Cart not found for cartId:', cartId);
            return { success: false, error: 'Cart not found' };
        }
        
        const cart = this.mockCarts[cartId];
        console.log('🗑️ MockAPI: Cart before removal:', cart);
        console.log('🗑️ MockAPI: Items before removal:', cart.items.map(item => ({ id: item.id, product: item.product.name })));
        
        const initialItemCount = cart.items.length;
        const itemToRemove = cart.items.find(item => item.id === itemId);
        
        if (!itemToRemove) {
            console.log('🗑️ MockAPI: Item not found with ID:', itemId);
            return { success: false, error: 'Item not found in cart' };
        }
        
        console.log('🗑️ MockAPI: Found item to remove:', itemToRemove);
        
        cart.items = cart.items.filter(item => item.id !== itemId);
        console.log('🗑️ MockAPI: Items after removal:', cart.items.map(item => ({ id: item.id, product: item.product.name })));
        console.log('🗑️ MockAPI: Item count changed from', initialItemCount, 'to', cart.items.length);
        
        // Recalcular total del carrito
        const oldTotal = cart.totalAmount;
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        console.log('🗑️ MockAPI: Total changed from €', oldTotal.toFixed(2), 'to €', cart.totalAmount.toFixed(2));
        
        // Update the cart in storage
        this.mockCarts[cartId] = cart;
        console.log('🗑️ MockAPI: Updated cart in storage');
        
        return { success: true, data: cart };
    }
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export const mockApiService = new MockApiService();
