// Review operations for ClassReview
// Handles review submission, reporting, and moderation-related functions

import { supabase } from './supabase.js';
import { showError } from './ui.js';
import { getAnonymousUserId } from './supabase.js';

/**
 * Submit a new review
 * @param {string} teacherId - Teacher ID
 * @param {string} vote - Vote value ('positive' or 'negative')
 * @param {string} comment - Review comment
 * @returns {Promise<Object>} - Result of submission
 */
export async function submitReview(teacherId, vote, comment) {
    try {
        // Get the anonymous user ID from Supabase auth
        const anonymousUserId = await getAnonymousUserId();

        const { data, error: submitError } = await supabase
            .from('reviews')
            .insert({
                teacher_id: teacherId,
                anonymous_user_id: anonymousUserId,
                vote: vote,
                comment: comment.trim(),
                status: 'approved' // Assuming auto-approve for now
            });

        if (submitError) throw submitError;

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

/**
 * Report a review
 * @param {string} reviewId - Review ID to report
 * @param {string} reason - Reason for reporting
 * @param {string} details - Additional details (optional)
 * @returns {Promise<Object>} - Result of reporting
 */
export async function reportReview(reviewId, reason, details = '') {
    try {
        // Get the anonymous user ID from Supabase auth
        const reporterId = await getAnonymousUserId();

        const { data, error: reportError } = await supabase
            .from('reports')
            .insert({
                review_id: reviewId,
                reason: reason,
                details: details.trim(),
                reporter_id: reporterId
            });

        if (reportError) throw reportError;

        return { success: true, data };
    } catch (error) {
        console.error('Error reporting review:', error);
        throw error;
    }
}

/**
 * Check if a user has already reviewed a teacher
 * @param {string} teacherId - Teacher ID
 * @param {string} anonymousUserId - Anonymous user ID
 * @returns {Promise<boolean>} - True if user has already reviewed
 */
export async function hasUserReviewedTeacher(teacherId, anonymousUserId) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('id')
            .eq('teacher_id', teacherId)
            .eq('anonymous_user_id', anonymousUserId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking if user reviewed teacher:', error);
        return false; // Fail open - allow review if we can't check
    }
}

/**
 * Get pending reports for moderation
 * @returns {Promise<Array>} - Array of report objects
 */
export async function getPendingReports() {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                reviews!inner (
                    id,
                    comment,
                    vote,
                    teachers!inner (
                        name,
                        subject
                    )
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching pending reports:', error);
        throw error;
    }
}

/**
 * Update report status
 * @param {string} reportId - Report ID
 * @param {string} status - New status ('reviewed', 'dismissed', 'actioned')
 * @returns {Promise<Object>} - Result of update
 */
export async function updateReportStatus(reportId, status) {
    try {
        const { data, error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', reportId);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error updating report status:', error);
        throw error;
    }
}

/**
 * Update review status (for moderation)
 * @param {string} reviewId - Review ID
 * @param {string} status - New status ('approved', 'rejected', 'pending')
 * @returns {Promise<Object>} - Result of update
 */
export async function updateReviewStatus(reviewId, status) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', reviewId);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error updating review status:', error);
        throw error;
    }
}

console.log("Review operations loaded");