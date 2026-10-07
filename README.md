# ClassReview - 8th Grade Teacher Review Website

A Steam-inspired teacher review website for 8th grade students to share anonymous feedback about their classroom experiences.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Supabase Setup](#supabase-setup)
- [Local Development](#local-development)
- [Deployment to GitHub Pages](#deployment-to-github-pages)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Limitations](#limitations)

## Overview

ClassReview is a static website inspired by Steam's review system, designed specifically for 8th grade students to review their teachers anonymously. The site allows students to:

- Browse and search for teachers
- Leave thumbs-up/thumbs-down reviews with comments
- Read anonymous reviews from other students
- Report inappropriate reviews
- View teacher rankings (most reviewed, top rated, etc.)
- See visualizations of review distributions

The site uses Supabase as its backend for storing teacher data, reviews, and reports, with all frontend code being static HTML/CSS/JavaScript suitable for GitHub Pages deployment.

## Features

- **Steam-inspired UI**: Dark modern interface with clear visual hierarchy
- **Anonymous Reviews**: Students can leave feedback without revealing their identity
- **Moderation System**: Reviews can be reported and require approval (configurable)
- **Rating System**: Uses percentage-based ratings with Steam-inspired labels
- **Search & Filter**: Find teachers by name or subject
- **Sorting Options**: Sort teachers by various criteria
- **Review Visualization**: Visual representation of positive/negative feedback
- **Reporting System**: Flag inappropriate content for moderation
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Loading/Error States**: User-friendly feedback during data operations
- **Accessibility**: Semantic HTML and keyboard navigation

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL database with authentication)
- **Hosting**: GitHub Pages (static site)
- **Icons**: Unicode emojis (no external icon libraries required)
- **Fonts**: System fonts for fast loading

## Setup Instructions

### Prerequisites
- A web browser for local testing
- Git for version control (optional but recommended)
- A Supabase account (free tier available)

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and public anon key from Settings > API
3. Run the SQL schema found in `supabase/schema.sql` in your Supabase SQL editor
4. (Optional) Run the seed data in `supabase/seed.sql` to populate sample teachers and reviews
5. Update `js/config.js` with your Supabase URL and anon key

### Local Development

1. Clone or download this repository
2. Open any HTML file in your browser (e.g., `index.html`)
3. The site should load and connect to your Supabase instance
4. Test functionality by submitting reviews, searching teachers, etc.

### Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select the `main` branch and `/root` folder
4. GitHub will provide a URL where your site is deployed
5. Note: The site will only work if your Supabase URL and anon key are correctly configured

## Configuration

### Supabase Configuration
Edit `js/config.js` to set:
```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLIC_ANON_KEY";
```

### Rating Configuration
Also in `js/config.js`, you can adjust:
- `MIN_REVIEWS_FOR_STRONG_RATING`: Minimum reviews needed for a strong rating label
- `PERCENTAGE_THRESHOLDS`: Percentage ranges for each rating label
- `LOW_COUNT_LABELS`: Labels for teachers with few reviews

### Moderation Settings
In `js/config.js`:
- `REQUIRE_APPROVAL`: Set to `true` to require moderation approval for reviews
- `AUTO_APPROVE`: If `REQUIRE_APPROVAL` is false, determines if reviews are auto-approved

## Project Structure

```
ClassReview/
├── index.html              # Homepage
├── teachers.html           # Teacher browsing page
├── teacher.html            # Individual teacher profile
├── top-rated.html          # Top rated teachers page
├── most-reviewed.html      # Most reviewed teachers page
├── about.html              # About page
├── styles.css              # Main stylesheet
├── README.md               # This file
│
├── js/                     # JavaScript modules
│   ├── config.js           # Configuration settings
│   ├── supabase.js         # Supabase client initialization
│   ├── rating.js           # Rating calculation utilities
│   ├── ui.js               # UI helper functions
│   ├── teachers.js         # Teacher data operations
│   ├── teacher-profile.js  # Teacher profile page logic
│   ├── reviews.js          # Review submission/reporting
│   ├── rankings.js         # Teacher ranking algorithms
│   └── app.js              # Main application logic
│
├── supabase/               # Supabase-related files
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data (for testing only)
└── assets/                 # Images, icons, etc. (not currently used)
```

## Security Considerations

1. **Anonymous Auth**: Uses Supabase's anonymous authentication pattern for review submissions
2. **Row Level Security (RLS)**: Database policies restrict what clients can do
3. **No Service Keys**: Only public anon keys are used in frontend code
4. **Input Sanitization**: All user-submitted content is escaped before display
5. **CSRF Protection**: Relies on Supabase's built-in protections
6. **XSS Prevention**: Uses `textContent` instead of `innerHTML` for user content

**Important**: Never put your Supabase service-role key in this repository or expose it in client-side code.

## Limitations

1. **Dependence on Supabase**: Requires internet connection to connect to Supabase
2. **Moderation Interface**: No built-in moderation dashboard (would require additional admin interface)
3. **Rate Limiting**: Basic duplicate review prevention but could be enhanced
4. **Search Functionality**: Client-side filtering after fetch; could be optimized with database search
5. **Analytics**: No built-in analytics for site usage
6. **Customization**: Theming would require CSS modifications

## Known Issues

1. **Anonymous User ID**: Currently uses a placeholder; in production should use proper session-based anonymous IDs
2. **Review Helpfulness**: "Most Helpful" sort currently defaults to most recent (no helpful vote system implemented)
3. **Email Verification**: No email verification for reporting system

## Contributing

This is a complete, functional implementation. For bug fixes or enhancements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes. Feel free to adapt and use it for your own school or organization.

## Acknowledgments

- Inspired by Steam's review system
- Built with Supabase as the backend
- Created as a demonstration of what can be built with static sites and modern backend services