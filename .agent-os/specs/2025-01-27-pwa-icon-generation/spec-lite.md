# PWA Icon Generation - Spec Lite

**Goal**: Replace placeholder PWA icons with programmatically generated GymFuel-themed icons.

**Problem**: Users see empty white squares on phone screens due to placeholder icons (next.svg, vercel.svg).

**Solution**: Create standalone JavaScript script to generate fitness/nutrition themed icons programmatically.

**Scope**:

- Generate icons 16x16 to 512x512 sizes
- Support "any" and "maskable" purposes
- Update manifest.json
- No external dependencies
- One-time script (deletable after use)

**Design**: Modern, clean icon combining fitness (dumbbell/strength) + nutrition (food plate) using brand colors (#3b82f6 blue).

**Deliverables**: Generated icons in public/icons/, updated manifest.json, working PWA installation experience.
