// Teacher profile operations for ClassReview
// Handles loading and displaying teacher profile data

import { supabase } from './supabase.js';
import { getRatingLabel, getReviewStats } from './rating.js';
import { showLoading, showError, showEmpty, createReviewCard, escapeHtml } from './ui.js';
import { getAnonymousUserId } from './supabase.js';
import { MODERATION_CONFIG } from './config.js';

/**
 * Get teacher ID from URL query parameter
 * @returns {string|null} - Teacher ID or null if not found
 */
export function getTeacherIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Load teacher profile data
 * @param {string} teacherId - Teacher ID to load
 * @returns {Promise<Object>} - Teacher data with stats and reviews
 */
export async function loadTeacherProfile(teacherId) {
    if (!teacherId) {
        throw new Error('Teacher ID is required');
    }

    try {
        // Fetch teacher data
        const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', teacherId)
            .single();

        if (teacherError) throw teacherError;
        if (!teacherData) throw new Error('Teacher not found');

        // Fetch reviews for this teacher
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        const reviews = reviewsData || [];
        const stats = getReviewStats(reviews);

        return {
            teacher: teacherData,
            reviews,
            stats
        };
    } catch (error) {
        console.error('Error loading teacher profile:', error);
        throw error;
    }
}

/**
 * Render teacher profile header
 * @param {Object} teacher - Teacher object
 */
export function renderTeacherHeader(teacher) {
    const headerElement = document.getElementById('teacher-header');
    if (!headerElement) return;

    headerElement.innerHTML = `
        <h2>${escapeHtml(teacher.name)}</h2>
        <p class="subject">${escapeHtml(teacher.subject)}</p>
    `;
}

/**
 * Render teacher rating section
 * @param {Object} stats - Statistics object
 */
export function renderTeacherRating(stats) {
    const ratingElement = document.getElementById('teacher-rating');
    if (!ratingElement) return;

    const { label, class: ratingClass } = getRatingLabel(stats.percentage, stats.totalCount);

    // Calculate bar width based on percentage
    const barWidth = stats.percentage;

    ratingElement.innerHTML = `
        <div class="rating-bar-container">
            <div class="rating-bar-fill" style="width: ${barWidth}%;"></div>
            <div class="rating-label-large">${stats.percentage}%</div>
        </div>
        <div class="rating-label-large-text ${ratingClass}">${label}</div>
        <p>${stats.percentage}% of students recommend this teacher</p>
        <p>${stats.totalCount} reviews</p>
    `;
}

/**
 * Render review counts section
 * @param {Object} stats - Statistics object
 */
export function renderReviewCounts(stats) {
    const countsElement = document.getElementById('review-counts');
    if (!countsElement) return;

    countsElement.innerHTML = `
        <div class="count positive">${stats.positiveCount}</div>
        <div class="label">THUMBS UP</div>
        <div class="count negative">${stats.negativeCount}</div>
        <div class="label">THUMBS DOWN</div>
    `;
}

/**
 * Render review visualization section
 * @param {Object} stats - Statistics object
 */
export function renderReviewVisualization(stats) {
    const vizElement = document.getElementById('review-visualization');
    if (!vizElement) return;

    const total = stats.positiveCount + stats.negativeCount;
    const positivePercentage = total > 0 ? (stats.positiveCount / total) * 100 : 0;
    const negativePercentage = total > 0 ? (stats.negativeCount / total) * 100 : 0;

    vizElement.innerHTML = `
        <div class="visualization-bar">
            <div class="visualization-segment positive" style="flex: ${positivePercentage};"></div>
            <div class="visualization-segment negative" style="flex: ${negativePercentage};"></div>
        </div>
        <div class="visualization-label">
            <span>Positive ${stats.positiveCount}</span>
            <span>Negative ${stats.negativeCount}</span>
        </div>
    `;
}

/**
 * Render reviews list
 * @param {Array} reviews - Array of review objects
 * @param {string} sortBy - Sort criterion
 */
