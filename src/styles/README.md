# Styles Directory

This directory contains global styles and styling configurations.

## Structure

- `globals.css` - Global CSS styles
- `tailwind.css` - Tailwind CSS imports and configurations

## Purpose

The styles directory manages global styling concerns and Tailwind CSS configuration. It provides a centralized location for managing application-wide styles and theme configurations.

## Key Components

1. **Global Styles** (`globals.css`)
   - Reset styles
   - Base styles
   - Typography
   - Color schemes
   - Animation defaults
   - Utility classes

2. **Tailwind Configuration** (`tailwind.css`)
   - Tailwind imports
   - Custom utilities
   - Theme extensions
   - Plugin configurations

## Styling Guidelines

1. Global Styles:
   - Keep global styles minimal
   - Use CSS variables for theming
   - Follow BEM naming convention
   - Maintain responsive design

2. Tailwind Usage:
   - Use utility classes when possible
   - Create custom utilities as needed
   - Follow component-first approach
   - Maintain consistent spacing

3. Theme Configuration:
   - Define color palettes
   - Set typography scale
   - Configure breakpoints
   - Define animation timings

4. Performance:
   - Minimize CSS bundle size
   - Use efficient selectors
   - Implement proper purging
   - Optimize media queries

## Best Practices

1. Organization:
   - Group related styles
   - Use proper comments
   - Maintain consistent formatting
   - Document custom utilities

2. Maintainability:
   - Use CSS variables
   - Implement theme switching
   - Follow DRY principles
   - Document complex styles

3. Accessibility:
   - Maintain proper contrast
   - Support reduced motion
   - Handle dark mode
   - Consider color blindness

## Example Usage

```css
/* globals.css */
:root {
  --primary-color: #4a90e2;
  --secondary-color: #f39c12;
  --text-color: #2c3e50;
  --background-color: #ffffff;
}

/* Base styles */
body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Utility classes */
.game-container {
  @apply flex flex-col items-center justify-center min-h-screen;
}

.band-member {
  @apply rounded-full shadow-lg transition-all duration-300;
}
``` 