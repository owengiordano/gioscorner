# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Customer Browser
       │
       │ (HTTPS)
       ▼
┌──────────────────┐
│  Vercel Frontend │  (React + TypeScript)
│  - Landing Page  │
│  - Menu Page     │
│  - Order Form    │
└────────┬─────────┘
         │
         │ (REST API)
         ▼
┌──────────────────┐
│ Railway Backend  │  (Express + TypeScript)
│  - Order API     │
│  - Menu API      │
└────────┬─────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌──────────────┐  ┌──────────────┐
│   Supabase   │  │   Resend     │
│  (Database)  │  │   (Email)    │
└──────────────┘  └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Admin Browser
       │
       │ (HTTPS + JWT)
       ▼
┌──────────────────┐
│  Vercel Frontend │  (React + TypeScript)
│  - Admin Login   │
│  - Dashboard     │
└────────┬─────────┘
         │
         │ (REST API + JWT)
         ▼
┌──────────────────┐
│ Railway Backend  │  (Express + TypeScript)
│  - Admin Auth    │
│  - Order Mgmt    │
└────────┬─────────┘
         │
         ├─────────────┬─────────────┐
         │             │             │
         ▼             ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │    Stripe    │  │   Resend     │
│  (Database)  │  │  (Invoices)  │  │   (Email)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND STACK                           │
└─────────────────────────────────────────────────────────────────┘

React 18
  ├── TypeScript (Type Safety)
  ├── React Router (Client-side Routing)
  ├── Tailwind CSS (Styling)
  └── Vite (Build Tool)

Hosting: Vercel
  ├── Auto-deploy from GitHub
  ├── Edge Network (CDN)
  ├── Serverless Functions
  └── Free SSL


┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND STACK                            │
└─────────────────────────────────────────────────────────────────┘

Node.js + Express
  ├── TypeScript (Type Safety)
  ├── JWT (Authentication)
  ├── bcrypt (Password Hashing)
  ├── express-validator (Input Validation)
  └── CORS (Security)

Hosting: Railway
  ├── Auto-deploy from GitHub
  ├── Auto-scaling
  ├── Environment Variables
  └── Logging


┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
└─────────────────────────────────────────────────────────────────┘

Supabase (Database)
  ├── PostgreSQL
  ├── Row Level Security
  ├── Auto-backups
  └── Real-time (unused but available)

Stripe (Payments)
  ├── Invoice Creation
  ├── Payment Links
  ├── Customer Management
  └── Webhook Events (optional)

Resend (Email)
  ├── Transactional Emails
  ├── HTML Templates
  ├── Delivery Tracking
  └── Domain Authentication
```

## Data Flow

### Order Creation Flow

```
1. Customer fills form
   └─> Frontend validates (24hr minimum, required fields)
       └─> POST /api/orders
           └─> Backend validates again
               └─> Insert into Supabase (status: pending)
                   └─> Send emails via Resend
                       ├─> Owner: "New order notification"
                       └─> Customer: "Order pending confirmation"
```

### Order Acceptance Flow

```
1. Admin clicks "Accept"
   └─> POST /api/admin/orders/:id/accept (with JWT)
       └─> Backend verifies JWT
           └─> Calculate total price
               └─> Create Stripe invoice
                   └─> Update Supabase (status: accepted, invoice details)
                       └─> Send emails via Resend
                           ├─> Customer: "Order accepted + payment link"
                           └─> Owner: "Acceptance confirmation"
```

### Order Denial Flow

```
1. Admin enters reason and clicks "Deny"
   └─> POST /api/admin/orders/:id/deny (with JWT + reason)
       └─> Backend verifies JWT
           └─> Update Supabase (status: denied, admin_reason)
               └─> Send emails via Resend
                   ├─> Customer: "Order denied + reason"
                   └─> Owner: "Denial confirmation"
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORDERS TABLE                             │
└─────────────────────────────────────────────────────────────────┘

