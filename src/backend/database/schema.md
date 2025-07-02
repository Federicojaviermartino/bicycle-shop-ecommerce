# Database Schema for Marcus's Bicycle Shop E-commerce Platform

This document describes the relational database schema designed to support a flexible, extensible e-commerce platform for customizable products.

## Core Design Principles

1. **Extensibility**: Support for future product categories beyond bicycles
2. **Flexibility**: Dynamic product configuration with complex constraints
3. **Scalability**: Normalized structure for efficient queries
4. **Maintainability**: Clear relationships and well-defined constraints

## Tables and Relationships

### Product Categories and Products

```sql
-- Product categories (bicycles, skis, surfboards, etc.)
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual products within a category
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES product_categories(id),
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Part Types and Options

```sql
-- Types of parts for each product category (frame, wheels, chain, etc.)
CREATE TABLE part_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    product_category_id UUID NOT NULL REFERENCES product_categories(id),
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available options for each part type
CREATE TABLE part_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    part_type_id UUID NOT NULL REFERENCES part_types(id),
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Configuration Constraints

```sql
-- Defines types of constraints between part options
CREATE TABLE configuration_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    product_category_id UUID NOT NULL REFERENCES product_categories(id),
    constraint_type VARCHAR(50) NOT NULL CHECK (constraint_type IN ('REQUIRED_COMBINATION', 'FORBIDDEN_COMBINATION', 'CONDITIONAL_AVAILABILITY')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specific rules within each constraint
CREATE TABLE constraint_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constraint_id UUID NOT NULL REFERENCES configuration_constraints(id),
    trigger_part_option_id UUID NOT NULL REFERENCES part_options(id),
    target_part_option_id UUID NOT NULL REFERENCES part_options(id),
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('REQUIRES', 'FORBIDS', 'ENABLES', 'DISABLES')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Pricing Rules

```sql
-- Defines complex pricing rules that depend on combinations
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    product_category_id UUID NOT NULL REFERENCES product_categories(id),
    rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('FLAT_ADDITION', 'PERCENTAGE_MARKUP', 'REPLACEMENT_PRICE', 'CONDITIONAL_PRICE')),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conditions that must be met for a pricing rule to apply
CREATE TABLE pricing_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_rule_id UUID NOT NULL REFERENCES pricing_rules(id),
    part_option_id UUID NOT NULL REFERENCES part_options(id),
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN ('SELECTED', 'NOT_SELECTED', 'SELECTED_WITH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Effects applied when pricing rule conditions are met
CREATE TABLE pricing_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_rule_id UUID NOT NULL REFERENCES pricing_rules(id),
    target_part_option_id UUID REFERENCES part_options(id), -- NULL means applies to total
    effect_type VARCHAR(20) NOT NULL CHECK (effect_type IN ('ADD', 'MULTIPLY', 'REPLACE')),
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Configurations

```sql
-- Stored product configurations (for cart items, orders, etc.)
CREATE TABLE product_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    total_price DECIMAL(10,2) NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    validation_errors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual selections within a configuration
CREATE TABLE configuration_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID NOT NULL REFERENCES product_configurations(id),
    part_type_id UUID NOT NULL REFERENCES part_types(id),
    part_option_id UUID NOT NULL REFERENCES part_options(id),
    quantity INTEGER DEFAULT 1,
    UNIQUE(configuration_id, part_type_id) -- One selection per part type per configuration
);
```

### Shopping Cart

```sql
-- Shopping carts (session-based or customer-based)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    session_id VARCHAR(200),
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items in shopping carts
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id),
    product_configuration_id UUID NOT NULL REFERENCES product_configurations(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Customers and Orders

```sql
-- Customer information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address_street VARCHAR(200),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0.00,
    shipping DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items within orders
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_configuration_id UUID NOT NULL REFERENCES product_configurations(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Design Decisions

### 1. Flexible Constraint System
- **Configuration Constraints**: Define types of relationships between parts
- **Constraint Rules**: Specific rules (REQUIRES, FORBIDS, ENABLES, DISABLES)
- **Extensible**: Can handle any type of product constraint

### 2. Dynamic Pricing System
- **Pricing Rules**: Define when and how prices change
- **Pricing Conditions**: What selections trigger the rule
- **Pricing Effects**: What happens to the price (ADD, MULTIPLY, REPLACE)
- **Priority System**: Controls order of rule application

### 3. Stored Configurations
- **Product Configurations**: Immutable snapshots of customer selections
- **Benefits**: Order history preservation, cart persistence, pricing consistency

### 4. Extensibility Features
- **Product Categories**: Easy addition of new product types
- **Part Types**: Flexible part structure per category
- **Generic Constraints**: Same system works for any product type

## Example Data Population

### Bicycle Category Setup
```sql
-- Create bicycle category
INSERT INTO product_categories (name, description) 
VALUES ('Bicycles', 'Fully customizable bicycles');

-- Create part types for bicycles
INSERT INTO part_types (name, product_category_id, is_required, display_order) VALUES
('Frame Type', (SELECT id FROM product_categories WHERE name = 'Bicycles'), true, 1),
('Frame Finish', (SELECT id FROM product_categories WHERE name = 'Bicycles'), true, 2),
('Wheels', (SELECT id FROM product_categories WHERE name = 'Bicycles'), true, 3),
('Rim Color', (SELECT id FROM product_categories WHERE name = 'Bicycles'), true, 4),
('Chain', (SELECT id FROM product_categories WHERE name = 'Bicycles'), true, 5);
```

This schema provides a robust foundation for Marcus's e-commerce platform while maintaining the flexibility to expand into other sports equipment categories.
