import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get the anonymous user ID, signing in anonymously if necessary.
 * Uses a singleton promise to prevent multiple concurrent sign-in attempts
 * that can cause Navigator LockManager errors.
 * @returns {Promise<string|null>} The anonymous user ID or null if auth fails.
 */
export async function getAnonymousUserId() {
  // Check if we already have a user from existing session
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  if (user) {
    return user.id;
  }

  // Initialize the promise on first call, reuse it for subsequent calls
  if (!getAnonymousUserId.promise) {
    getAnonymousUserId.promise = (async () => {
      try {
        const { data: { user: newUser }, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          console.error('Error signing in anonymously:', signInError);
          // Reset the promise on error so next call can retry
          getAnonymousUserId.promise = null;
          return null;
        }
        return newUser.id;
      } catch (err) {
        console.error('Unexpected error during anonymous sign-in:', err);
        // Reset the promise on error so next call can retry
        getAnonymousUserId.promise = null;
        return null;
      }
    })();
  }

  return getAnonymousUserId.promise;
}

// Export the supabase client
export { supabase };