orders
├── id (UUID, PK)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
│
├── Customer Info
│   ├── customer_name (TEXT)
│   ├── customer_email (TEXT)
│   └── address (TEXT)
│
├── Order Details
│   ├── food_selection (JSONB)
│   │   └── [{ menu_item_id, quantity, notes }]
│   ├── date_needed (DATE)
│   └── notes (TEXT, nullable)
│
├── Status & Admin
│   ├── status (TEXT: pending|accepted|denied)
│   └── admin_reason (TEXT, nullable)
│
└── Payment
    ├── stripe_invoice_id (TEXT, nullable)
    ├── stripe_invoice_url (TEXT, nullable)
    └── total_price_cents (INTEGER, nullable)

Indexes:
├── idx_orders_status (for filtering)
└── idx_orders_created_at (for sorting)
```

## API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                            │
└─────────────────────────────────────────────────────────────────┘

Public Routes (No Auth)
├── GET  /api/health
├── GET  /api/menu
└── POST /api/orders

Admin Routes (JWT Required)
├── POST /api/admin/login
├── GET  /api/admin/orders
├── GET  /api/admin/orders/:id
├── POST /api/admin/orders/:id/accept
└── POST /api/admin/orders/:id/deny


┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST/RESPONSE FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Request
  └─> CORS Middleware
      └─> Body Parser
          └─> Logger
              └─> Route Handler
                  └─> Validation Middleware
                      └─> Auth Middleware (if admin route)
                          └─> Controller
                              └─> Service Layer
                                  ├─> Database (Supabase)
                                  ├─> Payment (Stripe)
                                  └─> Email (Resend)
                              └─> Response
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY MEASURES                           │
└─────────────────────────────────────────────────────────────────┘

Frontend Security
├── Environment Variables (VITE_API_URL only)
├── Input Validation (client-side)
├── XSS Protection (React auto-escaping)
├── HTTPS Only (Vercel)
└── Protected Routes (JWT check)

Backend Security
├── Environment Variables (all secrets)
├── Input Validation (express-validator)
├── SQL Injection Protection (Supabase client)
├── CORS Configuration (whitelist frontend)
├── JWT Authentication (admin routes)
├── bcrypt Password Hashing (10 rounds)
├── Rate Limiting (optional, can add)
└── HTTPS Only (Railway)

Database Security
├── Row Level Security (RLS)
├── Service Role Key (backend only)
├── Connection Pooling
└── Auto-backups

API Keys Security
├── Never committed to Git
├── Environment variables only
├── Separate test/production keys
└── Rotatable
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT PIPELINE                         │
└─────────────────────────────────────────────────────────────────┘

GitHub Repository
       │
       ├────────────────┬────────────────┐
       │                │                │
       ▼                ▼                ▼
   [Vercel]        [Railway]      [Manual: Supabase]
       │                │                │
   Detects          Detects         Run SQL
   /frontend        /backend        Schema
       │                │                │
   npm install      npm install         │
       │                │                │
   npm run build    npm run build       │
       │                │                │
   Deploy to        Deploy to           │
   Edge CDN         Container           │
       │                │                │
       ▼                ▼                ▼
   [Production]     [Production]    [Production]
   Frontend         Backend         Database


Auto-Deploy Triggers:
├── Push to main branch
├── Pull request merge
└── Manual deploy button
```

## Scaling Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                         SCALABILITY                              │
└─────────────────────────────────────────────────────────────────┘

Current Architecture (Small Business)
├── Vercel: Auto-scales (serverless)
├── Railway: Auto-scales (container)
├── Supabase: 500MB DB (free tier)
└── Handles: ~100-1000 orders/month

If Growth Needed:
├── Supabase: Upgrade to Pro ($25/mo)
│   └── 8GB DB, more connections
├── Railway: Scales automatically
│   └── Pay per usage
├── Add Redis for caching (optional)
├── Add CDN for images (optional)
└── Add rate limiting

