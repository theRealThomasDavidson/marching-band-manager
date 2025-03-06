import supabase from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Error handler for database operations
 * @param error PostgrestError from Supabase
 * @param operation Description of the operation that failed
 * @returns A formatted error message
 */
export const handleDatabaseError = (error: PostgrestError, operation: string): string => {
  console.error(`Database error (${operation}):`, error);
  return `Error ${operation}: ${error.message || 'Unknown error'}`;
};

/**
 * Checks if a record exists in a table
 * @param table Table name
 * @param field Field to check
 * @param value Value to check for
 * @returns True if record exists, false otherwise
 */
export const recordExists = async (
  table: string,
  field: string,
  value: string | number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq(field, value)
      .single();

    if (error) return false;
    return !!data;
  } catch (error) {
    console.error(`Error checking if record exists in ${table}:`, error);
    return false;
  }
};

/**
 * Generic function to get a single record by ID
 * @param table Table name
 * @param id Record ID
 * @returns The record or null if not found
 */
export const getRecordById = async <T>(
  table: string,
  id: string
): Promise<T | null> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error(`Error fetching record from ${table}:`, error);
    return null;
  }
};

/**
 * Generic function to get all records from a table
 * @param table Table name
 * @param orderBy Optional field to order by
 * @returns Array of records
 */
export const getAllRecords = async <T>(
  table: string,
  orderBy?: string
): Promise<T[]> => {
  try {
    let query = supabase.from(table).select('*');
    
    if (orderBy) {
      query = query.order(orderBy);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data as T[];
  } catch (error) {
    console.error(`Error fetching all records from ${table}:`, error);
    return [];
  }
}; 