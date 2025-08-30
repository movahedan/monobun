# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the API application.

## Application Overview

**api** is a Node.js/Express backend API server built with TypeScript, providing REST endpoints for the monorepo applications. It runs on **port 3003** and uses modern development tooling with Bun and tsup.

## Essential Commands

### Development
- `bun run dev` - Start development server with hot reload on port 3003
- `bun run build` - Build TypeScript to JavaScript in `dist/`
- `bun run start` - Start production server from built files
- `bun run check:types` - Run TypeScript type checking

## Technology Stack

### Core Framework
- **Express 5.1.0** - Modern Express.js server framework  
- **TypeScript** - Type-safe server development
- **Bun Runtime** - Fast JavaScript runtime for development

### Middleware & Utilities
- **cors 2.8.5** - Cross-Origin Resource Sharing
- **body-parser 2.2.0** - Request body parsing  
- **morgan 1.10.1** - HTTP request logging
- **@repo/utils** - Shared utilities (logger)

### Development Tools
- **tsup 8.5.0** - Fast TypeScript bundler
- **supertest 7.1.4** - HTTP testing library
- **@repo/test-preset** - Shared testing configuration

## Architecture

### Project Structure
```
apps/api/
├── src/
│   ├── routes/           # Route handlers
│   │   ├── auth/        # Authentication routes
│   │   ├── products/    # Product management
│   │   ├── users/       # User management
│   │   └── index.ts     # Route registration
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── error.ts     # Error handling
│   │   └── validation.ts # Request validation
│   ├── services/        # Business logic layer
│   │   ├── auth.ts      # Authentication service
│   │   ├── products.ts  # Product service
│   │   └── users.ts     # User service
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # API-specific utilities
│   └── index.ts         # Application entry point
├── dist/                # Built JavaScript files
├── tsconfig.json        # TypeScript configuration
├── tsup.config.ts       # Build configuration
└── package.json         # Dependencies and scripts
```

### Development Patterns

#### Express Application Setup
```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { logger } from '@repo/utils/logger';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API server started on port ${PORT}`);
});

export default app;
```

#### Route Handler Pattern
```typescript
// src/routes/products/index.ts
import { Router } from 'express';
import { logger } from '@repo/utils/logger';
import { productService } from '../../services/products';
import { validateProduct } from '../../middleware/validation';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    logger.info('Fetching products list');
    
    const { page = 1, limit = 10, category } = req.query;
    const products = await productService.getProducts({
      page: Number(page),
      limit: Number(limit),
      category: category as string
    });

    logger.info('Products fetched successfully', { 
      count: products.length,
      page,
      limit 
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: products.length
      }
    });
  } catch (error) {
    logger.error('Failed to fetch products', { error });
    next(error);
  }
});

// POST /api/products
router.post('/', authMiddleware, validateProduct, async (req, res, next) => {
  try {
    logger.info('Creating new product', { body: req.body });
    
    const product = await productService.createProduct(req.body);
    
    logger.info('Product created successfully', { id: product.id });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Failed to create product', { error });
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching product by ID', { id });
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    logger.info('Product fetched successfully', { id });
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Failed to fetch product', { id: req.params.id, error });
    next(error);
  }
});

export default router;
```

#### Service Layer Pattern
```typescript
// src/services/products.ts
import { logger } from '@repo/utils/logger';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface GetProductsOptions {
  page: number;
  limit: number;
  category?: string;
}

class ProductService {
  async getProducts(options: GetProductsOptions): Promise<Product[]> {
    try {
      logger.info('Service: Fetching products', options);
      
      // Database query logic here
      // For now, returning mock data
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Sample Product',
          description: 'A sample product',
          price: 29.99,
          category: 'electronics',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Apply filtering
      let results = mockProducts;
      if (options.category) {
        results = results.filter(p => p.category === options.category);
      }

      // Apply pagination
      const startIndex = (options.page - 1) * options.limit;
      results = results.slice(startIndex, startIndex + options.limit);

      logger.info('Service: Products fetched', { count: results.length });
      return results;
    } catch (error) {
      logger.error('Service: Failed to fetch products', { error });
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      logger.info('Service: Fetching product by ID', { id });
      
      // Database query logic here
      // For now, returning mock data
      const mockProduct: Product = {
        id,
        name: 'Sample Product',
        description: 'A sample product',
        price: 29.99,
        category: 'electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('Service: Product fetched', { id });
      return mockProduct;
    } catch (error) {
      logger.error('Service: Failed to fetch product', { id, error });
      throw error;
    }
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      logger.info('Service: Creating product', data);
      
      // Database insertion logic here
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('Service: Product created', { id: product.id });
      return product;
    } catch (error) {
      logger.error('Service: Failed to create product', { data, error });
      throw error;
    }
  }
}

export const productService = new ProductService();
```

#### Middleware Patterns
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Auth middleware: No token provided');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Token validation logic here
    // For now, mock validation
    const user = await validateToken(token);
    
    if (!user) {
      logger.warn('Auth middleware: Invalid token');
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = user;
    logger.info('Auth middleware: User authenticated', { userId: user.id });
    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/utils/logger';

export const validateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, price, category } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!description || typeof description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    errors.push('Price is required and must be a positive number');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (errors.length > 0) {
    logger.warn('Validation failed', { errors });
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Express error handler', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

## Development Guidelines

### API Design Principles
- **RESTful endpoints** following REST conventions
- **Consistent response format** with success/error structure
- **Proper HTTP status codes** for different scenarios
- **Comprehensive logging** for monitoring and debugging
- **Error handling** at all layers

### Response Format Standards
```typescript
// Success responses
{
  "success": true,
  "data": {...},
  "pagination": {...} // for paginated responses
}

// Error responses
{
  "success": false,
  "error": "Error message",
  "details": [...] // for validation errors
}
```

### Security Best Practices
- Input validation on all endpoints
- Proper authentication middleware
- CORS configuration for allowed origins
- Rate limiting for API protection
- Secure headers and middleware

### Testing Patterns
```typescript
import { describe, it, expect } from 'bun:test';
import request from 'supertest';
import app from '../src/index';

describe('Products API', () => {
  it('GET /api/products should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('POST /api/products should create new product', async () => {
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      category: 'test'
    };

    const response = await request(app)
      .post('/api/products')
      .send(productData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(productData.name);
  });

  it('GET /api/products/:id should return 404 for non-existent product', async () => {
    const response = await request(app)
      .get('/api/products/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Product not found');
  });
});
```

## Integration with Monorepo

### Port Configuration
- Runs on port 3003 by default
- Configured to accept requests from frontend apps (ports 3001, 3002)
- CORS properly configured for cross-origin requests

### Shared Dependencies
- **@repo/utils**: Uses logger for consistent logging across the monorepo
- **@repo/test-preset**: Shared testing configuration and utilities

### Frontend Integration
- Provides REST API endpoints for admin and storefront applications  
- Consistent response formats for easy frontend integration
- Proper error handling and status codes

When working with this API application, focus on building robust, scalable REST endpoints while maintaining consistency with monorepo patterns and leveraging shared utilities.