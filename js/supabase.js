import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get the anonymous user ID, signing in anonymously if necessary.
 * @returns {Promise<string>} The anonymous user ID.
 */
export async function getAnonymousUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user) {
    return user.id;
  }
  const { data: { user: newUser }, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Error signing in anonymously:', error);
    // Fallback to a random UUID if anonymous auth fails
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  return newUser.id;
}

export { supabase };