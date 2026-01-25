# KHConstruct

Cost forecasting application for Kingdom Hall renovations and maintenance.

## Overview

KHConstruct is a comprehensive web-based system that helps Kingdom Hall congregations estimate renovation and maintenance costs using:
- Historic cost data analysis
- Line-by-line cost breakdown by categories and sub-elements
- Cost-per-m² calculations for benchmarking
- Professional PDF reporting
- Role-based user access (Admin, Estimator, Viewer)

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (WAL mode)
- **Authentication**: JWT with refresh tokens
- **PDF Generation**: PDFKit

## Project Structure

```
khconstruct/
├── client/              # React frontend
├── server/              # Express backend
├── .env.example        # Environment template
├── package.json        # Root workspace
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository and navigate to the project:
```bash
cd /Users/martinhamp/Herd/KHConstruct
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration (JWT secret, ports, etc.)

### Development

Start both server and client in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Server (http://localhost:3000)
npm run dev:server

# Terminal 2: Client (http://localhost:5173)
npm run dev:client
```

### Building

Build for production:

```bash
npm run build
```

### Type Checking

Check TypeScript types:

```bash
npm run type-check
```

## Database Setup

The database is automatically initialized on first server start:
1. SQLite database created at `server/database/khconstruct.db`
2. Migrations run automatically
3. Mock data can be seeded for testing

Database is configured with:
- WAL (Write-Ahead Logging) mode for concurrency
- Foreign key constraints enabled
- Proper indexes for performance

## API Documentation

### Health Endpoints

```
GET /health
GET /api/v1/health
```

### Authentication (Phase 2A - Coming Soon)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token

### Cost Database (Phase 2B - Coming Soon)
- Categories, sub-elements, cost items CRUD
- Supplier management

### Projects (Phase 2C - Coming Soon)
- Project CRUD
- Estimate creation
- PDF/CSV export

## Features Roadmap

### Phase 1: ✅ Foundation Setup - COMPLETE
- ✅ Monorepo structure with npm workspaces
- ✅ Express server with TypeScript
- ✅ React with Vite
- ✅ SQLite with migrations (13 tables)
- ✅ Configuration and logging (Winston)

### Phase 2A: ✅ Authentication & User Management - COMPLETE
- ✅ JWT authentication with refresh tokens
- ✅ User registration with validation
- ✅ User login with bcrypt password verification
- ✅ Role-based access control (Admin, Estimator, Viewer)
- ✅ Rate limiting on auth endpoints
- ✅ Zustand auth store for React
- ✅ Protected route component
- ✅ API interceptors for token management
- ✅ 13 seeded cost items with realistic pricing
- See: `PHASE_2A_SUMMARY.md` for details
- See: `FRONTEND_AUTH_GUIDE.md` for frontend usage

### Phase 2B: ✅ Cost Database CRUD - COMPLETE
- ✅ Repository layer with data access abstraction
- ✅ CRUD endpoints for cost categories
- ✅ CRUD endpoints for sub-elements
- ✅ CRUD endpoints for cost items
- ✅ Advanced cost item search and filtering
- ✅ Input validation with Zod
- ✅ Role-based permissions
- See: `PHASE_2B_SUMMARY.md` for details
- See: `API.md` for endpoint documentation

### Phase 2C: Projects & Estimation Engine
- Project CRUD endpoints
- EstimationEngine service with calculations
- Project estimates line item management
- Cost calculations (material + management + contractor)
- Contingency and waste factor handling

### Phase 3: Frontend Core
- User authentication UI (Login/Register pages)
- Dashboard layout with navigation
- Project estimation interface
- Cost management pages
- Real-time calculations

### Phase 4: Reporting & Analysis
- Historic cost analysis
- PDF report generation (PDFKit)
- CSV/Excel export
- Cost-per-m² calculations with regional filters

### Phase 5: Additional Features
- Supplier management
- Advanced filtering
- Audit logging
- Data import functionality

### Phase 6: Polish & Testing
- Branding and responsive design
- Performance optimization
- Comprehensive testing
- User documentation

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT signing secret (required in production)
- `DATABASE_PATH` - SQLite database location
- `FRONTEND_URL` - Frontend URL for CORS
- And more...

## Branding

### Color Scheme
- **Primary**: #2C5F8D (Professional Blue)
- **Secondary**: #4A7BA7 (Lighter Blue)
- **Accent**: #E67E22 (Construction Orange)
- **Neutral**: #34495E (Dark Gray)
- **Light**: #ECF0F1 (Light Gray)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Servers

Terminal 1 - Start Backend:
```bash
npm run dev:server
# Server running on http://localhost:3000
```

Terminal 2 - Start Frontend:
```bash
npm run dev:client
# Client running on http://localhost:5173
```

### 3. Test Authentication

**Default Admin Credentials:**
```
Username: admin
Password: admin123456
```

**Test with curl:**
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123456"}'

# Get user info (replace TOKEN with access_token from login)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/auth/me
```

### 4. Explore API

See `API.md` for comprehensive API documentation

See `PHASE_2A_SUMMARY.md` for authentication implementation details

See `FRONTEND_AUTH_GUIDE.md` for frontend authentication usage

## Current Status

### ✅ Completed
- **Phase 1**: Foundation setup with database, server, and client
- **Phase 2A**: Full authentication system with JWT, password hashing, RBAC
- **Phase 2B**: Cost database CRUD with repositories, validation, search/filtering
- **Database**: 13 tables with schema, migrations, and seed data
- **Backend**: Express server with error handling, logging, middleware, repositories
- **Frontend**: React with Vite, Tailwind, Zustand auth store
- **Documentation**: API docs, auth guide, implementation summaries

### 🔄 Upcoming
- Phase 2C: Projects and estimation engine
- Phase 3: Frontend components (login, register, dashboard)
- Phase 4: Reporting and PDF generation
- Phase 5: Supplier management
- Phase 6: Polish, testing, branding

## Development Notes

### Database Schema

13 core tables:
1. users
2. user_refresh_tokens
3. cost_categories
4. cost_sub_elements
5. units
6. cost_items
7. projects
8. project_estimates
9. project_actuals
10. project_attachments
11. historic_cost_analysis
12. suppliers
13. cost_item_suppliers

All tables include proper indexes and foreign key constraints.

### Logging

Winston logging configured with:
- Console output with colors
- Error logs to `logs/error.log`
- All logs to `logs/all.log`
- Configurable log level via `LOG_LEVEL` environment variable

## License

Proprietary - Kingdom Hall Renovation System

## Support

For issues or questions, please refer to the implementation plan at:
`/Users/martinhamp/.claude/plans/scalable-zooming-lollipop.md`