export async function renderReviewsList(reviews, sortBy = 'most-recent') {
    const listElement = document.getElementById('reviews-list');
    if (!listElement) return;

    if (reviews.length === 0) {
        showEmpty(listElement, "No reviews yet.");
        return;
    }

    // Sort reviews based on criteria
    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case 'most-helpful':
                // For simplicity, we'll use recent as helpful
                // In a real implementation, we'd have helpful votes
                return new Date(b.created_at) - new Date(a.created_at);
            case 'most-recent':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'most-positive':
                return b.vote === 'positive' && a.vote === 'negative' ? 1 :
                       b.vote === 'negative' && a.vote === 'positive' ? -1 : 0;
            case 'most-negative':
                return a.vote === 'positive' && b.vote === 'negative' ? 1 :
                       a.vote === 'negative' && b.vote === 'positive' ? -1 : 0;
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    listElement.innerHTML = '';
    sortedReviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        listElement.appendChild(reviewCard);
    });
}

/**
 * Handle review submission
 * @param {string} teacherId - Teacher ID to review
 * @param {string} vote - Vote value ('positive' or 'negative')
 * @param {string} comment - Review comment
 * @returns {Promise<Object>} - Result of submission
 */
export async function submitReview(teacherId, vote, comment) {
    try {
        // Get the anonymous user ID
        const anonymousUserId = await getAnonymousUserId();

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                teacher_id: teacherId,
                anonymous_user_id: anonymousUserId,
                vote: vote,
                comment: comment.trim(),
                status: MODERATION_CONFIG.REQUIRE_APPROVAL ? 'pending' : 'approved'
            });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

/**
 * Initialize review form event listeners
 * @param {string} teacherId - Teacher ID for the form
 */
export function initReviewForm(teacherId) {
    const form = document.getElementById('review-form');
    const votePositiveBtn = document.getElementById('vote-positive');
    const voteNegativeBtn = document.getElementById('vote-negative');
    const commentInput = document.getElementById('review-comment');
    const charCounter = document.querySelector('.char-counter');
    const submitBtn = document.getElementById('submit-review');

    if (!form || !votePositiveBtn || !voteNegativeBtn || !commentInput || !charCounter || !submitBtn) return;

    let currentVote = null;

    // Handle vote button clicks
    votePositiveBtn.addEventListener('click', () => {
        currentVote = 'positive';
        votePositiveBtn.classList.add('active');
        voteNegativeBtn.classList.remove('active');
    });

    voteNegativeBtn.addEventListener('click', () => {
        currentVote = 'negative';
        voteNegativeBtn.classList.add('active');
        votePositiveBtn.classList.remove('active');
    });

    // Handle character counter
    commentInput.addEventListener('input', () => {
        const remaining = 1000 - commentInput.value.length;
        charCounter.textContent = `${commentInput.value.length}/1000`;

        if (commentInput.value.length > 1000) {
            commentInput.value = commentInput.value.slice(0, 1000);
            charCounter.textContent = `1000/1000`;
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentVote) {
            alert('Please select a recommendation');
            return;
        }

        if (!commentInput.value.trim()) {
            alert('Please write a comment');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            await submitReview(teacherId, currentVote, commentInput.value);

            // Reset form
            form.reset();
            currentVote = null;
            votePositiveBtn.classList.remove('active');
            voteNegativeBtn.classList.remove('active');
            charCounter.textContent = '0/1000';

            // Show success message
            submitBtn.textContent = 'Review submitted successfully.';
            submitBtn.style.backgroundColor = 'var(--success-green)';

            // Reset button after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post Review';
                submitBtn.style.backgroundColor = 'var(--accent-blue)';
            }, 2000);

        } catch (error) {
            console.error('Error submitting review:', error);
            submitBtn.textContent = 'Submit Review';
            submitBtn.disabled = false;
            alert('Failed to submit review. Please try again.');
        }
    });
}

/**
 * Initialize review sort buttons
 * @param {Array} reviews - Array of review objects
 */
export function initReviewSortButtons(reviews) {
    const sortHelpfulBtn = document.getElementById('sort-helpful');
    const sortRecentBtn = document.getElementById('sort-recent');
    const sortPositiveBtn = document.getElementById('sort-positive');
    const sortNegativeBtn = document.getElementById('sort-negative');
    const reviewsList = document.getElementById('reviews-list');

    if (!sortHelpfulBtn || !sortRecentBtn || !sortPositiveBtn || !sortNegativeBtn || !reviewsList) return;

    const buttons = [sortHelpfulBtn, sortRecentBtn, sortPositiveBtn, sortNegativeBtn];

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Re-render reviews with new sort
            const sortBy = button.id.replace('sort-', '');
            renderReviewsList(reviews, sortBy);
        });
    });
}

console.log("Teacher profile operations loaded");