// Rating utilities for ClassReview
// Contains reusable functions for calculating ratings, labels, and styles

import { RATING_CONFIG } from './config.js';

/**
 * Calculate the rating percentage from positive and negative counts
 * @param {number} positiveCount - Number of positive reviews
 * @param {number} negativeCount - Number of negative reviews
 * @returns {number} - Rating percentage (0-100)
 */
export function calculateRating(positiveCount, negativeCount) {
    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    return Math.round((positiveCount / total) * 100);
}

/**
 * Get the rating label based on percentage and review count
 * @param {number} percentage - Rating percentage (0-100)
 * @param {number} reviewCount - Total number of reviews
 * @returns {Object} - Object containing label and CSS class
 */
export function getRatingLabel(percentage, reviewCount) {
    const config = RATING_CONFIG;

    // If not enough reviews for a strong rating
    if (reviewCount < config.MIN_REVIEWS_FOR_STRONG_RATING) {
        for (const tier of config.LOW_COUNT_LABELS) {
            if (percentage >= tier.min) {
                return { label: tier.label, class: tier.class };
            }
        }
        // Fallback (should not reach here with proper config)
        return { label: "Not enough reviews for a strong rating", class: "neutral" };
    }

    // Use standard thresholds for sufficient review count
    for (const tier of config.PERCENTAGE_THRESHOLDS) {
        if (percentage >= tier.min) {
            return { label: tier.label, class: tier.class };
        }
    }

    // Fallback (should not reach here with proper config)
    return { label: "Negative", class: "negative" };
}

/**
 * Get CSS class for a rating label
 * @param {string} label - Rating label
 * @returns {string} - CSS class name
 */
export function getRatingClass(label) {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('positive') || labelLower.includes('mixed')) {
        return labelLower.includes('mixed') ? 'neutral' : 'positive';
    }
    return 'negative';
}

/**
 * Get color for a rating label
 * @param {string} label - Rating label
 * @returns {string} - CSS color value
 */
export function getRatingColor(label) {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('positive')) {
        return 'var(--accent-blue)';
    } else if (labelLower.includes('mixed')) {
        return 'var(--accent-yellow)';
    }
    return 'var(--accent-red)';
}

/**
 * Calculate review statistics from an array of reviews
 * @param {Array} reviews - Array of review objects
 * @returns {Object} - Statistics object with positive, negative, total counts and percentage
 */
export function getReviewStats(reviews) {
    const approvedReviews = reviews.filter(review => review.status === 'approved');
    const positiveCount = approvedReviews.filter(review => review.vote === 'positive').length;
    const negativeCount = approvedReviews.filter(review => review.vote === 'negative').length;
    const totalCount = approvedReviews.length;
    const percentage = calculateRating(positiveCount, negativeCount);

    return {
        positiveCount,
        negativeCount,
        totalCount,
        percentage
    };
}

console.log("Rating utilities loaded");