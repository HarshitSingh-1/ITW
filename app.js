// ==========================================
// CONFIGURATION: Replace these with your actual Supabase details
// ==========================================
const SUPABASE_URL = 'https://buphhnxnjfrjwkagftru.supabase.co'; // Removed /rest/v1/ - it should just be the base URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cGhobnhuamZyandrYWdmdHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDY1OTEsImV4cCI6MjEwNDc4MjU5MX0.qcwPT1hpyPZ4fyvwXrMei-3_EHzdHg-aGhfAecCB_Yc';
const ALLOWED_DOMAIN = '@iiitnr.edu.in';

// Initialize Supabase Client
// We use 'supabaseClient' instead of 'supabase' because the CDN already reserves the word 'supabase' globally!
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn'); // Will be used in other pages

/**
 * Utility to display errors on the login page
 */
function showError(msg) {
    if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }
}

/**
 * Handle initial session check to route user properly
 */
async function checkSessionAndRoute() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === 'login.html';

    if (session) {
        const email = session.user.email;
        // Verify domain
        if (email && email.endsWith(ALLOWED_DOMAIN)) {
            if (isLoginPage) {
                // Logged in user on login page -> Redirect to index (feed)
                window.location.href = 'index.html';
            }
        } else {
            // Invalid domain, sign them out immediately
            await supabaseClient.auth.signOut();
            if (isLoginPage) {
                showError(`Access restricted. Please use your ${ALLOWED_DOMAIN} email address.`);
            } else {
                window.location.href = 'login.html';
            }
        }
    } else {
        // No session
        if (!isLoginPage) {
            // Not on login page -> Redirect to login
            window.location.href = 'login.html';
        }
    }
}

// Listen for Auth state changes (Login, Logout, Token Refresh)
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === 'login.html';

    if (event === 'SIGNED_IN' && session) {
        const email = session.user.email;
        if (email && email.endsWith(ALLOWED_DOMAIN)) {
            if (isLoginPage) {
                window.location.href = 'index.html';
            }
        } else {
            // Sign out unauthorized domains
            supabaseClient.auth.signOut().then(() => {
                if (isLoginPage) {
                    showError(`Access denied. Only ${ALLOWED_DOMAIN} emails are allowed.`);
                }
            });
        }
    } else if (event === 'SIGNED_OUT') {
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// Setup Login Button Listener
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            // Initiate OAuth sign-in via Google
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        prompt: 'select_account' // Forces account selection screen
                    },
                    // Redirect back to the index page after OAuth flow
                    redirectTo: window.location.origin + '/index.html'
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Error logging in:', error.message);
            showError('Failed to initiate login. Please try again.');
        }
    });
}

// Setup Logout Button Listener (For index.html, wallet.html, etc.)
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
    });
}

// Run the session check when the script loads
document.addEventListener('DOMContentLoaded', checkSessionAndRoute);

// Expose supabase and utility functions globally for use in page-specific scripts
window.app = {
    supabase: supabaseClient,
    ALLOWED_DOMAIN,
    checkSessionAndRoute
};
