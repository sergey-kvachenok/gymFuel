-- Initialize test database with predefined users
-- This script runs when the test database container starts

-- Create test users with known credentials
-- Password: 'password123' - bcrypt hash
INSERT INTO "User" (email, name, password, "createdAt") VALUES
('test@example.com', 'Test User', '$2b$12$GmJ9.ViSgBiKNriTA665PuWEsX9j.SA15TN9GBP91AuVWj4fjXvB2', NOW()),
('test2@example.com', 'Test User 2', '$2b$12$GmJ9.ViSgBiKNriTA665PuWEsX9j.SA15TN9GBP91AuVWj4fjXvB2', NOW()),
('admin@test.com', 'Admin User', '$2b$12$GmJ9.ViSgBiKNriTA665PuWEsX9j.SA15TN9GBP91AuVWj4fjXvB2', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create some test products for user 1
INSERT INTO "Product" ("userId", name, calories, protein, fat, carbs, "createdAt", "updatedAt") VALUES
(1, 'Test Apple', 52, 0.3, 0.2, 14, NOW(), NOW()),
(1, 'Test Banana', 89, 1.1, 0.3, 23, NOW(), NOW()),
(1, 'Test Chicken Breast', 165, 31, 3.6, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create some test products for user 2
INSERT INTO "Product" ("userId", name, calories, protein, fat, carbs, "createdAt", "updatedAt") VALUES
(2, 'User 2 Apple', 52, 0.3, 0.2, 14, NOW(), NOW()),
(2, 'User 2 Banana', 89, 1.1, 0.3, 23, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create test nutrition goals for user 1
INSERT INTO "NutritionGoals" ("userId", "dailyCalories", "dailyProtein", "dailyFat", "dailyCarbs", "goalType", "createdAt", "updatedAt") VALUES
(1, 2000, 150, 65, 250, 'Maintain', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;
