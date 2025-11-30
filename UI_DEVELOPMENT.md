# UI Development Guide

Want to work on the UI without setting up the backend? No problem!

## Quick UI Development Setup

You can run the frontend immediately to make UI changes without configuring Supabase, Stripe, Resend, or even the backend.

### Steps

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Frontend will be available at: http://localhost:5173
   - The `.env` file is already created for you

### What Works Without Backend

✅ **Fully Functional for UI Development**:
- Landing page (/)
- About page (/about)
- How to Order page (/how-to-order)
- Menu page layout and styling
- Order form UI and client-side validation
- Admin login page UI
- Navigation and footer
- All styling and responsive design
- Component layouts

⚠️ **Will Show Errors (Expected)**:
- Menu items won't load (API call fails)
- Order submission won't work (API call fails)
- Admin login won't work (API call fails)
- Any data fetching from backend

### Working on Specific Pages

#### Landing Page
```bash
# Edit: frontend/src/pages/Home.tsx
# Hot reload will update automatically
```

#### Menu Page (UI Only)
```bash
# Edit: frontend/src/pages/Menu.tsx
# Note: Menu items won't load without backend
# But you can see the layout and form
```

#### About Page
```bash
# Edit: frontend/src/pages/About.tsx
```

#### Styling
```bash
# Edit: frontend/src/index.css
# Or: frontend/tailwind.config.js for theme changes
```

#### Components
```bash
# Edit: frontend/src/components/Navbar.tsx
# Edit: frontend/src/components/Footer.tsx
```

### Tips for UI Development

1. **Mock Data for Menu Page**
   
   If you want to see the menu with mock data, temporarily add this to `Menu.tsx`:
   
   ```typescript
   // Add this after the useState declarations
   useEffect(() => {
     // Mock menu data for UI development
     setMenuItems([
       {
         id: 'test-1',
         name: 'Test Meal',
         description: 'This is mock data for UI development',
         price_cents: 5000,
         category: 'meals',
         serves: 4
       }
     ]);
     setLoading(false);
   }, []);
   ```

2. **Ignore API Errors**
   
   API errors in the console are expected and can be ignored while working on UI.

3. **Use Browser DevTools**
   
   - Press F12 to open DevTools
   - Use the device toolbar to test responsive design
   - Try different screen sizes

4. **Tailwind CSS Classes**
   
   The project uses Tailwind CSS. Common patterns:
   ```
   - Spacing: p-4, m-4, px-6, py-3
   - Colors: bg-primary-600, text-gray-900
   - Layout: flex, grid, container-custom
   - Buttons: btn-primary, btn-secondary
   - Forms: input-field
   - Cards: card
   ```

5. **Hot Reload**
   
   Changes to `.tsx` files will automatically refresh the browser.

### Customizing Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    // ... change these hex values
    600: '#dc2626',  // Main brand color
    700: '#b91c1c',
  },
}
```

### Common UI Changes

#### Change Company Name
- `frontend/src/components/Navbar.tsx` - Logo/name in nav
- `frontend/src/components/Footer.tsx` - Footer text
- `frontend/src/pages/Home.tsx` - Hero section

#### Update Contact Info
- `frontend/src/components/Footer.tsx` - Email, phone, hours

#### Modify Menu Layout
- `frontend/src/pages/Menu.tsx` - Grid layout, card styling

#### Adjust Form Styling
- `frontend/src/pages/Menu.tsx` - Order form
- `frontend/src/index.css` - Global form styles (input-field class)

#### Change Button Styles
- `frontend/src/index.css` - btn-primary, btn-secondary classes

### When You're Ready for Full Functionality

Once you're happy with the UI, follow these guides to set up the backend:

1. **Quick Setup**: See [QUICKSTART.md](QUICKSTART.md)
2. **Detailed Setup**: See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

### Screenshot Testing

To test how the UI looks:

1. **Different Screen Sizes**
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

2. **Different Pages**
   - Home: http://localhost:5173/
   - About: http://localhost:5173/about
   - Menu: http://localhost:5173/menu
   - How to Order: http://localhost:5173/how-to-order
   - Admin Login: http://localhost:5173/admin
   - Admin Dashboard: http://localhost:5173/admin/dashboard (requires dev login)

3. **Dev Mode Admin Access**
   - Navigate to http://localhost:5173/admin
   - Click the purple "🚀 Dev Login (No Backend Required)" button
   - You'll be logged in as `dev@gios-corner.local`
   - Access the admin dashboard with mock order data
   - Test accepting/denying orders without a real backend
   - Mock data includes 4 sample orders with different statuses

4. **Dark/Light Mode**
   - Currently light mode only
   - Can add dark mode support if needed

### Building for Production

Even without backend, you can build the frontend:

```bash
npm run build
npm run preview  # Preview production build
```

---

**Happy UI Development! 🎨**

No backend needed for styling, layout, and design work!

