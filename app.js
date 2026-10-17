/**
 * ==============================================================================
 * IIITNR EVENTS PLATFORM - CORE APPLICATION MODULE (app.js)
 * ==============================================================================
 * This script serves as the centralized brain for:
 * 1. Initializing the Supabase CDN client.
 * 2. Managing student/faculty authentication sessions via Google OAuth.
 * 3. Enforcing campus domain security (@iiitnr.edu.in restriction).
 * 4. Protecting routes (forcing onboarding for new profiles, login for guests).
 * 5. Dynamically displaying role-based access links (.admin-link for organizers/admins).
 * 6. Managing universal UI controls (mobile hamburger navigation menu, logout).
 * ==============================================================================
 */

// --- 1. SUPABASE CONFIGURATION & INITIALIZATION ---
// Connects to the DSPM IIIT-NR Supabase PostgreSQL project
const SUPABASE_URL = 'https://buphhnxnjfrjwkagftru.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cGhobnhuamZyandrYWdmdHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDY1OTEsImV4cCI6MjEwNDc4MjU5MX0.qcwPT1hpyPZ4fyvwXrMei-3_EHzdHg-aGhfAecCB_Yc';

// Strict Campus Email Restriction - only students/faculty with this domain can authenticate
const ALLOWED_DOMAIN = '@iiitnr.edu.in';

// Initialize Supabase Client (assumes window.supabase is loaded from CDN)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. DOM ELEMENT REFERENCES ---
const loginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn'); 

/**
 * Display user-friendly error banners on the login interface.
 * @param {string} msg - The error message to present to the user.
 */
function showError(msg) {
    if (errorMessage) {
        errorMessage.innerHTML = `<span class="text-red-600 font-extrabold text-base md:text-lg">${msg}</span>`;
        errorMessage.classList.remove('hidden');
    }
}

/**
 * --- 3. SESSION ROUTING & ROLE-BASED ACCESS CONTROL (RBAC) ---
 * Evaluates current user session and enforces security rules:
 * - Guests are redirected to login.html if attempting to access private pages.
 * - Logged-in users without a profile are sent to onboarding.html.
 * - Non-student roles (organizers, super_admins) unlock the Admin Portal navigation.
 * - Invalid email domains are forcibly signed out and redirected with an alert.
 */
async function handleRouting(session) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isLoginPage = currentPage === 'login.html';
    const isOnboardingPage = currentPage === 'onboarding.html';

    // Show friendly domain restriction alert if redirected from login guard
    if (isLoginPage) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('error') === 'invalid_domain') {
            showError(`Access restricted. Please log in using your official ${ALLOWED_DOMAIN} college email ID only.`);
        }
    }

    if (session) {
        const email = session.user.email;
        // Verify campus domain
        if (email && email.endsWith(ALLOWED_DOMAIN)) {
            // Check if user has completed onboarding (exists in 'profiles' table)
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('email, role')
                .eq('email', email)
                .maybeSingle();

            // Populate user email into any mobile and desktop indicators across pages
            document.querySelectorAll('#user-email-display, .user-email-display, .user-email-mobile').forEach(el => {
                el.textContent = email;
            });

            if (!profile) {
                // Profile missing: student must fill out initial profile (batch, branch, etc.)
                if (!isOnboardingPage) {
                    window.location.href = 'onboarding.html';
                }
            } else {
                // Unhide admin/organizer navigation links (both desktop and mobile menus)
                if (profile.role !== 'student') {
                    document.querySelectorAll('.admin-link').forEach(el => el.classList.remove('hidden'));
                }

                // If user is already registered and logged in, prevent them from visiting login/onboarding
                if (isLoginPage || isOnboardingPage) {
                    window.location.href = 'index.html';
                }
            }
        } else {
            // Unauthorized domain detected: force logout immediately
            await supabaseClient.auth.signOut();
            if (isLoginPage) {
                showError(`Access restricted. Please log in using your official ${ALLOWED_DOMAIN} college email ID only.`);
            } else {
                window.location.href = 'login.html?error=invalid_domain';
            }
        }
    } else {
        // No active session: redirect to login unless already on the login page
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Check active session on initial page load and route accordingly.
 */
async function checkSessionAndRoute() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    await handleRouting(session);
}

// --- 4. REAL-TIME AUTH STATE LISTENER ---
// Listens for login, token refresh, and logout events across browser tabs
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
        await handleRouting(session);
    } else if (event === 'SIGNED_OUT') {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'login.html') {
            window.location.href = 'login.html';
        }
    }
});

// --- 5. GOOGLE OAUTH LOGIN TRIGGER ---
// Initiates the OAuth flow with Google, enforcing campus account prompt
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: { prompt: 'select_account' }, // Forces account selection popup
                    redirectTo: window.location.origin + '/index.html' // Redirects back to dashboard
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error.message);
            showError('Failed to initiate login. Please try again.');
        }
    });
}

// --- 6. LOGOUT TRIGGER ---
// Signs the user out from Supabase and redirects to login
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
    });
}

// --- 7. UNIVERSAL MOBILE NAVIGATION MENU CONTROLLER ---
// Initializes mobile hamburger menu toggle on any page where the navbar is present
function initMobileNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isClosed = mobileMenu.classList.contains('hidden');
            if (isClosed) {
                mobileMenu.classList.remove('hidden');
                if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
                if (closeIcon) closeIcon.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
                if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            }
        });
    }
}

// Initialize session check & mobile navigation on DOM load
document.addEventListener('DOMContentLoaded', () => {
    checkSessionAndRoute();
    initMobileNavigation();
});

// --- 8. GLOBAL EXPORTS ---
// Expose supabase client and helper utilities to window.app for page scripts
window.app = {
    supabase: supabaseClient,
    ALLOWED_DOMAIN,
    checkSessionAndRoute
};
