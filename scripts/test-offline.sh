#!/bin/bash

# Test script for offline functionality
echo "🧪 Testing Offline Functionality..."

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ App is not running on http://localhost:3000"
    echo "Please start the app with: npm run dev"
    exit 1
fi

echo "✅ App is running"

# Install Playwright if not already installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "📦 Installing Playwright..."
    npx playwright install
fi

# Run the offline functionality tests
echo "🚀 Running offline functionality tests..."
npx playwright test tests/offline-functionality.spec.ts --reporter=list

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All offline functionality tests passed!"
else
    echo "❌ Some tests failed. Check the output above for details."
    exit 1
fi
