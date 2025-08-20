# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-01-27-pwa-icon-generation/spec.md

## Technical Requirements

### Icon Generation Approach

**Pure JavaScript Solution**: Create a standalone Node.js script that generates PWA icons programmatically without external dependencies.

**Canvas API Usage**: Use Node.js Canvas API (node-canvas) or SVG generation to create high-quality icons.

**Icon Sizes**: Generate all required PWA icon sizes:

- 16x16, 32x32, 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Icon Design Implementation

**Visual Elements**:

- **Primary Symbol**: Abstract dumbbell or barbell shape representing fitness
- **Secondary Element**: Circular plate or macro tracking visualization
- **Background**: Solid background using brand color #3b82f6
- **Typography**: "GF" or "GymFuel" text if space allows (for larger sizes)

**Color Scheme**:

- Primary: #3b82f6 (existing brand blue)
- Background: #ffffff (white)
- Accent: #1e40af (darker blue for contrast)

### File Structure

```
scripts/
  generate-icons.js          # Main icon generation script
public/
  icons/
    icon-16x16.png
    icon-32x32.png
    icon-48x48.png
    icon-72x72.png
    icon-96x96.png
    icon-128x128.png
    icon-144x144.png
    icon-152x152.png
    icon-192x192.png
    icon-384x384.png
    icon-512x512.png
    icon-maskable-192x192.png
    icon-maskable-512x512.png
```

### Manifest.json Updates

**Current State**: Uses placeholder icons (next.svg, vercel.svg)

**Target State**: Reference generated PNG icons with proper sizes and purposes

**Required Changes**:

- Replace existing icon entries with new generated icons
- Add maskable icon entries for adaptive icons
- Ensure all required sizes are covered

### Implementation Details

**Script Location**: `scripts/generate-icons.js`

**Script Functionality**:

1. Generate source icon design programmatically
2. Create all required sizes
3. Generate both regular and maskable versions
4. Save files to public/icons/ directory
5. Update manifest.json with new icon references
6. Provide console output for verification

**Icon Generation Logic**:

- Use Canvas API to draw shapes and text
- Scale appropriately for each size
- Maintain visual clarity at small sizes
- Ensure proper padding for maskable icons

### Error Handling

**Validation**: Verify all generated files exist and have correct dimensions
**Fallback**: If generation fails, maintain existing manifest.json
**Logging**: Provide clear console output for success/failure

### Testing Strategy

**Local Testing**:

- Run generation script and verify file creation
- Check manifest.json updates
- Test PWA installation in browser dev tools
- Verify icons display correctly at different sizes

**Mobile Testing**:

- Install PWA on mobile device
- Verify icon displays correctly on home screen
- Test on both iOS and Android if possible

### Performance Considerations

**File Optimization**: Ensure generated PNG files are reasonably sized
**Caching**: Icons are static assets, leverage browser caching
**Loading**: Icons load from public directory, no additional network requests

### Security Considerations

**Static Assets**: Icons are static files, no security concerns
**No Dependencies**: Pure JavaScript solution, no external attack surface

### Code Style Guidelines

**Script Structure**:

- Clear function separation for different icon sizes
- Descriptive variable names
- Comments explaining design decisions
- Error handling with meaningful messages

**File Naming**: Use consistent naming convention (icon-{size}.png)

### Refactoring Approach

**Manifest.json Updates**:

- Replace existing icon entries
- Add new maskable icon entries
- Maintain existing structure and other properties

**Cleanup**: After successful generation and testing, delete the generation script

## Implementation Guide

### Dependencies

**Development Only**: No permanent dependencies required
**Temporary**: node-canvas (if using Canvas API) or built-in Node.js modules

### Integration Points

**Manifest.json**: Update icon references to point to generated files
**Public Directory**: Add icons/ subdirectory with generated files
**Build Process**: No changes required, icons are static assets

### Testing Strategy

**Unit Testing**: Verify icon generation for each size
**Integration Testing**: Test manifest.json updates
**User Testing**: Verify PWA installation experience

### Performance Considerations

**File Sizes**: Optimize PNG compression for web delivery
**Loading**: Icons served as static assets from public directory

### Security Considerations

**No Additional Measures**: Static assets require no security measures

### Security Testing

**Not Required**: Static assets don't need security testing

### Security Monitoring

**Not Required**: No additional monitoring needed

### Code Style Guidelines

**Reference**: Follow @~/.agent-os/standards/code-style.md
**Script Style**: Use descriptive function names and clear comments

### Refactoring Approach

**Replace Placeholders**: Update manifest.json to use new icons
**Maintain Structure**: Keep existing PWA setup intact
**Clean Implementation**: One-time script, deletable after use
