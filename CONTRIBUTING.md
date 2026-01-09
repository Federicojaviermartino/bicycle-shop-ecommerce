# Contributing to Marcus's Bicycle Shop

Thank you for considering contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/bicycle-shop-ecommerce.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Project Structure

```
src/
├── backend/         # Mock backend services and data
├── components/      # React components
│   ├── admin/       # Admin dashboard components
│   ├── cart/        # Shopping cart components
│   ├── checkout/    # Checkout flow components
│   ├── common/      # Shared components
│   ├── order/       # Order tracking components
│   └── product/     # Product configurator components
├── hooks/           # Custom React hooks
├── services/        # API and service modules
└── types/           # TypeScript type definitions
```

## Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages using conventional commits

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure the build succeeds: `npm run build`
3. Update documentation if needed
4. Create a pull request with a clear description of changes

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information if relevant
