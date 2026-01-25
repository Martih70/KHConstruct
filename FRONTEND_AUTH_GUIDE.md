# Frontend Authentication Guide

This guide explains how to use the authentication system in the KHConstruct React frontend.

## Overview

The frontend authentication is managed through:
1. **API Client** (`client/src/services/api.ts`) - Axios instance with interceptors
2. **Auth Store** (`client/src/stores/authStore.ts`) - Zustand state management
3. **Protected Routes** (`client/src/components/auth/ProtectedRoute.tsx`) - Route protection
4. **Types** (`client/src/types/auth.ts`) - TypeScript definitions

## Setup

### 1. Initialize Auth State

The auth store automatically hydrates from localStorage when the app loads:

```typescript
import { useAuthStore } from '@/stores/authStore';

function App() {
  useEffect(() => {
    // Auth state is hydrated from localStorage automatically
    const user = useAuthStore((state) => state.user);
    console.log('Current user:', user);
  }, []);
}
```

### 2. Use Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protect all routes requiring authentication */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />

      {/* Require admin role */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Require estimator or admin */}
      <Route
        path="/estimates"
        element={
          <ProtectedRoute requiredRoles={['estimator', 'admin']}>
            <EstimatesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Usage Examples

### Register User

```typescript
import { useAuthStore } from '@/stores/authStore';

function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      // User is automatically logged in after registration
      navigate('/projects');
    } catch (error) {
      // Error is stored in auth store
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input name="username" type="text" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={isLoading}>Register</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Login User

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
      navigate('/projects');
    } catch (error) {
      // Error message is in auth store
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Username</label>
        <input
          name="username"
          type="text"
          className="input-base"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">Password</label>
        <input
          name="password"
          type="password"
          className="input-base"
          required
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Get Current User

```typescript
import { useAuthStore } from '@/stores/authStore';

function UserProfile() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Logout User

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="btn-secondary">
      Logout
    </button>
  );
}
```

## Making API Calls

The API client automatically includes the JWT token in all requests:

```typescript
import { projectsAPI } from '@/services/api';

// Get all projects (token automatically included)
const response = await projectsAPI.getAll();

// Create project
const newProject = await projectsAPI.create({
  name: 'Kingdom Hall Renovation',
  location: 'London',
  floor_area_m2: 200,
});

// Update project
await projectsAPI.update(projectId, { name: 'Updated Name' });

// Delete project
await projectsAPI.delete(projectId);
```

## Token Refresh

The API client automatically handles token refresh:

```typescript
// If access token expires during a request:
// 1. API returns 401 Unauthorized
// 2. Client automatically refreshes the token
// 3. Retries the original request with new token
// 4. User doesn't need to log in again

// If refresh token is also expired:
// 1. User is logged out automatically
// 2. Redirected to login page
// 3. localStorage is cleared
```

## Error Handling

```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    if (error) {
      // Show error toast/alert
      console.error('Auth error:', error);
      // Clear error after showing
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
```

## API Endpoints

All endpoints are prefixed with `http://localhost:3000/api/v1`:

```typescript
// Auth endpoints (in authAPI)
POST   /auth/register          - Register new user
POST   /auth/login             - Login user
POST   /auth/refresh           - Refresh access token
POST   /auth/logout            - Logout user
GET    /auth/me                - Get current user info

// Coming in Phase 2B (in costItemsAPI)
GET    /cost-items             - List all cost items
GET    /cost-items/:id         - Get specific cost item
POST   /cost-items             - Create cost item
PUT    /cost-items/:id         - Update cost item
DELETE /cost-items/:id         - Delete cost item

// Coming in Phase 2C (in projectsAPI)
GET    /projects               - List all projects
GET    /projects/:id           - Get specific project
POST   /projects               - Create project
PUT    /projects/:id           - Update project
DELETE /projects/:id           - Delete project
```

## Directory Structure

```
client/src/
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx       # Route protection component
├── services/
│   └── api.ts                       # Axios client with interceptors
├── stores/
│   └── authStore.ts                 # Zustand auth state management
├── types/
│   └── auth.ts                      # TypeScript auth types
├── pages/
│   ├── LoginPage.tsx                # (Create these)
│   ├── RegisterPage.tsx             # (Create these)
│   └── ...
└── App.tsx                          # Main app with routes
```

## Best Practices

### 1. Always use auth store for auth operations
```typescript
// ✅ Good
const login = useAuthStore((state) => state.login);
await login(username, password);

// ❌ Bad - Don't call API directly
const response = await fetch('/api/v1/auth/login', ...);
```

### 2. Use ProtectedRoute for sensitive pages
```typescript
// ✅ Good
<Route
  path="/projects"
  element={
    <ProtectedRoute requiredRoles={['estimator', 'admin']}>
      <ProjectsPage />
    </ProtectedRoute>
  }
/>

// ❌ Bad - No protection
<Route path="/projects" element={<ProjectsPage />} />
```

### 3. Handle loading states
```typescript
// ✅ Good
const isLoading = useAuthStore((state) => state.isLoading);
<button disabled={isLoading}>{isLoading ? 'Loading...' : 'Login'}</button>

// ❌ Bad - No feedback to user
<button>Login</button>
```

### 4. Clear errors appropriately
```typescript
// ✅ Good
useEffect(() => {
  if (error) {
    setTimeout(() => clearError(), 5000);
  }
}, [error, clearError]);

// ❌ Bad - Error stays forever
// Don't clear
```

## Test Credentials

```
Username: admin
Password: admin123456
Email: admin@khconstruct.local
```

## Troubleshooting

### "Missing Authorization header"
- Check that tokens are in localStorage
- Verify API client is adding token to requests
- Check CORS configuration

### "Token expired"
- This should be automatic - refresh happens in background
- Check JWT_ACCESS_TOKEN_EXPIRES and JWT_REFRESH_TOKEN_EXPIRES

### "Rate limit exceeded"
- Wait 15 minutes or clear localStorage and try again
- Check that NODE_ENV is 'development' to disable rate limiting

### "Username already exists"
- Choose a different username
- Or login with existing account

## Next Steps

1. Create Login page component (`client/src/pages/LoginPage.tsx`)
2. Create Register page component (`client/src/pages/RegisterPage.tsx`)
3. Create Dashboard with ProtectedRoute wrapper
4. Implement logout button with user profile dropdown
5. Test with Phase 2B endpoints (cost items)

## Further Reading

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com/)
- [React Router Documentation](https://reactrouter.com/)
