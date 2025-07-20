#!/bin/bash

echo "🔐 Generating NEXTAUTH_SECRET for different environments"
echo ""

echo "Staging Secret:"
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "Production Secret:"  
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "📋 Copy these to your respective .env files"
echo ""
echo "Next steps:"
echo "1. Copy env-templates/staging.env to .env.staging"
echo "2. Copy env-templates/production.env to .env.production"  
echo "3. Replace the secrets above in your .env files"
echo "4. Add your Neon database URLs"
echo "5. Update your Vercel URLs" 