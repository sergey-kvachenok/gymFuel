# Spec Requirements Document

> Spec: PWA Icon Generation
> Created: 2025-01-27

## Overview

Generate proper PWA icons for GymFuel to replace the current placeholder icons (next.svg and vercel.svg) that are causing users to see empty white squares on their phone screens when the app is installed.

## User Stories

### Professional App Icon

As a user, I want to see a proper, professional app icon when I install GymFuel on my mobile device, so that the app looks credible and is easily recognizable among other apps.

The user should see a branded icon that represents the fitness and nutrition tracking functionality of the app, rather than generic placeholder icons.

### Consistent Brand Experience

As a user, I want the app icon to be consistent with the GymFuel brand and theme, so that I can easily identify the app and understand its purpose at a glance.

The icon should reflect the app's focus on nutrition tracking and muscle building goals.

## Spec Scope

1. **Programmatic Icon Generation**: Create a standalone script that generates a GymFuel-themed icon programmatically using Canvas API or SVG.
2. **Multiple Icon Sizes**: Generate all required PWA icon sizes (16x16, 32x32, 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512).
3. **Icon Purposes**: Support both "any" and "maskable" purposes for adaptive icons.
4. **Manifest Update**: Update manifest.json to reference the new generated icons.
5. **Clean Implementation**: Use a one-time script that can be deleted after generation.

## Out of Scope

- External icon generation libraries or dependencies
- Complex icon design tools
- Manual icon creation requiring design skills
- Permanent dependencies in package.json

## Expected Deliverable

1. A standalone JavaScript script that generates all required PWA icons programmatically.
2. Generated icon files in the public/icons/ directory.
3. Updated manifest.json with proper icon references.
4. Icons that display correctly when the app is installed on mobile devices.
5. A clean, professional icon that represents the GymFuel brand.

## Icon Design Requirements

### Visual Concept

- **Theme**: Fitness and nutrition tracking
- **Style**: Modern, clean, minimalist
- **Colors**: Use existing brand colors (#3b82f6 blue, white background)
- **Recognition**: Must be recognizable at small sizes (16x16)

### Design Elements

- **Primary Symbol**: Abstract representation of fitness (dumbbell, barbell, or strength symbol) combined with nutrition (food plate, macro tracking)
- **Background**: Clean, solid background with brand colors
- **Typography**: Optional "GF" or "GymFuel" text if space allows
- **Adaptive**: Must work as both regular and maskable icon

### Technical Requirements

- **Format**: PNG with transparency support
- **Quality**: High-quality rendering at all sizes
- **Optimization**: Reasonable file sizes for web delivery
- **Compatibility**: Works across all platforms (iOS, Android, Windows)

## Success Criteria

- [ ] All required icon sizes generated (16x16 to 512x512)
- [ ] Icons display correctly on mobile devices when app is installed
- [ ] Manifest.json updated with proper icon references
- [ ] No external dependencies added to package.json
- [ ] Generated icons committed to version control
- [ ] One-time generation script can be safely deleted after use
