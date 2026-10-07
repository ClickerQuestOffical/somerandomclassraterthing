// UI utilities for ClassReview
// Contains helper functions for DOM manipulation, loading states, and user interactions

/**
 * Show a loading indicator in an element
 * @param {HTMLElement} element - Element to show loading in
 * @param {string} message - Loading message to display
 */
export function showLoading(element, message = "Loading...") {
    element.innerHTML = `
        <div class="loading">
            ${message}
        </div>
    `;
}

/**
 * Show an error message in an element
 * @param {HTMLElement} element - Element to show error in
 * @param {string} message - Error message to display
 */
export function showError(element, message = "Something went wrong. Please try again.") {
    element.innerHTML = `
        <div class="error">
            ${message}
            <button class="btn-retry" id="retry-button">Try Again</button>
        </div>
    `;
}

/**
 * Show an empty state message in an element
 * @param {HTMLElement} element - Element to show empty state in
 * @param {string} message - Empty state message to display
 */
export function showEmpty(element, message = "No data available.") {
    element.innerHTML = `
        <div class="empty">
            ${message}
        </div>
    `;
}

/**
 * Create a teacher card element
 * @param {Object} teacher - Teacher object with id, name, subject, etc.
 * @param {Object} stats - Statistics object with positiveCount, negativeCount, totalCount, percentage
 * @returns {HTMLElement} - Teacher card element
 */
export function createTeacherCard(teacher, stats) {
    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.dataset.teacherId = teacher.id;

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

    return card;
}

/**
 * Create a review card element
 * @param {Object} review - Review object with vote, comment, created_at
 * @returns {HTMLElement} - Review card element
 */
export function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    const voteIcon = review.vote === 'positive' ? '👍' : '👎';
    const voteClass = review.vote === 'positive' ? 'positive' : 'negative';
    const date = new Date(review.created_at).toLocaleDateString();

    card.innerHTML = `
        <div class="review-header">
            <div class="vote-icon ${voteClass}">${voteIcon}</div>
            <div class="review-meta">
                <span>Anonymous Student</span>
                <span>${date}</span>
            </div>
        </div>
        <div class="review-text">${escapeHtml(review.comment || '')}</div>
        <button class="report-button" data-review-id="${review.id}">
            🚩 Report Review
        </button>
    `;

    return card;
}

/**
 * Create a ranked teacher element for leaderboards
 * @param {Object} teacher - Teacher object
 * @param {Object} stats - Statistics object
 * @param {number} rank - Ranking position
 * @returns {HTMLElement} - Ranked teacher element
 */
export function createRankedTeacher(teacher, stats, rank) {
    const element = document.createElement('div');
    element.className = 'ranked-teacher';

    const { label, class: ratingClass } = getRatingLabel(stats.percentage, stats.totalCount);

    element.innerHTML = `
        <div class="rank">#${rank}</div>
        <div class="teacher-info">
            <h3>${escapeHtml(teacher.name)}</h3>
            <p class="subject">${escapeHtml(teacher.subject)}</p>
        </div>
        <div class="teacher-stats">
            <span class="percentage ${ratingClass}">${stats.percentage}%</span>
            <span class="review-count">${stats.totalCount} reviews</span>
        </div>
    `;

    return element;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

console.log("UI utilities loaded");