# Product Roadmap

## Phase 0: Foundation (Completed)

**Goal:** Establish the core functionality of the application.
**Success Criteria:** Users can register, log in, track their daily nutrition, set goals, and view their history.

### Features

- [x] **Authentication**: Secure user registration, login, and session management. `[M]`
- [x] **Dashboard**: View daily nutrition statistics and manage meals. `[M]`
- [x] **Goals**: Set and track daily nutrition goals. `[S]`
- [x] **History**: View and filter past consumption data. `[S]`
- [x] **Core Tech Stack**: Initial setup of Next.js, tRPC, Prisma, and Tailwind CSS. `[L]`

## Phase 1: Core Feature Expansion

**Goal:** Enhance the user experience with key features and improve application robustness.
**Success Criteria:** Users have a profile page, can use the app offline, and the codebase has a foundational test suite.

### Features

- [ ] **User Profile**: Allow users to manage their profile information and change their password. `[M]`
- [ ] **PWA Support**: Implement full offline functionality. `[L]`
  - Implement a manifest and service worker for installability and background processing.
  - Enable offline CRUD operations for products and consumption, storing data in IndexedDB.
  - Synchronize offline data with the server when the connection is restored.
  - Display cached data from IndexedDB when the user is offline.
  - Update the IndexedDB cache on every application start to ensure data freshness.
- [ ] **Unit Testing**: Add unit tests for critical components and utility functions. `[M]`
- [ ] **E2E Testing**: Implement end-to-end tests for core user flows. `[L]`

## Phase 2: AI-Powered Features

**Goal**: Integrate AI to provide smart recommendations and simplify user workflows.
**Success Criteria**: Users can get nutrition data via AI, receive personalized goal recommendations, and search for recipes.

### Features

- [ ] **AI Nutrition Score**: Allow users to get nutritional information for a product using an AI helper in the "Add Product" form. `[L]`
- [ ] **AI Goal Recommendation**: Provide AI-driven daily consumption recommendations based on user's personal data and goals. `[L]`
- [ ] **AI Recipe Search**: Implement a chat-based feature for users to find interesting recipes. `[XL]`

## Phase 3: Advanced Integrations and Analytics

**Goal**: Provide advanced insights and integrations to increase user engagement.
**Success Criteria**: The app offers advanced analytics and can connect to third-party services.

### Features

- [ ] **Advanced Analytics**: Introduce charts and graphs for better data visualization. `[L]`
- [ ] **Third-Party Integrations**: Connect with services like Google Fit and Apple Health. `[XL]`
