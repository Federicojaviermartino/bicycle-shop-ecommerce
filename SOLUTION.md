# Marcus's Bicycle Shop E-commerce Platform

A comprehensive e-commerce solution for Marcus's bicycle shop that allows customers to fully customize their bicycles with complex configuration rules, dynamic pricing, and inventory management. The platform is designed to be extensible to support other sports equipment in the future.

## 🏗️ Architecture Overview

### Core Design Principles

1. **Extensibility**: Built to support bicycles now, easily expandable to skis, surfboards, roller skates, etc.
2. **Flexibility**: Dynamic product configuration with complex constraint validation
3. **Scalability**: Modular architecture with clear separation of concerns
4. **Type Safety**: Full TypeScript implementation for robust development

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript (planned)
- **Database**: PostgreSQL with relational schema (planned)
- **Styling**: Modern CSS with custom design system

## 📊 Data Model

### Core Entities

```
ProductCategory (bicycles, skis, etc.)
├── Product (specific bicycle models)
├── PartType (frame, wheels, chain, etc.)
│   └── PartOption (specific choices with prices)
├── ConfigurationConstraint (business rules)
│   └── ConstraintRule (specific constraint logic)
└── PricingRule (dynamic pricing logic)
    ├── PricingCondition (when rule applies)
    └── PricingEffect (what happens to price)
```

### Key Design Decisions

1. **Flexible Constraint System**: Supports any type of business rule (REQUIRES, FORBIDS, ENABLES, DISABLES)
2. **Dynamic Pricing Engine**: Context-dependent pricing based on any combination of selections
3. **Immutable Configurations**: Stored snapshots ensure order consistency and enable cart persistence
4. **Extensible Schema**: Easy addition of new product categories without schema changes

See [Database Schema Documentation](src/backend/database/schema.md) for detailed table specifications.

## 👥 Main User Actions

### 1. Product Page Experience

**User Journey**: Customer visits product page to configure and purchase a bicycle

**UI Flow**:
- View product introduction and customization interface
- See all available part types (frame, wheels, chain, etc.) in logical order
- Select options for each required part type
- Real-time price calculation and validation feedback
- Clear error messages for invalid combinations
- Visual indicators for stock availability

**Technical Implementation**:
- `ProductConfigurator` component orchestrates the entire experience
- `useProductConfiguration` hook manages state and API interactions
- `PartSelector` components show available options based on current selections
- `PricingSummary` displays real-time pricing and validation results

**Price Calculation Logic**:
```typescript
// Base calculation: sum of all selected part prices
totalPrice = product.basePrice + sum(selectedPartPrices)

// Apply pricing rules in priority order
for (rule of applicablePricingRules) {
  if (ruleConditionsMet(rule, selections)) {
    totalPrice = applyPricingEffect(rule, totalPrice)
  }
}
```

**Constraint Validation**:
- Required parts must be selected
- Forbidden combinations are prevented
- Out-of-stock items are disabled
- Real-time feedback as user makes selections

### 2. Add to Cart Action

**User Journey**: Customer clicks "Add to Cart" after completing configuration

**What Happens**:
1. Final validation of the complete configuration
2. Creation of immutable `ProductConfiguration` record
3. Addition to shopping cart with quantity
4. Price lock-in for order consistency
5. Cart overlay displays with success feedback

**Database Changes**:
```sql
-- Create configuration snapshot
INSERT INTO product_configurations (product_id, total_price, is_valid, ...)
INSERT INTO configuration_selections (configuration_id, part_type_id, part_option_id, ...)

-- Add to cart
INSERT INTO cart_items (cart_id, product_configuration_id, quantity, unit_price, ...)
UPDATE carts SET total_amount = ..., updated_at = NOW()
```

**Benefits of This Approach**:
- Configuration remains valid even if parts go out of stock later
- Price is locked when added to cart
- Order history shows exactly what was ordered
- Cart can be persisted across sessions

## 🔧 Administrative Workflows

### 1. New Product Creation

**Information Required**:
- Product name and description
- Product category (determines available part types)
- Base price
- Active status

**Database Changes**:
```sql
INSERT INTO products (name, description, category_id, base_price, is_active)
```

**UI Workflow**:
1. Admin selects product category from dropdown
2. Enters product details (name, description, base price)
3. Sets initial active status
4. System automatically inherits part types from category
5. Admin can then configure specific pricing rules for this product

### 2. Adding New Part Choice (e.g., New Rim Color)

**Scenario**: Marcus wants to add "Green" as a new rim color option

**UI Workflow**:
1. Navigate to Part Management → Rim Color
2. Click "Add New Option"
3. Enter details:
   - Name: "Green"
   - Description: "Vibrant green finish"
   - Base Price: €25.00
   - Stock Count: 50
   - Upload product image
4. Set availability and stock status
5. Save changes

**Database Changes**:
```sql
INSERT INTO part_options (
  name, description, part_type_id, base_price, 
  is_active, in_stock, stock_count, image_url
) VALUES (
  'Green', 'Vibrant green finish', 
  [rim_color_part_type_id], 25.00, 
  true, true, 50, '/images/rim-green.jpg'
)
```

**Automatic Effects**:
- New option immediately appears in customer configurator
- No constraint rules needed unless there are restrictions
- Price automatically included in calculations

### 3. Setting Prices and Combination Rules

