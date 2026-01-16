#!/bin/bash

# Quick start script for UI development
# No backend setup needed!

echo "🎨 Starting Gio's Corner Frontend for UI Development..."
echo ""

cd frontend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "✅ .env created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "📝 Note: API calls will fail (expected) - you're in UI-only mode"
echo "    Edit files in src/pages/ and src/components/ to make changes"
echo "    Changes will hot reload automatically!"
echo ""
echo "📖 See UI_DEVELOPMENT.md for more details"
echo ""

npm run dev





