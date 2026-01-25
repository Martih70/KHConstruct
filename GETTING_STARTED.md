# Getting Started with KHConstruct

Welcome to KHConstruct! This guide will help you set up and run the application.

## What's Been Completed

### ✅ Phase 1: Foundation (100% Complete)
- Monorepo structure with npm workspaces
- Express TypeScript server
- React Vite frontend with Tailwind CSS
- SQLite database with WAL mode
- Migration system with 13 tables
- Winston logging with file output
- Environment configuration

### ✅ Phase 2A: Authentication (100% Complete)
- User registration with validation
- User login with password hashing
- JWT tokens (access + refresh)
- Refresh token mechanism
- Role-based access control (Admin, Estimator, Viewer)
- Rate limiting on auth endpoints
- Zod input validation
- Zustand auth store for React
- Protected route components
- API client with token interceptors
- Database seeding with:
  - Admin user (username: admin, password: admin123456)
  - 4 units (m², m, item, hours)
  - 7 cost categories
  - 13 cost sub-elements
  - 13 cost items with realistic pricing

## Installation

### Prerequisites
- Node.js 18+ (verify with `node --version`)
- npm 9+ (verify with `npm --version`)

### Steps

1. **Navigate to project directory:**
   ```bash
   cd /Users/martinhamp/Herd/KHConstruct
   ```

2. **Install dependencies (one time only):**
   ```bash
   npm install
   ```

   This installs packages for all workspaces:
   - Server dependencies: express, better-sqlite3, bcrypt, jsonwebtoken, zod, etc.
   - Client dependencies: react, tailwindcss, zustand, axios, etc.

3. **Create environment file (optional, uses defaults):**
   ```bash
   cp .env.example .env
   ```

   Update `.env` if you want to customize:
   - `PORT` (default: 3000)
   - `JWT_SECRET` (must change in production)
   - `DATABASE_PATH` (default: ./database/khconstruct.db)
   - etc.

## Running the Application

### Option 1: Run Both Server & Client (Recommended for Development)

**Single Terminal (runs both in parallel):**
```bash
npm run dev
```

This starts:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173

**Separate Terminals (better for debugging):**

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev:client
```

### Option 2: Production Build

```bash
npm run build

# Then run the built server
node server/dist/index.js
```

## Testing Authentication

### Using curl

1. **Login as admin:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "admin123456"
     }'
   ```

   Response:
   ```json
   {
     "success": true,
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@khconstruct.local",
       "role": "admin",
       "is_active": true,
       "created_at": "2024-01-15T..."
     },
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
     "expiresIn": "15m"
   }
   ```

2. **Get current user (use token from login):**
   ```bash
   curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     http://localhost:3000/api/v1/auth/me
   ```

3. **Register new user:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

4. **Refresh token:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "eyJhbGciOiJIUzI1NiIs..."}'
   ```

### Using Postman

1. Import the API collection from `API.md`
2. Set base URL to `http://localhost:3000/api/v1`
3. Test endpoints:
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me (with token)
   - POST /auth/refresh

### Using Frontend (Phase 3 - Coming Soon)

Once frontend components are built, you'll be able to:
- Register on `/register` page
- Login on `/login` page
- View user profile on dashboard
- Logout via user menu

## Directory Structure

```
khconstruct/
├── server/                         # Express backend
│   ├── src/
│   │   ├── config/                # Configuration
│   │   ├── database/              # Database & migrations
│   │   │   ├── migrations/        # SQL migration files
│   │   │   └── seeds.ts          # Seeding logic
│   │   ├── middleware/            # Auth, validation, rate limiting
│   │   ├── models/                # TypeScript types
│   │   ├── routes/v1/            # API routes
│   │   │   └── auth.ts           # Auth endpoints
│   │   ├── services/              # Business logic
│   │   │   └── authService.ts    # Auth logic
│   │   ├── utils/                 # Utilities
│   │   │   └── logger.ts         # Winston logger
│   │   └── index.ts              # Express app entry
│   ├── database/                  # Database files
│   │   └── khconstruct.db        # SQLite database
│   ├── logs/                      # Log files
│   ├── package.json
│   └── tsconfig.json
│
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   │   └── auth/             # Auth-related components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client
│   │   │   └── api.ts           # Axios instance
│   │   ├── stores/               # Zustand state
│   │   │   └── authStore.ts     # Auth state
│   │   ├── types/                # TypeScript types
│   │   │   └── auth.ts          # Auth types
│   │   ├── App.tsx              # Main app
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Tailwind styles
│   ├── public/                   # Static assets
│   ├── index.html               # HTML template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           # Vite config
│   └── tailwind.config.js       # Tailwind config
│
├── .env.example                  # Environment template
├── .gitignore
├── package.json                  # Root workspace
├── README.md                      # Main documentation
├── API.md                        # API documentation
├── GETTING_STARTED.md           # This file
├── PHASE_2A_SUMMARY.md          # Phase 2A details
└── FRONTEND_AUTH_GUIDE.md       # Frontend auth usage
```

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and features |
| `API.md` | Detailed API endpoint documentation |
| `GETTING_STARTED.md` | This file - setup and usage guide |
| `PHASE_2A_SUMMARY.md` | Authentication implementation details |
| `FRONTEND_AUTH_GUIDE.md` | Frontend authentication usage guide |