**Scenario**: Marcus wants to set up complex pricing where frame finish costs depend on frame type

**UI Workflow**:
1. Navigate to Pricing Rules → Create New Rule
2. Select rule type: "Conditional Price"
3. Configure conditions:
   - **When**: Frame Type = "Full Suspension"
   - **And**: Frame Finish = "Matte"
   - **Then**: Replace matte finish price with €50.00
4. Set rule priority and activation
5. Test with sample configurations

**Database Implementation**:
```sql
-- Create pricing rule
INSERT INTO pricing_rules (name, product_category_id, rule_type, priority)
VALUES ('Frame Finish - Full Suspension', [bicycle_category_id], 'REPLACEMENT_PRICE', 1)

-- Define conditions
INSERT INTO pricing_conditions (pricing_rule_id, part_option_id, condition_type)
VALUES 
  ([rule_id], [full_suspension_option_id], 'SELECTED'),
  ([rule_id], [matte_finish_option_id], 'SELECTED')

-- Define effect
INSERT INTO pricing_effects (pricing_rule_id, target_part_option_id, effect_type, value)
VALUES ([rule_id], [matte_finish_option_id], 'REPLACE', 50.00)
```

**Constraint Rules Example**:
```sql
-- Mountain wheels require full suspension frame
INSERT INTO configuration_constraints (name, product_category_id, constraint_type)
VALUES ('Mountain Wheels Compatibility', [bicycle_category_id], 'REQUIRED_COMBINATION')

INSERT INTO constraint_rules (constraint_id, trigger_part_option_id, target_part_option_id, rule_type)
VALUES ([constraint_id], [mountain_wheels_id], [full_suspension_frame_id], 'REQUIRES')
```

## 🏃‍♂️ Getting Started

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── components/          # React components
│   ├── product/        # Product configuration UI
│   ├── cart/          # Shopping cart components
│   └── admin/         # Administrative interfaces
├── hooks/             # Custom React hooks
├── services/          # API communication
├── types/            # TypeScript type definitions
└── backend/          # Backend domain logic
    ├── models/       # Domain models
    ├── services/     # Business logic
    ├── types/        # Backend types
    └── database/     # Schema documentation
```

## 🚀 Extensibility Features

### Adding New Product Categories

The system is designed to easily support new product types:

1. **Add Product Category**: Create new category (e.g., "Skis")
2. **Define Part Types**: Add relevant parts (length, bindings, boots, etc.)
3. **Configure Options**: Add specific options for each part type
4. **Set Constraints**: Define valid/invalid combinations
5. **Pricing Rules**: Set up category-specific pricing logic

**Example for Skis**:
```sql
INSERT INTO product_categories (name) VALUES ('Skis');
INSERT INTO part_types (name, product_category_id, is_required) VALUES 
  ('Ski Length', [ski_category_id], true),
  ('Binding Type', [ski_category_id], true),
  ('Boot Size', [ski_category_id], true);
```

### Future Enhancements

1. **Advanced Inventory Management**: Real-time stock tracking, reorder points
2. **Customer Accounts**: Saved configurations, order history, wishlists  
3. **3D Visualization**: Interactive 3D preview of configured products
4. **Bulk Pricing**: Quantity discounts, wholesale pricing tiers
5. **Multi-language**: Internationalization support
6. **Mobile App**: React Native implementation
7. **Analytics Dashboard**: Sales insights, popular configurations

## 🔍 Key Implementation Details

### Configuration Validation Engine

The system implements a sophisticated constraint validation system:

```typescript
// Example constraint validation
if (mountainWheelsSelected && !fullSuspensionFrame) {
  errors.push("Mountain wheels require full-suspension frame")
}

if (fatBikeWheelsSelected && redRimColorSelected) {
  errors.push("Red rim color not available for fat bike wheels")
}
```

### Dynamic Pricing Algorithm

Pricing rules are applied in priority order with support for:
- **Flat Addition**: Add fixed amount
- **Percentage Markup**: Multiply by factor
- **Price Replacement**: Override specific part price
- **Conditional Logic**: Apply based on other selections

### Performance Considerations

- **Optimistic UI Updates**: Immediate feedback while validating
- **Debounced API Calls**: Reduce server load during configuration
- **Cached Options**: Part options cached based on current selections
- **Lazy Loading**: Load part options only when needed

## 📝 Trade-offs and Decisions

### 1. Stored Configurations vs Real-time Calculation
**Decision**: Store configuration snapshots
**Rationale**: Ensures order consistency, enables cart persistence, preserves pricing at time of selection

### 2. Relational vs NoSQL Database
**Decision**: PostgreSQL with relational schema
**Rationale**: Complex relationships, ACID compliance, mature tooling, JSON support for flexible fields

### 3. Client-side vs Server-side Validation
**Decision**: Both (client for UX, server for security)
**Rationale**: Immediate feedback for users, authoritative validation on server

### 4. Monolithic vs Microservices
**Decision**: Monolithic initially with modular structure
**Rationale**: Simpler deployment and development for initial scale, easy to extract services later

### 5. Generic vs Product-specific Models
**Decision**: Generic constraint and pricing system
**Rationale**: Supports any product type without code changes, easier maintenance

This architecture provides a solid foundation for Marcus's growing business while maintaining the flexibility to expand into new product categories and markets.
