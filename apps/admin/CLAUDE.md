# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the admin application.

## Application Overview

**admin** is a React-based admin dashboard built with Vite, providing management interfaces and administrative functionality. It runs on **port 3001** in the monorepo setup.

## Essential Commands

### Development
- `bun run dev` - Start development server on port 3001
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check:types` - Run TypeScript type checking

## Technology Stack

### Core Framework
- **React 19.1.1** - Modern React with latest features
- **Vite 7.0.6** - Fast development and build tool
- **TypeScript** - Type-safe development

### UI & Styling  
- **@repo/ui** - Shared component library (Button, Card, Input, etc.)
- **@repo/utils** - Shared utilities (cn helper, logger)
- Components use Tailwind CSS via the shared UI library

### Build & Development
- **@vitejs/plugin-react** - React support for Vite
- **@repo/typescript-config** - Shared TypeScript configuration

## Architecture

### Project Structure
```
apps/admin/
├── src/
│   ├── components/     # Admin-specific components
│   ├── pages/          # Route/page components  
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services and data fetching
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Admin-specific utilities
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

### Development Patterns

#### Component Development
```typescript
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { cn } from '@repo/utils/cn';

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  trend,
  className
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {trend && (
          <div className={cn(
            'text-sm',
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
    </Card>
  );
};
```

#### API Service Pattern
```typescript
import { logger } from '@repo/utils/logger';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

class AdminService {
  private baseUrl = '/api/admin';

  async getUsers(): Promise<User[]> {
    try {
      logger.info('Fetching users list');
      const response = await fetch(`${this.baseUrl}/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const users = await response.json();
      logger.info('Users fetched successfully', { count: users.length });
      return users;
    } catch (error) {
      logger.error('Failed to fetch users', { error });
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      logger.info('Updating user', { id, updates });
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const user = await response.json();
      logger.info('User updated successfully', { id });
      return user;
    } catch (error) {
      logger.error('Failed to update user', { id, error });
      throw error;
    }
  }
}

export const adminService = new AdminService();
```

#### Custom Hook Pattern
```typescript
import { useState, useEffect } from 'react';
import { adminService } from '../services/admin-service';
import type { User } from '../types/user';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};
```

## Development Guidelines

### State Management
- Use React hooks (useState, useEffect, useContext) for local state
- Consider Context API for app-wide state
- Custom hooks for reusable stateful logic
- Keep component state minimal and focused

### Error Handling
```typescript
// Error boundary pattern
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Admin app error boundary caught error', {
      error: error.message,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Performance Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Lazy load routes and heavy components
- Optimize images and assets

### UI Consistency
- Always use components from @repo/ui package
- Follow the design system patterns
- Use the cn utility for conditional classes
- Maintain consistent spacing and typography

## Integration with Monorepo

### Shared Dependencies
- **@repo/ui**: Import UI components (Button, Card, Input, etc.)
- **@repo/utils**: Use cn() for classes, logger for logging
- **@repo/typescript-config**: Extends Vite TypeScript configuration

### Port Configuration
The admin app runs on port 3001 by default. This is configured in the development workflow and should not conflict with:
- Storefront (port 3002)  
- API (port 3003)
- UI Storybook (port 3004)

## Testing Guidelines

Use the shared test preset for consistent testing:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'bun:test';
import { DashboardCard } from './dashboard-card';

describe('DashboardCard', () => {
  it('renders title and value correctly', () => {
    render(
      <DashboardCard 
        title="Total Users" 
        value={1234} 
        trend="up" 
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('↗')).toBeInTheDocument();
  });
});
```

When working with this application, focus on building admin-specific functionality while leveraging the shared component library and utilities from the monorepo.