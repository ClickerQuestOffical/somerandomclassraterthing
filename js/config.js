// Configuration for ClassReview
// Replace these values with your actual Supabase project credentials

export const SUPABASE_URL = "https://bgrcncutzspnmbhefmah.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_Y53lgmHnLrcfGeWT9VpPAw_9gs8j-AZ";

// Rating thresholds configuration
// These values determine the rating labels based on percentage and review count
export const RATING_CONFIG = {
    // Minimum reviews required for a strong rating label
    MIN_REVIEWS_FOR_STRONG_RATING: 10,

    // Percentage thresholds for rating labels (when review count >= MIN_REVIEWS_FOR_STRONG_RATING)
    PERCENTAGE_THRESHOLDS: [
        { min: 95, label: "Overwhelmingly Positive", class: "positive" },
        { min: 80, label: "Very Positive", class: "positive" },
        { min: 70, label: "Mostly Positive", class: "positive" },
        { min: 40, label: "Mixed", class: "neutral" },
        { min: 20, label: "Mostly Negative", class: "negative" },
        { min: 0, label: "Negative", class: "negative" }
    ],

    // For teachers with low review counts, use these labels
    LOW_COUNT_LABELS: [
        { min: 80, label: "Positive", class: "positive" },
        { min: 0, label: "Not enough reviews for a strong rating", class: "neutral" }
    ]
};

// Moderation settings
export const MODERATION_CONFIG = {
    // Set to true to require moderation approval for reviews
    REQUIRE_APPROVAL: false,

    // Auto-approve reviews if REQUIRE_APPROVAL is false
    AUTO_APPROVE: true
};

console.log("ClassReview configuration loaded");