## Database

### Location
- File: `server/database/khconstruct.db`
- Type: SQLite with WAL mode enabled
- Auto-created on first server start
- Migrations run automatically

### Tables
1. **users** - User accounts and roles
2. **user_refresh_tokens** - Stored refresh token hashes
3. **cost_categories** - Cost categorization (7 categories)
4. **cost_sub_elements** - Subcategories (13 sub-elements)
5. **units** - Unit types (m², m, item, hours)
6. **cost_items** - Cost line items (13 items with pricing)
7. **projects** - Kingdom Hall renovation projects
8. **project_estimates** - Project cost estimates
9. **project_actuals** - Actual costs after completion
10. **project_attachments** - Project documents/photos
11. **historic_cost_analysis** - Cost-per-m² analysis
12. **suppliers** - Contractor/supplier database
13. **cost_item_suppliers** - Supplier pricing

### Seeded Data

**Admin User:**
```
Username: admin
Password: admin123456
Email: admin@khconstruct.local
Role: admin
```

**Cost Categories:**
- Structural Works
- Roofing
- Electrical Systems
- Plumbing & HVAC
- Interior Finishes
- Exterior Works
- Site Works

**Cost Items (Sample):**
- Concrete foundation repair: £150/m² (material) + £20/m² (management)
- Wall stud replacement: £45/m (material) + £10/m (management)
- Roof tiling: £120/m² (material) + £25/m² (management) + £80/m² (contractor)
- Electrical rewiring: £250/circuit (material) + £30/circuit (management) + £200/circuit (contractor)

## Environment Variables

Create `.env` file with these variables (or use defaults):

```env
# Server
NODE_ENV=development          # development or production
PORT=3000                     # Server port
LOG_LEVEL=debug              # debug, info, warn, error

# Database
DATABASE_PATH=./database/khconstruct.db

# JWT (Change these in production!)
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=15m  # 15 minutes
JWT_REFRESH_TOKEN_EXPIRES=7d  # 7 days

# CORS
FRONTEND_URL=http://localhost:5173

# Optional
DEFAULT_CURRENCY=GBP
INFLATION_API_KEY=
```

## Troubleshooting

### Database errors
```
Error: database file is not a database
```
**Solution:** Delete `server/database/khconstruct.db` and restart - it will be recreated

### Port already in use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
- Change PORT in `.env` to a different port
- Or kill the process using port 3000

### CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure FRONTEND_URL in `.env` matches your frontend URL
- Verify frontend is running on http://localhost:5173
- Check that backend is running on http://localhost:3000

### Token errors
```
Error: Invalid or expired token
```
**Solution:**
- Log in again to get new token
- Access tokens expire after 15 minutes
- Use refresh token to get new access token
- Or wait for automatic token refresh

### Rate limiting
```
Error: Too many authentication attempts
```
**Solution:**
- Wait 15 minutes for rate limit window to reset
- Rate limiting disabled in development mode
- Set NODE_ENV=development in `.env`

## Performance Tips

1. **Development**: Use `npm run dev` to run both servers
2. **Frontend builds**: Use `npm run build --workspace=client`
3. **Type checking**: `npm run type-check` to verify TypeScript
4. **Database**: SQLite WAL mode enabled for better concurrency
5. **Logging**: Adjust LOG_LEVEL to reduce console output

## Next Steps

### Immediate (Phase 2B)
1. Implement cost database CRUD endpoints
2. Create cost item search and filtering
3. Add support for bulk operations

### Short Term (Phase 2C & 3)
1. Create Projects API
2. Build EstimationEngine service
3. Create frontend Login/Register pages
4. Build estimation UI

### Medium Term (Phase 4 & 5)
1. Implement PDF reporting
2. Build cost analysis dashboard
3. Add supplier management
4. Implement data import

### Long Term (Phase 6)
1. Design and apply branding
2. Create comprehensive tests
3. Performance optimization
4. Prepare for deployment

## Support & Issues

For issues or questions:

1. Check the relevant documentation file
2. Review API endpoint documentation
3. Check server logs in `server/logs/`
4. Check browser console for frontend errors
5. Verify database exists: `server/database/khconstruct.db`

## Key Features Implemented

✅ Monorepo structure
✅ Express server with TypeScript
✅ React frontend with Vite
✅ SQLite database with migrations
✅ User registration and login
✅ Password hashing with bcrypt
✅ JWT token management
✅ Role-based access control
✅ Rate limiting
✅ Input validation with Zod
✅ Database seeding
✅ API documentation
✅ Frontend auth store
✅ Protected routes
✅ API interceptors
✅ Logging system

## Summary

KHConstruct is ready for:
- ✅ Testing authentication
- ✅ API development (Phase 2B)
- ✅ Frontend development (Phase 3)
- ✅ Production deployment (future)

The application is built with production-ready practices:
- Strong security (bcrypt, JWT, rate limiting)
- Comprehensive validation (Zod)
- Clean architecture (services, repositories, middleware)
- Good documentation
- Proper error handling
- Logging and monitoring

Enjoy building! 🚀
