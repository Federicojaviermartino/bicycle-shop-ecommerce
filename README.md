# 🚴‍♂️ Marcus's Bicycle Shop E-commerce Platform

A comprehensive e-commerce solution for bicycle customization with dynamic pricing, complex configuration rules, and inventory management. Built with modern technologies and designed for extensibility.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🌟 Features

### Customer Experience
- **Interactive Product Configuration**: Real-time bicycle customization with dynamic part selection
- **Smart Pricing Engine**: Context-dependent pricing based on part combinations
- **Constraint Validation**: Intelligent prevention of invalid configurations
- **Shopping Cart**: Persistent cart with price lock-in and automatic updates
- **Real-time Feedback**: Instant validation and stock availability updates

### Admin Dashboard
- **Product Management**: Create and manage bicycle models with pricing
- **Parts & Options**: Comprehensive inventory management for all components
- **Pricing Rules**: Dynamic pricing rules based on complex conditions
- **Business Constraints**: Define compatibility and restriction rules
- **Extensible Design**: Easy addition of new product categories

## 🚀 Live Demo

🔗 **[View Live Demo](https://bicycle-shop-ecommerce.vercel.app)** *(Deploy to see this link)*

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Modern CSS with custom design system
- **State Management**: React Hooks with custom state management
- **Architecture**: Modular component-based architecture
- **Backend Ready**: PostgreSQL schema designed for full-stack implementation

## 📋 Project Structure

```
src/
├── components/
│   ├── product/        # Product configuration UI
│   ├── cart/          # Shopping cart functionality
│   └── admin/         # Administrative dashboard
├── hooks/             # Custom React hooks
├── services/          # API layer and mock services
├── types/            # TypeScript type definitions
└── backend/          # Domain models and business logic
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Federicojaviermartino/bicycle-shop-ecommerce.git
cd bicycle-shop-ecommerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Implementation Highlights

### Dynamic Pricing Engine
```typescript
// Context-dependent pricing example
if (mountainWheelsSelected && fullSuspensionFrame) {
  totalPrice += pricingRules.applySurfaceAreaMultiplier(finishPrice, 1.5);
}
```

### Constraint Validation System
```typescript
// Real-time constraint validation
const constraints = [
  { trigger: 'mountain-wheels', requires: 'full-suspension-frame' },
  { trigger: 'fat-bike-wheels', forbids: 'red-rim-color' }
];
```

### Immutable Configuration Snapshots
- Price lock-in when added to cart
- Configuration remains valid even if parts go out of stock
- Complete order history preservation

## 🏗️ Architecture Features

### ✅ Completed
- [x] Product configuration system with real-time validation
- [x] Dynamic pricing engine with complex rules
- [x] Shopping cart with persistent state
- [x] Admin dashboard for complete management
- [x] TypeScript implementation with full type safety
- [x] Responsive design with modern CSS
- [x] Constraint validation system
- [x] Inventory management

### 🔄 In Progress
- [ ] Backend API implementation
- [ ] Database integration
- [ ] User authentication system
- [ ] Order processing workflow

### 🎯 Future Enhancements
- [ ] 3D product visualization
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration

## 🌍 Extensibility

The platform is designed to easily support new product categories:

- **Skis**: Length, bindings, boots
- **Surfboards**: Size, fins, design
- **Roller Skates**: Wheels, plates, boots
- **Custom Sports Equipment**: Any configurable product

## 📊 Technical Decisions

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **State Management** | React Hooks + Context | Lightweight, perfect for app scale |
| **Pricing Model** | Configuration Snapshots | Price consistency, audit trail |
| **Validation** | Client + Server | UX responsiveness + Security |
| **Architecture** | Modular Components | Maintainability + Testability |

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Federico Javier Martino**
- GitHub: [@Federicojaviermartino](https://github.com/Federicojaviermartino)

## 🙏 Acknowledgments

- Modern e-commerce UX patterns
- React best practices and performance optimization
- TypeScript for robust development experience
- Vite for blazing fast development
