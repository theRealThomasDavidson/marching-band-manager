# Lib Directory

This directory contains utility libraries and shared functionality.

## Structure

- `supabase.ts` - Supabase client configuration and utilities
- Other utility modules as needed

## Purpose

The lib directory houses shared utilities, helpers, and configurations that are used across the application. It provides a central location for common functionality and third-party service configurations.

## Key Components

1. **Supabase Integration** (`supabase.ts`)
   - Database client configuration
   - Authentication setup
   - Storage configuration
   - Real-time subscriptions
   - Type definitions

2. **Common Utilities**
   - Helper functions
   - Shared constants
   - Type guards
   - Custom hooks
   - Utility classes

## Guidelines

1. Code Organization:
   - Keep utilities focused and specific
   - Maintain proper documentation
   - Include type definitions
   - Follow DRY principles

2. Performance:
   - Optimize imports
   - Implement memoization where needed
   - Handle cleanup properly
   - Manage side effects

3. Testing:
   - Include unit tests
   - Test edge cases
   - Mock external dependencies
   - Document test cases

4. Maintenance:
   - Keep dependencies updated
   - Document breaking changes
   - Maintain backwards compatibility
   - Version critical utilities 