// Main application logic for ClassReview
// Handles page initialization, event listeners, and routing

import { supabase } from './supabase.js';
import { fetchTeachers, renderTeachersGrid, searchTeachers, filterTeachersBySubject, sortTeachers, updateTeacherStatsCards } from './teachers.js';
import { loadTeacherProfile, renderTeacherHeader, renderTeacherRating, renderReviewCounts, renderReviewVisualization, renderReviewsList, initReviewForm, initReviewSortButtons } from './teacher-profile.js';
import { renderMostReviewedList, renderTopRatedList } from './rankings.js';
import { showLoading, showError, showEmpty, escapeHtml, debounce } from './ui.js';
import { reportReview } from './reviews.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize based on current page
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/' || path === '') {
        initHomePage();
    } else if (path.endsWith('teachers.html')) {
        initTeachersPage();
    } else if (path.endsWith('teacher.html')) {
        initTeacherProfilePage();
    } else if (path.endsWith('top-rated.html')) {
        initTopRatedPage();
    } else if (path.endsWith('most-reviewed.html')) {
        initMostReviewedPage();
    } else if (path.endsWith('about.html')) {
        initAboutPage();
    }

    // Initialize mobile menu if exists
    initMobileMenu();
});

/**
 * Initialize homepage
 */
async function initHomePage() {
    // Load most reviewed teachers for homepage
    const mostReviewedContainer = document.getElementById('most-reviewed-teachers');
    if (mostReviewedContainer) {
        try {
            await renderMostReviewedList(mostReviewedContainer);
        } catch (error) {
            showError(mostReviewedContainer, "Failed to load most reviewed teachers.");
        }
    }

    // Initialize search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce(async (e) => {
            const query = e.target.value;
            try {
                const teachers = await searchTeachers(query);
                // For homepage, we could show search results in a dropdown or redirect
                // For now, we'll just log them
                console.log('Search results for:', query, teachers);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }
}

/**
 * Initialize teachers page
 */
