# KHConstruct API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation:**
- `username`: 3-30 characters, unique
- `email`: Valid email format, unique
- `password`: Minimum 8 characters

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "estimator",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "error": "Username already exists"
}
```

---

#### 2. Login User
**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "estimator",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

**Rate Limiting:**
- Max 5 login attempts per 15 minutes per IP
- Disabled in development mode

---

#### 3. Refresh Token
**POST** `/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

**Token Expiration:**
- Access Token: 15 minutes
- Refresh Token: 7 days

---

#### 4. Get Current User
**GET** `/auth/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "estimator"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "User not authenticated"
}
```

---

#### 5. Logout User
**POST** `/auth/logout`

Logout the current user and invalidate their refresh tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Authentication Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Invalid request body |
| 401 | Invalid token | Token is invalid or expired |
| 401 | Authentication required | Missing Authorization header |
| 409 | Already exists | Username or email already registered |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Server error | Internal server error |

---

## User Roles

Users have different permission levels:

### Admin
- Full system access
- User management
- Cost database management
- Project approval
- All estimator and viewer permissions

### Estimator
- Create and edit projects
- Create and submit estimates
- View cost items
- Generate reports
- All viewer permissions

### Viewer
- View-only access to projects
- View reports
- Cannot create or modify data

---

## Security Features

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- Minimum 8 characters required
- Not returned in API responses

### JWT Tokens
- Signed with HS256 algorithm
- Include user ID, username, email, and role
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration
- Refresh tokens stored as hashes in database

### Rate Limiting
- Auth endpoints: 5 attempts per 15 minutes
- API endpoints: 100 requests per minute
- Disabled in development mode

### Input Validation
- All inputs validated with Zod
- Email format validation
- Username uniqueness check
- Password strength requirements

---

## Example Usage

### JavaScript/TypeScript

```typescript
// Register
const registerResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

// Login
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'securePassword123'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Use access token
const meResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when expired
const refreshResponse = await fetch('http://localhost:3000/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

// Logout
const logoutResponse = await fetch('http://localhost:3000/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Test Credentials

After running the server, the following admin user is automatically created:

```
Username: admin
Password: admin123456
Email: admin@khconstruct.local
```

**⚠️ Change this in production!**

---

## Cost Categories Endpoints

### GET All Categories
**GET** `/cost-categories`

Get all cost categories.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CAT-001",
      "name": "Structural Works",
      "description": "Foundation, walls, floors, and structural elements",
      "sort_order": 0,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 7
}
```

### CREATE Category
**POST** `/cost-categories`

Create a new cost category.

**Requires:** Admin or Estimator role

**Request Body:**
```json
{
  "code": "CAT-008",
  "name": "New Category",
  "description": "Category description",
  "sort_order": 7
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "code": "CAT-008",
    "name": "New Category",
    "description": "Category description",
    "sort_order": 7,
    "created_at": "2024-01-15T...",
    "updated_at": "2024-01-15T..."
  }
}
```

---

## Cost Sub-Elements Endpoints

### GET All Sub-Elements
**GET** `/cost-sub-elements`

Get all cost sub-elements.

### GET Sub-Elements by Category
**GET** `/cost-sub-elements/category/:categoryId`

Get sub-elements for a specific category.

### CREATE Sub-Element
**POST** `/cost-sub-elements`

**Requires:** Admin or Estimator role

**Request Body:**
```json
{
  "category_id": 1,
  "code": "SUB-014",
  "name": "New Sub-Element",
  "description": "Description",
  "sort_order": 3
}
```

---

## Cost Items Endpoints

### GET All Cost Items
**GET** `/cost-items`

Get all cost items with optional search/filtering.

**Query Parameters:**
- `searchTerm` - Search in code and description
- `categoryId` - Filter by category
- `subElementId` - Filter by sub-element
- `unitId` - Filter by unit
- `region` - Filter by region
- `isContractorRequired` - Filter by contractor requirement (true/false)

**Example:**
```
GET /cost-items?searchTerm=roof&categoryId=2&isContractorRequired=true
```

### GET Cost Items by Sub-Element
**GET** `/cost-items/sub-element/:subElementId`

Get cost items for a specific sub-element.

### GET Cost Items by Category
**GET** `/cost-items/category/:categoryId`

Get cost items for a specific category.

### CREATE Cost Item
**POST** `/cost-items`

**Requires:** Admin or Estimator role

**Request Body:**
```json
{
  "sub_element_id": 1,
  "code": "ITM-014",
  "description": "Paint exterior walls (per m²)",
  "unit_id": 1,
  "material_cost": 25.00,
  "management_cost": 5.00,
  "contractor_cost": 0.00,
  "is_contractor_required": false,
  "volunteer_hours_estimated": 0.5,
  "waste_factor": 1.05,
  "currency": "GBP",
  "price_date": "2024-01-15",
  "region": "UK"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 14,
    "sub_element_id": 1,
    "code": "ITM-014",
    "description": "Paint exterior walls (per m²)",
    "unit_id": 1,
    "material_cost": 25.00,
    "management_cost": 5.00,
    "contractor_cost": 0.00,
    "is_contractor_required": false,
    "volunteer_hours_estimated": 0.5,
    "waste_factor": 1.05,
    "currency": "GBP",
    "price_date": "2024-01-15",
    "region": "UK",
    "date_recorded": "2024-01-15T...",
    "project_source_id": null,
    "created_at": "2024-01-15T...",
    "updated_at": "2024-01-15T..."
  }
}
```

### UPDATE Cost Item
**PUT** `/cost-items/:id`

**Requires:** Admin or Estimator role

**Request Body:**
```json
{
  "description": "Updated description",
  "material_cost": 30.00,
  "waste_factor": 1.08
}
```

### DELETE Cost Item
**DELETE** `/cost-items/:id`

**Requires:** Admin role only

---

## Units Endpoints

### GET All Units
**GET** `/units`

Get all available units.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "m2",
      "name": "Square Metre",
      "unit_type": "area",
      "created_at": "2024-01-15T..."
    },
    {
      "id": 2,
      "code": "m",
      "name": "Metre",
      "unit_type": "length",
      "created_at": "2024-01-15T..."
    },
    {
      "id": 3,
      "code": "item",
      "name": "Item",
      "unit_type": "count",
      "created_at": "2024-01-15T..."
    },
    {
      "id": 4,
      "code": "hours",
      "name": "Hours",
      "unit_type": "time",
      "created_at": "2024-01-15T..."
    }
  ],
  "count": 4
}
```

---

## Coming Soon

- Projects and estimates endpoints (Phase 2C)
- Reporting endpoints (Phase 4)
- User management endpoints (Phase 5)

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
