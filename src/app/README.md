# App Directory

This directory uses Next.js App Router and contains the main application routing structure.

## Structure

- `/api/` - API routes for the application
- `/editor/` - Level editor pages and related components
- `/levels/` - Pages for displaying and playing levels from templates
- `layout.tsx` - Root layout component that wraps all pages
- `page.tsx` - Home page component

## Purpose

The app directory follows Next.js 13+ conventions for file-system based routing. Each folder represents a route segment, and special files like `layout.tsx` and `page.tsx` have specific roles in the routing system.

## Key Components

1. **API Routes** (`/api/`)
   - Handle server-side API requests
   - Implement RESTful endpoints
   - Manage data operations

2. **Level Editor** (`/editor/`)
   - Interface for creating and editing marching band formations
   - Tools for placing band members
   - MIDI track management

3. **Levels** (`/levels/`)
   - Display available levels
   - Level playback interface
   - Level selection and progression

4. **Root Layout** (`layout.tsx`)
   - Common layout wrapper
   - Navigation components
   - Global UI elements

5. **Home Page** (`page.tsx`)
   - Landing page
   - Main navigation
   - Featured content 