async function initTeachersPage() {
    // Load teachers grid
    const teachersContainer = document.getElementById('teachers-grid');
    if (teachersContainer) {
        try {
            await renderTeachersGrid(teachersContainer);
        } catch (error) {
            showError(teachersContainer, "Failed to load teachers.");
        }
    }

    // Initialize search
    const searchInput = document.getElementById('teacher-search');
    if (searchInput) {
        const debouncedSearch = debounce(async (e) => {
            const query = e.target.value;
            const teachersContainer = document.getElementById('teachers-grid');
            if (!teachersContainer) return;

            try {
                showLoading(teachersContainer, "Searching teachers...");
                const teachers = await searchTeachers(query);

                if (teachers.length === 0) {
                    showEmpty(teachersContainer, "No teachers found matching your search.");
                    return;
                }

                // Re-render with search results
                teachersContainer.innerHTML = '';
                const teacherCards = teachers.map(teacher => {
                    const card = document.createElement('div');
                    card.className = 'teacher-card';
                    card.dataset.teacherId = teacher.id;

                    // Placeholder content - will be updated with stats
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

                teachersContainer.innerHTML = '';
                teacherCards.forEach(card => teachersContainer.appendChild(card));

                // Update with actual stats
                await updateTeacherStatsCards(teachers, teachersContainer);

            } catch (error) {
                showError(teachersContainer, "Failed to search teachers.");
            }
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }

    // Initialize sort dropdown
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', async (e) => {
            const sortBy = e.target.value;
            const teachersContainer = document.getElementById('teachers-grid');
            if (!teachersContainer) return;

            try {
                showLoading(teachersContainer, "Sorting teachers...");
                const teachers = await fetchTeachers();
                const sortedTeachers = await sortTeachers(teachers, sortBy);

                // Re-render with sorted results
                teachersContainer.innerHTML = '';
                const teacherCards = sortedTeachers.map(teacher => {
                    const card = document.createElement('div');
                    card.className = 'teacher-card';
                    card.dataset.teacherId = teacher.id;

                    // Placeholder content - will be updated with stats
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

                teachersContainer.innerHTML = '';
                teacherCards.forEach(card => teachersContainer.appendChild(card));

                // Update with actual stats
                await updateTeacherStatsCards(sortedTeachers, teachersContainer);

            } catch (error) {
                showError(teachersContainer, "Failed to sort teachers.");
            }
        });
    }

    // Initialize filter dropdown
    const filterDropdown = document.getElementById('filter-dropdown');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', async (e) => {
            const subject = e.target.value;
            const teachersContainer = document.getElementById('teachers-grid');
            if (!teachersContainer) return;

            try {
                showLoading(teachersContainer, "Filtering teachers...");
                const teachers = await filterTeachersBySubject(subject);

                if (teachers.length === 0) {
                    showEmpty(teachersContainer, "No teachers found for this subject.");
                    return;
                }

                // Re-render with filtered results
                teachersContainer.innerHTML = '';
                const teacherCards = teachers.map(teacher => {
                    const card = document.createElement('div');
                    card.className = 'teacher-card';
                    card.dataset.teacherId = teacher.id;

                    // Placeholder content - will be updated with stats
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

                teachersContainer.innerHTML = '';
                teacherCards.forEach(card => teachersContainer.appendChild(card));

                // Update with actual stats
                await updateTeacherStatsCards(teachers, teachersContainer);

            } catch (error) {
                showError(teachersContainer, "Failed to filter teachers.");
            }
        });
    }
}

/**
 * Initialize teacher profile page
 */
async function initTeacherProfilePage() {
    // Get teacher ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('id');

    if (!teacherId) {
        const container = document.querySelector('.teacher-profile');
        if (container) {
            showError(container, "Teacher not found.");
        }
        return;
    }

    try {
        // Load teacher profile data
        const { teacher, reviews, stats } = await loadTeacherProfile(teacherId);

        // Render profile sections
        renderTeacherHeader(teacher);
        renderTeacherRating(stats);
        renderReviewCounts(stats);
        renderReviewVisualization(stats);

        // Render reviews list
        const reviewsContainer = document.getElementById('reviews-list');
        if (reviewsContainer) {
            if (reviews.length === 0) {
                showEmpty(reviewsContainer, "No reviews yet.");
            } else {
                renderReviewsList(reviews);
            }
        }

        // Initialize review form
        initReviewForm(teacherId);

        // Initialize review sort buttons
        initReviewSortButtons(reviews);

    } catch (error) {
        console.error('Error initializing teacher profile:', error);
        const container = document.querySelector('.teacher-profile');
        if (container) {
            showError(container, "Failed to load teacher profile.");
        }
    }
}

/**
 * Initialize top rated page
 */
async function initTopRatedPage() {
    const container = document.getElementById('top-rated-list');
    if (container) {
        try {
            await renderTopRatedList(container);
        } catch (error) {
            showError(container, "Failed to load top rated teachers.");
        }
    }
}

/**
 * Initialize most reviewed page
 */
async function initMostReviewedPage() {
    const container = document.getElementById('most-reviewed-list');
    if (container) {
        try {
            await renderMostReviewedList(container);
        } catch (error) {
            showError(container, "Failed to load most reviewed teachers.");
        }
    }
}

/**
 * Initialize about page
 */
function initAboutPage() {
    // About page is static, no initialization needed
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Create mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = '☰';
    mobileBtn.setAttribute('aria-label', 'Open menu');

    // Insert before nav
    nav.parentNode.insertBefore(mobileBtn, nav);

    // Toggle menu
    mobileBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-active');
        mobileBtn.setAttribute('aria-label',
            nav.classList.contains('mobile-active') ? 'Close menu' : 'Open menu');
    });

    // Close menu when clicking a link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('mobile-active');
            mobileBtn.setAttribute('aria-label', 'Open menu');
        });
    });
}

// Export for use in other modules if needed
export { initHomePage, initTeachersPage, initTeacherProfilePage, initTopRatedPage, initMostReviewedPage, initAboutPage };

console.log("Main application loaded");