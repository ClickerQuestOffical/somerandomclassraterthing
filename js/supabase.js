import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Create a single Supabase client with appropriate options to avoid Navigator LockManager issues
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: false,
    // Override lock handling to prevent Navigator LockManager errors in static site context
    lock: async (name, acquireTimeout, fn) => {
      // For this simple static site, we prioritize reliability over complex locking
      // Since we're using singleton pattern for anonymous auth, we can safely bypass browser locks
      try {
        return await fn();
      } catch (error) {
        // Log but don't fail on lock errors - our singleton pattern handles concurrency
        console.warn('Supabase auth lock warning:', error.message);
        return await fn(); // Retry the operation
      }
    }
  }
});

/**
 * Get the anonymous user ID, signing in anonymously if necessary.
 * Uses a singleton promise to prevent multiple concurrent sign-in attempts
 * that can cause Navigator LockManager errors.
 * @returns {Promise<string|null>} The anonymous user ID or null if auth fails.
 */
export async function getAnonymousUserId() {
  // Check if we already have a user from existing session
  try {
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError) throw getUserError;
    if (user) {
      return user.id;
    }
  } catch (error) {
    console.error('Error checking existing Supabase session:', error);
    // Continue to attempt anonymous sign-in
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