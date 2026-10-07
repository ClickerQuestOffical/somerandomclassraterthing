import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get the anonymous user ID, signing in anonymously if necessary.
 * @returns {Promise<string>} The anonymous user ID.
 */
export async function getAnonymousUserId() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (user) {
    return user.id;
  }
  const { data: { user: newUser }, error: signInError } = await supabase.auth.signInAnonymously();
  if (signInError) {
    console.error('Error signing in anonymously:', signInError);
    // Fallback to null if anonymous auth fails
    return null;
  }
  return newUser.id;
}

export { supabase };