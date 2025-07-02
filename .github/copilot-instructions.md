# Copilot Instructions for Marcus's Bicycle Shop E-commerce Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an e-commerce platform for a bicycle shop that allows customers to fully customize their bicycles. The system needs to handle complex product configurations, pricing rules, and inventory management.

## Key Requirements:

### Product Configuration System
- Products (bicycles) have multiple customizable parts (frame, wheels, chains, etc.)
- Each part has multiple options with different attributes and prices
- Some combinations are prohibited due to real-world constraints
- Parts can be marked as "temporarily out of stock"

### Pricing System
- Base price calculation: sum of individual part prices
- Context-dependent pricing: some options cost differently based on other selections
- Example: frame finish pricing depends on frame type (more surface area = higher cost)

### Data Model Considerations
- Extensible design to support future products (skis, surfboards, roller skates)
- Complex constraint system for valid/invalid combinations
- Flexible pricing rules that can depend on any combination of selections

### Architecture Guidelines
- Use TypeScript for type safety with complex configurations
- Implement proper separation between domain logic and presentation
- Design for scalability and maintainability
- Follow SOLID principles for the configuration and pricing systems

## Code Style:
- Use descriptive names for configuration-related classes and methods
- Implement proper error handling for invalid configurations
- Use interfaces to define contracts for extensibility
- Prefer composition over inheritance for part combinations
