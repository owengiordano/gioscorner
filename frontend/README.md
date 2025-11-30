# Gio's Corner Frontend

React + TypeScript frontend for Gio's Corner catering management system.

## Setup

### Quick Start (UI Development Only)

Want to work on the UI without setting up the backend? Just run:

```bash
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Open http://localhost:5173 - all pages will load for UI development. API calls will fail (expected), but you can work on styling, layout, and components.

**See [../UI_DEVELOPMENT.md](../UI_DEVELOPMENT.md) for details.**

---

### Full Setup (With Backend)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
- Set `VITE_API_URL` to your backend URL (default: `http://localhost:3001` for local development)

#### 3. Run Development Server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Project Structure

```
src/
├── main.tsx              # App entry point
├── App.tsx               # Main app component with routing
├── index.css             # Global styles (Tailwind)
├── components/           # Reusable components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Footer.tsx        # Footer
│   └── ...
├── pages/                # Page components
│   ├── Home.tsx          # Landing page
│   ├── About.tsx         # About page
│   ├── Menu.tsx          # Menu & order form
│   ├── HowToOrder.tsx    # How to order page
│   └── admin/            # Admin pages
│       ├── Login.tsx     # Admin login
│       └── Dashboard.tsx # Admin dashboard
├── services/             # API services
│   └── api.ts            # API client
├── types/                # TypeScript types
│   └── index.ts
└── utils/                # Utility functions
    └── auth.ts           # Auth helpers
```

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your Railway backend URL

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Vercel will auto-detect Vite configuration
4. Set environment variables:
   - `VITE_API_URL` - Your Railway backend URL
5. Deploy

## Features

### Customer Features
- Browse menu items with prices
- Submit catering requests with validation
- 24-hour advance booking requirement
- Responsive design for mobile and desktop

### Admin Features
- Secure login with JWT authentication
- View all orders filtered by status
- Accept orders and generate invoices
- Deny orders with custom reasons
- Real-time order management

## Styling

This project uses Tailwind CSS for styling. The design is:
- Fully responsive
- Modern and clean
- Accessible
- Easy to customize via `tailwind.config.js`

## Environment Variables

- `VITE_API_URL` - Backend API URL (required)

## Browser Support

Modern browsers with ES2020 support:
- Chrome/Edge 80+
- Firefox 72+
- Safari 13.1+

