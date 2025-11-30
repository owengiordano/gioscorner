# Gio's Corner - Catering Management System

A complete, production-ready full-stack web application for managing catering orders. Built with React, Express, Supabase, and Stripe.

---

## ⚡ Get Started in 30 Seconds

**Want to see it and make UI changes right now?** No setup needed:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Or simply run:
```bash
./START_UI_DEV.sh
```

Open http://localhost:5173 and start editing! 🎨

---

## 🎯 Overview

Gio's Corner is a modern catering management system that allows customers to browse menus and submit catering requests online, while the business owner manages everything through a secure admin dashboard—no database access required.

## ✨ Key Features

### For Customers
- 🍽️ Browse menu with prices and descriptions
- 📝 Submit catering requests with interactive form
- ⏰ 24-hour advance booking enforcement
- ✉️ Email confirmations at every step
- 💳 Secure Stripe payment links

### For Business Owner (Admin)
- 🔐 Secure JWT-based authentication
- 📊 Dashboard with order filtering (pending/accepted/denied)
- ✅ One-click order acceptance with automatic invoice generation
- ❌ Order denial with custom reason messages
- 📧 Automatic email notifications
- 🚫 No database access needed—everything via UI

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, React Router, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (Invoicing)
- **Email**: Resend
- **Hosting**: Vercel (frontend) + Railway (backend)

## 📁 Project Structure

```
gios-corner/
├── backend/                    # Express API
│   ├── src/
│   │   ├── config/            # DB, Stripe, Email, Menu configs
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   ├── supabase-schema.sql    # Database schema
│   └── README.md
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript types
│   └── README.md
│
└── Documentation/
    ├── README.md              # This file
    ├── QUICKSTART.md          # Fast local setup
    ├── DEPLOYMENT.md          # Production deployment guide
    ├── PROJECT_SUMMARY.md     # Detailed project overview
    ├── ARCHITECTURE.md        # System architecture
    └── SETUP_CHECKLIST.md     # Setup verification checklist
```

## 🚀 Quick Start

### Just Want to Work on UI? 🎨

You can run the frontend immediately without any setup:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Visit http://localhost:5173 - All pages will load and you can work on styling and layout. API calls will fail (expected), but the UI is fully functional for development.

**See [UI_DEVELOPMENT.md](UI_DEVELOPMENT.md) for details.**

---

### Full Setup (Backend + Frontend)

#### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Stripe account (test mode)
- Resend account (free tier works)

#### Local Development Setup

1. **Clone and Install**
   ```bash
   cd gios-corner
   
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials (see QUICKSTART.md)
   ```

3. **Configure Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:3001
   ```

4. **Set Up Database**
   - Create Supabase project
   - Run SQL in `backend/supabase-schema.sql`

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Admin: http://localhost:5173/admin

**For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)**

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete production deployment guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Detailed feature overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Verification checklist
- **[backend/README.md](backend/README.md)** - Backend-specific documentation
- **[frontend/README.md](frontend/README.md)** - Frontend-specific documentation

## 🎨 Customization

### Update Menu Items
Edit `backend/src/config/menu.ts`:
```typescript
{
  id: 'family-dinner-meal',
  name: 'Family Dinner Meal',
  price_cents: 5000,  // $50.00
  description: '...',
  serves: 4
}
```

### Customize Email Templates
Edit `backend/src/services/emailService.ts` to modify email content and styling.

### Update Website Content
- Landing page: `frontend/src/pages/Home.tsx`
- About page: `frontend/src/pages/About.tsx`
- Footer: `frontend/src/components/Footer.tsx`

### Change Colors/Styling
Edit `frontend/tailwind.config.js` for theme customization.

## 🔐 Security Features

- ✅ JWT-based admin authentication
- ✅ bcrypt password hashing
- ✅ CORS protection
- ✅ Input validation on all endpoints
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Environment variable separation
- ✅ Secure API key management

## 🌐 Deployment

### Production Deployment

1. **Database**: Deploy schema to Supabase
2. **Backend**: Deploy to Railway (auto-deploy from GitHub)
3. **Frontend**: Deploy to Vercel (auto-deploy from GitHub)
4. **Configure**: Set environment variables on each platform

**For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Estimated Costs

- Supabase: Free tier (500MB DB)
- Railway: ~$5-20/month
- Vercel: Free tier
- Stripe: 2.9% + $0.30 per transaction
- Resend: Free tier (3,000 emails/month)

**Total: ~$5-20/month + transaction fees**

## 📊 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/menu` - Get menu items
- `POST /api/orders` - Submit new order

### Admin Endpoints (JWT required)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - List orders
- `GET /api/admin/orders/:id` - Get order details
- `POST /api/admin/orders/:id/accept` - Accept order
- `POST /api/admin/orders/:id/deny` - Deny order

## 🧪 Testing

### Test Customer Flow
1. Visit menu page
2. Select items and submit order
3. Check email confirmations

### Test Admin Flow
1. Login at `/admin`
2. View pending orders
3. Accept/deny orders
4. Verify emails and Stripe invoices

## 🔧 Development

### Hot Reload
Both frontend and backend support hot reload during development.

### Environment Variables
- Backend: See `backend/.env.example`
- Frontend: See `frontend/.env.example`

### Database Access
View orders in Supabase Dashboard → Table Editor

## 📝 License

Private - All rights reserved

## 🆘 Support

- Check documentation files for detailed guides
- Review inline code comments for customization points
- Check service dashboards for logs and monitoring:
  - Railway: Backend logs
  - Vercel: Frontend logs
  - Supabase: Database
  - Stripe: Payments
  - Resend: Emails

## 🎯 Next Steps

1. ✅ Follow [QUICKSTART.md](QUICKSTART.md) for local setup
2. ✅ Customize menu items and content
3. ✅ Test the complete flow locally
4. ✅ Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production
5. ✅ Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) to verify everything

---

**Built with ❤️ for Gio's Corner**

