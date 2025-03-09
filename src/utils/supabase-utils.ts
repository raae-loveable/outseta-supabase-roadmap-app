
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Create custom functions for incrementing and decrementing counters
export async function createRpcFunctions() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  // Create increment function
  await supabase.rpc('create_increment_function', {}, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Create decrement function
  await supabase.rpc('create_decrement_function', {}, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