Bottlenecks to Watch:
├── Supabase connection limits
├── Resend email limits (3000/mo free)
├── Railway memory usage
└── Stripe API rate limits
```

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING POINTS                             │
└─────────────────────────────────────────────────────────────────┘

Frontend (Vercel)
├── Build logs
├── Runtime logs
├── Analytics (page views)
└── Error tracking (optional: Sentry)

Backend (Railway)
├── Application logs (console.log)
├── Error logs (console.error)
├── Request logs (middleware)
└── Performance metrics

Database (Supabase)
├── Query logs
├── Connection stats
├── Storage usage
└── Performance insights

Email (Resend)
├── Delivery logs
├── Bounce rates
├── Open rates (if enabled)
└── Usage limits

Payments (Stripe)
├── Transaction logs
├── Invoice status
├── Customer data
└── Webhook events
```

## File Structure

```
gios-corner/
│
├── backend/
│   ├── src/
│   │   ├── config/           # External service configs
│   │   │   ├── database.ts   # Supabase
│   │   │   ├── stripe.ts     # Stripe
│   │   │   ├── email.ts      # Resend
│   │   │   └── menu.ts       # Menu items
│   │   │
│   │   ├── middleware/       # Express middleware
│   │   │   └── auth.ts       # JWT verification
│   │   │
│   │   ├── routes/           # API routes
│   │   │   ├── orders.ts     # Customer endpoints
│   │   │   ├── admin.ts      # Admin endpoints
│   │   │   └── menu.ts       # Menu endpoints
│   │   │
│   │   ├── services/         # Business logic
│   │   │   ├── orderService.ts   # Order operations
│   │   │   ├── emailService.ts   # Email templates
│   │   │   └── stripeService.ts  # Payment operations
│   │   │
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/            # Utilities
│   │   │   └── validation.ts
│   │   │
│   │   └── index.ts          # Express app
│   │
│   ├── supabase-schema.sql   # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Menu.tsx
│   │   │   ├── HowToOrder.tsx
│   │   │   └── admin/
│   │   │       ├── Login.tsx
│   │   │       └── Dashboard.tsx
│   │   │
│   │   ├── services/         # API client
│   │   │   └── api.ts
│   │   │
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/            # Utilities
│   │   │   └── auth.ts
│   │   │
│   │   ├── App.tsx           # Main app
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Styles
│   │
│   └── package.json
│
└── Documentation/
    ├── README.md
    ├── QUICKSTART.md
    ├── DEPLOYMENT.md
    ├── PROJECT_SUMMARY.md
    ├── ARCHITECTURE.md (this file)
    └── SETUP_CHECKLIST.md
```

## Key Design Patterns

### Backend Patterns
- **Layered Architecture**: Routes → Services → Database
- **Dependency Injection**: Config files injected into services
- **Middleware Pattern**: Auth, validation, logging
- **Service Layer**: Business logic separated from routes
- **Repository Pattern**: Database access abstracted

### Frontend Patterns
- **Component-Based**: Reusable UI components
- **Container/Presentational**: Smart vs dumb components
- **Protected Routes**: Auth-based routing
- **API Service Layer**: Centralized API calls
- **Custom Hooks**: Reusable stateful logic (can add more)

## Performance Optimizations

```
Frontend
├── Vite for fast builds
├── Code splitting (React Router)
├── Lazy loading (can add for images)
├── Tailwind CSS purging
└── Production builds minified

Backend
├── Express compression (can add)
├── Database connection pooling
├── Async/await for non-blocking I/O
├── Error handling doesn't crash server
└── Efficient queries

Database
├── Indexes on frequently queried columns
├── JSONB for flexible food_selection
├── Timestamps for audit trail
└── Auto-updated updated_at
```

---

This architecture is designed to be:
- ✅ **Scalable**: Can handle growth without major changes
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Secure**: Multiple layers of security
- ✅ **Cost-effective**: Uses free tiers where possible
- ✅ **Developer-friendly**: Clear structure and documentation





