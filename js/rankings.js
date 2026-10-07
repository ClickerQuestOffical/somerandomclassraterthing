// Ranking operations for ClassReview
// Handles calculating and rendering teacher rankings

import { supabase } from './supabase.js';
import { getRatingLabel } from './rating.js';
import { showLoading, showError, showEmpty, createRankedTeacher } from './ui.js';

/**
 * Fetch teachers with their review statistics for rankings
 * @returns {Promise<Array>} - Array of teacher objects with stats
 */
export async function fetchTeachersWithStats() {
    console.log('fetchTeachersWithStats: Starting');
    try {
        // Fetch all active teachers
        console.log('fetchTeachersWithStats: About to query teachers table');
        const { data: teachersData, error: teachersError } = await supabase
            .from('teachers')
            .select('*')
            .eq('is_active', true);

        console.log('fetchTeachersWithStats: Teachers query completed', { data: teachersData ? `${teachersData.length} teachers` : 'null', error: teachersError });
        if (teachersError) {
            console.error('fetchTeachersWithStats: Teachers query failed:', teachersError);
            throw teachersError;
        }

        const teachers = teachersData || [];
        console.log('fetchTeachersWithStats: Processing', teachers.length, 'teachers');

        // Fetch reviews for all teachers in parallel
        console.log('fetchTeachersWithStats: Starting parallel review fetching for', teachers.length, 'teachers');
        const teacherPromises = teachers.map(async (teacher) => {
            try {
                const { data: reviewsData, error } = await supabase
                    .from('reviews')
                    .select('vote')
                    .eq('teacher_id', teacher.id)
                    .eq('status', 'approved');

                if (error) throw error;

                const reviews = reviewsData || [];
                const stats = getReviewStats(reviews);
                return { teacher, stats };
            } catch (error) {
                console.error(`Error fetching stats for teacher ${teacher.id}:`, error);
                return { teacher, stats: { positiveCount: 0, negativeCount: 0, totalCount: 0, percentage: 0 } };
            }
        });

        console.log('fetchTeachersWithStats: Waiting for all review queries to complete');
        const results = await Promise.all(teacherPromises);
        console.log('fetchTeachersWithStats: All review queries completed, processing results');

        const finalResults = results.map(({ teacher, stats }) => ({
            ...teacher,
            stats
        }));
        console.log('fetchTeachersWithStats: Returning', finalResults.length, 'teachers with stats');
        return finalResults;
    } catch (error) {
        console.error('fetchTeachersWithStats: Error in fetchTeachersWithStats:', error);
        throw error;
    }
}

/**
 * Get most reviewed teachers
 * @param {number} limit - Number of teachers to return
 * @returns {Promise<Array>} - Array of most reviewed teachers
 */
export async function getMostReviewedTeachers(limit = 10) {
    console.log('getMostReviewedTeachers: Starting with limit', limit);
    try {
        console.log('getMostReviewedTeachers: About to call fetchTeachersWithStats');
        const teachersWithStats = await fetchTeachersWithStats();
        console.log('getMostReviewedTeachers: fetchTeachersWithStats returned', teachersWithStats ? `${teachersWithStats.length} teachers` : 'null');

        const filtered = teachersWithStats.filter(t => t.stats.totalCount > 0); // Only teachers with reviews
        console.log('getMostReviewedTeachers: After filtering for teachers with reviews:', filtered.length);

        const sorted = filtered.sort((a, b) => b.stats.totalCount - a.stats.totalCount);
        console.log('getMostReviewedTeachers: After sorting:', sorted.length);

        const result = sorted.slice(0, limit);
        console.log('getMostReviewedTeachers: Returning', result.length, 'teachers');
        return result;
    } catch (error) {
        console.error('Error getting most reviewed teachers:', error);
        throw error;
    }
}

/**
 * Get top positive teachers
 * @param {number} limit - Number of teachers to return
 * @param {number} minReviews - Minimum reviews required
 * @returns {Promise<Array>} - Array of top positive teachers
 */
export async function getTopPositiveTeachers(limit = 10, minReviews = 5) {
    try {
        const teachersWithStats = await fetchTeachersWithStats();
        return teachersWithStats
            .filter(t => t.stats.totalCount >= minReviews) // Minimum reviews threshold
            .sort((a, b) => {
                // Primary sort: percentage (descending)
                // Secondary sort: total count (descending) to break ties
                if (b.stats.percentage !== a.stats.percentage) {
                    return b.stats.percentage - a.stats.percentage;
                }
                return b.stats.totalCount - a.stats.totalCount;
            })
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting top positive teachers:', error);
        throw error;
    }
}

/**
 * Get top negative teachers
 * @param {number} limit - Number of teachers to return
 * @param {number} minReviews - Minimum reviews required
 * @returns {Promise<Array>} - Array of top negative teachers
 */
export async function getTopNegativeTeachers(limit = 10, minReviews = 5) {
    try {
        const teachersWithStats = await fetchTeachersWithStats();
        return teachersWithStats
            .filter(t => t.stats.totalCount >= minReviews) // Minimum reviews threshold
            .sort((a, b) => {
                // Primary sort: percentage (ascending for negative)
                // Secondary sort: total count (descending) to break ties
                if (a.stats.percentage !== b.stats.percentage) {
                    return a.stats.percentage - b.stats.percentage;
                }
                return b.stats.totalCount - a.stats.totalCount;
            })
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting top negative teachers:', error);
        throw error;
    }
}

/**
 * Render most reviewed teachers list
 * @param {HTMLElement} container - Container element to render in
 */
export async function renderMostReviewedList(container) {
    showLoading(container, "Loading most reviewed teachers...");

    try {
        const teachers = await getMostReviewedTeachers();

        if (teachers.length === 0) {
            showEmpty(container, "No teachers with reviews yet.");
            return;
        }

        container.innerHTML = '';
        teachers.forEach((teacher, index) => {
            const rankedElement = createRankedTeacher(teacher, teacher.stats, index + 1);
            container.appendChild(rankedElement);
        });
    } catch (error) {
        showError(container, "Failed to load most reviewed teachers.");
    }
}

/**
 * Render top rated teachers list
 * @param {HTMLElement} container - Container element to render in
 */
export async function renderTopRatedList(container) {
    showLoading(container, "Loading top rated teachers...");

    try {
        const teachers = await getTopPositiveTeachers();

        if (teachers.length === 0) {
            showEmpty(container, "No teachers with sufficient reviews yet.");
            return;
        }

        container.innerHTML = '';
        teachers.forEach((teacher, index) => {
            const rankedElement = createRankedTeacher(teacher, teacher.stats, index + 1);
            container.appendChild(rankedElement);
        });
    } catch (error) {
        showError(container, "Failed to load top rated teachers.");
    }
}

console.log("Ranking operations loaded");