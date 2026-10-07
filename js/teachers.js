// Teacher data operations for ClassReview
// Handles fetching and processing teacher data from Supabase

import { supabase } from './supabase.js';
import { getReviewStats } from './rating.js';
import { showLoading, showError, showEmpty, createTeacherCard } from './ui.js';

// Diagnostic function to test teachers table query directly
export async function testTeachersTable() {
    console.log('testTeachersTable: Testing direct query to teachers table');
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('*');

        console.log('testTeachersTable: Direct query completed', { data, error });
        if (error) {
            console.error('testTeachersTable: Direct query failed:', error);
            return { error: error.message };
        }
        console.log('testTeachersTable: Direct query returned', data ? `${data.length} teachers` : 'no data');
        return { data, error: null };
    } catch (error) {
        console.error('testTeachersTable: Error in direct query:', error);
        return { error: error.message };
    }
}

/**
 * Fetch all active teachers from Supabase
 * @returns {Promise<Array>} - Array of teacher objects
 */
export async function fetchTeachers() {
    console.log('fetchTeachers: Starting query to teachers table');
    try {
        // First, try the query with is_active filter
        console.log('fetchTeachers: Trying query with is_active = true filter');
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('is_active', true)
            .order('name');

        console.log('fetchTeachers: Filtered query completed', { data: data ? `${data.length} items` : 'null', error });
        if (error) {
            console.error('fetchTeachers: Filtered query failed:', error);
            // If there's an error with the is_active column, try without it
            console.log('fetchTeachers: Trying query without is_active filter');
            const { data: dataNoFilter, error: errorNoFilter } = await supabase
                .from('teachers')
                .select('*')
                .order('name');

            console.log('fetchTeachers: Unfiltered query completed', { data: dataNoFilter ? `${dataNoFilter.length} items` : 'null', error: errorNoFilter });
            if (errorNoFilter) {
                console.error('fetchTeachers: Unfiltered query also failed:', errorNoFilter);
                throw errorNoFilter;
            }
            console.log('fetchTeachers: Returning', dataNoFilter ? `${dataNoFilter.length} teachers (no filter)` : 'null/undefined data');
            return dataNoFilter || [];
        }

        // If query succeeded but returned zero results, also try without filter
        // in case is_active column exists but values are not what we expect
        if (data && data.length === 0) {
            console.log('fetchTeachers: Filtered query returned zero results, trying without is_active filter');
            const { data: dataNoFilter, error: errorNoFilter } = await supabase
                .from('teachers')
                .select('*')
                .order('name');

            console.log('fetchTeachers: Unfiltered query completed', { data: dataNoFilter ? `${dataNoFilter.length} items` : 'null', error: errorNoFilter });
            if (errorNoFilter) {
                console.error('fetchTeachers: Unfiltered query failed:', errorNoFilter);
                // If the unfiltered query also fails, we'll return the zero results from filtered query
                console.log('fetchTeachers: Returning zero results from filtered query (unfiltered also failed)');
                return data || [];
            }
            console.log('fetchTeachers: Returning', dataNoFilter ? `${dataNoFilter.length} teachers (no filter)` : 'null/undefined data');
            return dataNoFilter || [];
        }

        console.log('fetchTeachers: Returning', data ? `${data.length} teachers (with filter)` : 'null/undefined data');
        return data || [];
    } catch (error) {
        console.error('fetchTeachers: Error in fetchTeachers:', error);
        throw error;
    }
}

/**
 * Fetch reviews for a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} - Array of review objects
 */
export async function fetchTeacherReviews(teacherId) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching teacher reviews:', error);
        throw error;
    }
}

/**
 * Fetch teacher with their review statistics
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} - Teacher object with stats
 */
export async function fetchTeacherWithStats(teacherId) {
    try {
        // Fetch teacher data
        const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', teacherId)
            .single();

        if (teacherError) throw teacherError;

        // Fetch reviews for this teacher
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('status', 'approved');

        if (reviewsError) throw reviewsError;

        const reviews = reviewsData || [];
        const stats = getReviewStats(reviews);

        return {
            ...teacherData,
            stats
        };
    } catch (error) {
        console.error('Error fetching teacher with stats:', error);
        throw error;
    }
}

/**
 * Render teachers grid with search, filter, and sort functionality
 * @param {HTMLElement} container - Container element to render teachers in
 */
