#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Icon sizes required for PWA
const ICON_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];

// Brand colors
const COLORS = {
  primary: '#3b82f6', // Brand blue
  background: '#ffffff', // White background
  accent: '#1e40af', // Darker blue for contrast
  text: '#ffffff', // White text
};

/**
 * Generate a simple SVG icon for GymFuel
 * This creates a fitness/nutrition themed icon programmatically
 */
function generateSVGIcon(size) {
  const padding = Math.max(2, Math.floor(size * 0.1)); // 10% padding

  // Create a dumbbell shape with a circular plate
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${COLORS.primary}"/>
  
  <!-- Inner circle for contrast -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - padding}" fill="${COLORS.background}"/>
  
  <!-- Dumbbell bar -->
  <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.6}" height="${size * 0.1}" fill="${COLORS.primary}" rx="${size * 0.05}"/>
  
  <!-- Left weight -->
  <circle cx="${size * 0.25}" cy="${size * 0.5}" r="${size * 0.15}" fill="${COLORS.accent}"/>
  
  <!-- Right weight -->
  <circle cx="${size * 0.75}" cy="${size * 0.5}" r="${size * 0.15}" fill="${COLORS.accent}"/>
  
  <!-- Center plate (nutrition element) -->
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.08}" fill="${COLORS.primary}"/>
  
  <!-- GF text for larger sizes -->
  ${
    size >= 96
      ? `
  <text x="${size / 2}" y="${size * 0.7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" fill="${COLORS.primary}">GF</text>
  `
      : ''
  }
</svg>`;

  return svg;
}

/**
 * Generate maskable icon with proper padding
 */
function generateMaskableIcon(size) {
  const safeZone = size * 0.1; // 10% safe zone
  const contentSize = size - safeZone * 2;

  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${COLORS.primary}"/>
  
  <!-- Content in safe zone -->
  <g transform="translate(${safeZone}, ${safeZone})">
    <!-- Inner circle -->
    <circle cx="${contentSize / 2}" cy="${contentSize / 2}" r="${contentSize / 2}" fill="${COLORS.background}"/>
    
    <!-- Dumbbell bar -->
    <rect x="${contentSize * 0.2}" y="${contentSize * 0.45}" width="${contentSize * 0.6}" height="${contentSize * 0.1}" fill="${COLORS.primary}" rx="${contentSize * 0.05}"/>
    
    <!-- Left weight -->
    <circle cx="${contentSize * 0.25}" cy="${contentSize * 0.5}" r="${contentSize * 0.15}" fill="${COLORS.accent}"/>
    
    <!-- Right weight -->
    <circle cx="${contentSize * 0.75}" cy="${contentSize * 0.5}" r="${contentSize * 0.15}" fill="${COLORS.accent}"/>
    
    <!-- Center plate -->
    <circle cx="${contentSize * 0.5}" cy="${contentSize * 0.5}" r="${contentSize * 0.08}" fill="${COLORS.primary}"/>
    
    <!-- GF text for larger sizes -->
    ${
      size >= 192
        ? `
    <text x="${contentSize / 2}" y="${contentSize * 0.7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${contentSize * 0.12}" font-weight="bold" fill="${COLORS.primary}">GF</text>
    `
        : ''
    }
  </g>
</svg>`;

  return svg;
}

/**
 * Save SVG as file
 */
function saveSVG(svg, filename) {
  const filepath = path.join(__dirname, '..', 'public', 'icons', filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Saved ${filename}`);
}

/**
 * Generate all required icon sizes
 */
function generateAllIcons() {
  console.log('🎯 Generating GymFuel PWA icons...\n');

  // Create icons directory if it doesn't exist
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate regular icons
  ICON_SIZES.forEach((size) => {
    const svg = generateSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    saveSVG(svg, filename);
  });

  // Generate maskable icons for key sizes
  [192, 512].forEach((size) => {
    const svg = generateMaskableIcon(size);
    const filename = `icon-maskable-${size}x${size}.svg`;
    saveSVG(svg, filename);
  });

  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
}

/**
 * Update manifest.json with new icon references
 */
function updateManifest() {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found!');
    return;
  }

  // Backup original manifest
  const backupPath = path.join(__dirname, '..', 'public', 'manifest.json.backup');
  fs.copyFileSync(manifestPath, backupPath);
  console.log('📋 Backed up original manifest.json');

  // Read current manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Create new icons array
  const newIcons = [
    // Regular icons
    ...ICON_SIZES.map((size) => ({
      src: `/icons/icon-${size}x${size}.svg`,
      sizes: `${size}x${size}`,
      type: 'image/svg+xml',
      purpose: 'any',
    })),
    // Maskable icons
    {
      src: '/icons/icon-maskable-192x192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
    {
      src: '/icons/icon-maskable-512x512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
  ];

  // Update manifest
  manifest.icons = newIcons;

  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Updated manifest.json with new icon references');
}

// Main execution
if (require.main === module) {
  try {
    generateAllIcons();
    updateManifest();
    console.log('\n🚀 PWA icon generation complete!');
    console.log('📱 Your app should now display proper icons when installed as a PWA.');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

export { generateSVGIcon, generateMaskableIcon, generateAllIcons, updateManifest };
