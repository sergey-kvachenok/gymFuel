Product Requirements Document (PRD)
📌 Name
GymFuel (working title) — nutrition and calorie tracking application helping users build muscle mass.

🎯 Product Goal
Create a web application that helps users track protein, fat, carbohydrate (macros) and calorie intake to more effectively achieve muscle building goals.

👥 Target Audience

- People visiting the gym
- Fitness enthusiasts tracking nutrition
- Users aiming to build muscle mass

🧩 Core Features

1. 🔐 Authentication

- Email + Password registration
- System login
- Sessions with state preservation
- Secure logout support

2. 🧑‍💼 User Profile

- Name and email specification
- Current statistics visibility for macros and calories
- Password change capability

3. 🍽️ Adding Products to Diet

- Product selection from personal database
- Quantity specification (in grams)
- Automatic calculation of macros and calories
- Display of today's total consumption

4. ➕ Adding New Product

- "Add Product" button
- Form with fields:
  - Product name
  - Calories per 100g
  - Protein, fat, carbohydrates per 100g
- Product saved only in user's personal database
- Product list sorting options:
  - Sort by name (alphabetical)
  - Sort by popularity (most frequently used products first)
  - Sort by creation date
  - Sort by nutritional value

5. 📊 Nutrition History

- View consumed products by days
- Display daily totals for macros and calories
- Date filtering capability

6. 🎯 Nutrition Goals

- Setting goals for protein, fat, carbohydrates and calories
- Progress tracking towards goals
- Goal achievement visualization

⚙️ Technical Requirements
📦 Frontend & Backend

- Framework: Next.js 15 (App Router, Server Components)
- State/data handling: tRPC (type-safe API)
- CSS: Tailwind CSS
  🧠 Data Storage
- Database: PostgreSQL (via Supabase / Neon / PlanetScale)
- ORM: Prisma or Drizzle
  🛠️ Hosting and Deployment
- Platform: Vercel
- Edge/Server Functions: Server Actions + tRPC handlers
- Auth: Auth.js (NextAuth) with Credentials provider

📱 UI / UX
Main Pages

1. /login – login form
2. /register – registration form
3. /dashboard – current day, products, adding (nested route (dashboard))
4. /goals – nutrition goals management
5. /history – nutrition history
   Components

- Product card
- Daily statistics (macros and calories sum)
- Product addition component
- History table
- Nutrition goals form

🔐 Security

- Password hashing (bcrypt)
- Server-side authorization via middleware
- Private route access restrictions

🧪 Testing

- Unit tests for server actions / tRPC routers
- E2E tests for basic scenarios (add, delete, login)
- Form validation (Zod)

📱 PWA (Progressive Web App) Requirements

- Application manifest (manifest.json)
- Service Worker for static resource caching
- Home screen installation
- Push notifications (future development)

🔄 Offline Functionality

- Cache GET requests data for offline viewing
- Offline banner indication when network is unavailable
- Graceful degradation when network is absent

📈 Success Metrics (MVP)

- ✅ Successful tracking of macros and calories throughout the day
- ✅ Adding custom products
- ✅ Nutrition history storage
- ✅ Setting and tracking nutrition goals
- ✅ PWA with installation capability
- ✅ Minimal DevOps (deployment without server setup)

🛣️ Future Opportunities:

- Push notifications (about protein deficiency 😄)
- Product groups and nutrition templates
- Tracker integration (Google Fit, Apple Health)
- Advanced analytics and charts
- Social features (sharing progress)
- Mobile version (React Native)
- 🤖 AI Integration:
  - AI-powered nutrition scoring for new products
  - AI-driven daily nutrition calculation based on user metrics (age, weight, activity level, goals)
  - Smart meal suggestions based on nutritional gaps
  - Personalized nutrition recommendations
- 📊 Advanced Analytics:
  - Real-time nutrition charts throughout the day
  - Visual representation of macro and calorie intake over time
  - Meal timing analysis and optimization
  - Progress tracking with interactive graphs
