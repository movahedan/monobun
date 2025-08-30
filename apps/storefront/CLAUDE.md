# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the storefront application.

## Application Overview

**storefront** is a Next.js e-commerce frontend application providing customer-facing shopping functionality. It runs on **port 3002** in the monorepo setup and uses the latest Next.js App Router architecture.

## Essential Commands

### Development
- `bun run dev` - Start Next.js development server on port 3002
- `bun run build` - Build for production  
- `bun run start` - Start production server
- `bun run check:types` - Run TypeScript type checking

## Technology Stack

### Core Framework
- **Next.js 15.4.7** - React framework with App Router
- **React 19.1.1** - Modern React with latest features
- **TypeScript** - Type-safe development

### UI & Styling
- **@repo/ui** - Shared component library
- **@repo/utils** - Shared utilities (cn helper, logger)
- Server Components and Client Components patterns

### Build & Development
- **@repo/typescript-config** - Shared TypeScript configuration extending Next.js preset

## Architecture

### Project Structure (App Router)
```
apps/storefront/
├── src/
│   ├── app/                    # App Router directory
│   │   ├── (shop)/            # Route groups
│   │   │   ├── products/      # Product pages
│   │   │   ├── cart/          # Shopping cart
│   │   │   └── checkout/      # Checkout flow
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── loading.tsx        # Loading UI
│   ├── components/            # Reusable components
│   │   ├── ui/                # App-specific UI components
│   │   ├── forms/             # Form components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and configurations
│   │   ├── api.ts             # API client
│   │   ├── auth.ts            # Authentication logic
│   │   └── utils.ts           # App-specific utilities
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

### Development Patterns

#### Server Components (Default)
```typescript
// app/products/page.tsx
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { getProducts } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

// Server Component - runs on server
export default async function ProductsPage() {
  // Direct data fetching in Server Components
  const products = await getProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Server Component with proper typing
async function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-2xl font-bold text-green-600">
          ${product.price.toFixed(2)}
        </p>
        <AddToCartButton productId={product.id} />
      </div>
    </Card>
  );
}
```

#### Client Components
```typescript
'use client'; // Client Component directive

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/utils/cn';
import { logger } from '@repo/utils/logger';

interface AddToCartButtonProps {
  productId: string;
  className?: string;
}

// Client Component for interactivity
export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      logger.info('Adding product to cart', { productId });
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      logger.info('Product added to cart successfully', { productId });
      // Handle success (toast notification, etc.)
    } catch (error) {
      logger.error('Failed to add product to cart', { productId, error });
      // Handle error
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className={cn('w-full mt-4', className)}
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

#### API Routes
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@repo/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching products');
    
    // Simulate database call
    const products = await getProductsFromDatabase();
    
    logger.info('Products fetched successfully', { count: products.length });
    
    return NextResponse.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', { error });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('Creating new product', { body });
    
    // Validate input
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }
    
    const product = await createProduct(body);
    logger.info('Product created successfully', { id: product.id });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error('Failed to create product', { error });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

#### Layout Components
```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Storefront - E-commerce Solution',
  description: 'Modern e-commerce storefront built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

## Development Guidelines

### Server vs Client Components
- **Default to Server Components** for better performance
- **Use Client Components** only when you need:
  - Event handlers (onClick, onChange, etc.)
  - Browser-only APIs
  - React hooks (useState, useEffect, etc.)
- **Mark Client Components** explicitly with `'use client'`

### Data Fetching Patterns
```typescript
// Server Component - direct data fetching
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`/api/products/${params.id}`);
  return <ProductDetail product={product} />;
}

// Client Component - use SWR or React Query for client-side fetching
'use client';
import useSWR from 'swr';

function ClientProductList() {
  const { data: products, error, isLoading } = useSWR('/api/products');
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return <ProductGrid products={products} />;
}
```

### State Management
- **Server State**: Use Server Components and API routes
- **Client State**: React hooks for component-level state
- **Global State**: Context API or state management library
- **URL State**: Next.js searchParams and routing

### Performance Optimization
- Leverage Next.js automatic optimizations
- Use Image component for optimized images
- Implement proper loading states
- Use Suspense boundaries for progressive loading
- Optimize bundle size with dynamic imports

## E-commerce Specific Patterns

### Shopping Cart Implementation
```typescript
// lib/cart-context.tsx
'use client';

import { createContext, useContext, useReducer } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

### SEO and Metadata
```typescript
// app/products/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  return {
    title: `${product.name} | Storefront`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
```

## Integration with Monorepo

### Shared Dependencies
- **@repo/ui**: Use for consistent UI components
- **@repo/utils**: cn() for styling, logger for monitoring

### API Integration
- Communicates with the API app (port 3003) for backend functionality
- Use proper error handling and logging
- Implement proper loading and error states

## Testing Patterns

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'bun:test';
import ProductCard from './product-card';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    image: '/test-image.jpg'
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});
```

When working with this application, leverage Next.js App Router features, maintain proper separation between Server and Client Components, and focus on e-commerce functionality while using shared monorepo resources.