export async function renderTeachersGrid(container) {
    console.log('renderTeachersGrid: Starting');
    showLoading(container, "Loading teachers...");

    try {
        console.log('renderTeachersGrid: About to call fetchTeachers');
        const teachers = await fetchTeachers();
        console.log('renderTeachersGrid: fetchTeachers returned', teachers.length, 'teachers');

        if (teachers.length === 0) {
            console.log('renderTeachersGrid: No teachers found, showing empty state');
            showEmpty(container, "No teachers found.");
            return;
        }

        console.log('renderTeachersGrid: Creating teacher cards for', teachers.length, 'teachers');
        // For now, we'll render all teachers without stats to avoid too many requests
        // In a real implementation, we might fetch stats in batch or use the view
        const teacherCards = teachers.map(teacher => {
            // Create a basic card without stats for initial rendering
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.dataset.teacherId = teacher.id;

            card.innerHTML = `
                <div class="teacher-card-content">
                    <h2 class="teacher-name">${escapeHtml(teacher.name)}</h2>
                    <p class="teacher-subject">${escapeHtml(teacher.subject)}</p>
                    <div class="teacher-rating">
                        <div class="rating-percentage">--</div>
                        <span class="rating-label neutral">Loading...</span>
                    </div>
                    <div class="review-counts">
                        <span class="positive">-- 👍</span>
                        <span class="negative">-- 👎</span>
                    </div>
                </div>
            `;

            return card;
        });

        console.log('renderTeachersGrid: Clearing container and appending', teacherCards.length, 'cards');
        container.innerHTML = '';
        teacherCards.forEach(card => container.appendChild(card));

        // Now fetch stats for each teacher and update cards
        console.log('renderTeachersGrid: About to fetch stats for teachers');
        await updateTeacherStatsCards(teachers, container);
        console.log('renderTeachersGrid: Stats update completed');

    } catch (error) {
        console.error('renderTeachersGrid: Error occurred:', error);
        showError(container, "Failed to load teachers. Please try again.");
    }
}

/**
 * Update teacher cards with their actual statistics
 * @param {Array} teachers - Array of teacher objects
 * @param {HTMLElement} container - Container element holding the cards
 */
export async function updateTeacherStatsCards(teachers, container) {
    try {
        // Fetch stats for all teachers in parallel
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

        const results = await Promise.all(teacherPromises);

        // Update each card with actual stats
        results.forEach(({ teacher, stats }) => {
            const card = container.querySelector(`[data-teacher-id="${teacher.id}"]`);
            if (!card) return;

            const { label, class: ratingClass } = getRatingLabel(stats.percentage, stats.totalCount);

            card.innerHTML = `
                <div class="teacher-card-content">
                    <h2 class="teacher-name">${escapeHtml(teacher.name)}</h2>
                    <p class="teacher-subject">${escapeHtml(teacher.subject)}</p>
                    <div class="teacher-rating">
                        <div class="rating-percentage">${stats.percentage}%</div>
                        <span class="rating-label ${ratingClass}">${label}</span>
                    </div>
                    <div class="review-counts">
                        <span class="positive">${stats.positiveCount} 👍</span>
                        <span class="negative">${stats.negativeCount} 👎</span>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error updating teacher stats cards:', error);
    }
}

/**
 * Search teachers by name or subject
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching teachers
 */
export async function searchTeachers(query) {
    try {
        if (!query.trim()) {
            return await fetchTeachers();
        }

        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('is_active', true)
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
            .order('name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error searching teachers:', error);
        throw error;
    }
}

/**
 * Filter teachers by subject
 * @param {string} subject - Subject to filter by
 * @returns {Promise<Array>} - Array of filtered teachers
 */
export async function filterTeachersBySubject(subject) {
    try {
        if (subject === 'all-subjects') {
            return await fetchTeachers();
        }

        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('is_active', true)
            .eq('subject', subject)
            .order('name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error filtering teachers by subject:', error);
        throw error;
    }
}

/**
 * Sort teachers based on criteria
 * @param {Array} teachers - Array of teacher objects
 * @param {string} sortBy - Sort criterion
 * @returns {Array} - Sorted array of teachers
 */
export function sortTeachers(teachers, sortBy) {
    const statsPromises = teachers.map(async (teacher) => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('vote')
                .eq('teacher_id', teacher.id)
                .eq('status', 'approved');

            if (error) throw error;

            const reviews = data || [];
            const stats = getReviewStats(reviews);
            return { teacher, stats };
        } catch (error) {
            console.error(`Error fetching stats for sorting teacher ${teacher.id}:`, error);
            return { teacher, stats: { positiveCount: 0, negativeCount: 0, totalCount: 0, percentage: 0 } };
        }
    });

    return Promise.all(statsPromises).then(results => {
        return results.sort((a, b) => {
            switch (sortBy) {
                case 'most-reviewed':
                    return b.stats.totalCount - a.stats.totalCount;
                case 'highest-rated':
                    return b.stats.percentage - a.stats.percentage;
                case 'lowest-rated':
                    return a.stats.percentage - b.stats.percentage;
                case 'name-az':
                    return a.teacher.name.localeCompare(b.teacher.name);
                case 'name-za':
                    return b.teacher.name.localeCompare(a.teacher.name);
                case 'recently-reviewed':
                    // For simplicity, we'll use percentage as secondary sort
                    // In a real implementation, we'd fetch the latest review date
                    if (b.stats.percentage !== a.stats.percentage) {
                        return b.stats.percentage - a.stats.percentage;
                    }
                    return b.stats.totalCount - a.stats.totalCount;
                default:
                    return 0;
            }
        }).map(result => result.teacher);
    });
}

console.log("Teacher data operations loaded");