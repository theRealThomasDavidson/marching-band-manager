import { NextResponse } from 'next/server';

// Basic environment check
console.log('Test Route Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_RUNTIME:', process.env.NEXT_RUNTIME);
console.log('Has Supabase URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('URL Value:', process.env.NEXT_PUBLIC_SUPABASE_URL);

/**
 * Test endpoint to check basic fetch functionality
 */
export async function GET() {
  try {
    console.log('Testing basic fetch...');
    
    // Try to fetch a public API
    const response = await fetch('https://httpbin.org/get');
    const data = await response.json();
    
    console.log('Basic fetch successful:', data);
    
    // Now try to fetch Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Testing Supabase fetch...');
      const supabaseResponse = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase response status:', supabaseResponse.status);
    }
    
    return NextResponse.json({ message: 'Test successful' });
  } catch (error) {
    console.error('Test fetch failed:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
} 