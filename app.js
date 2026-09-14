// ==========================================
// CONFIGURATION: Replace these with your actual Supabase details
// ==========================================
const SUPABASE_URL = 'https://buphhnxnjfrjwkagftru.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cGhobnhuamZyandrYWdmdHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDY1OTEsImV4cCI6MjEwNDc4MjU5MX0.qcwPT1hpyPZ4fyvwXrMei-3_EHzdHg-aGhfAecCB_Yc';
const ALLOWED_DOMAIN = '@iiitnr.edu.in';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn'); 

function showError(msg) {
    if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }
}

async function handleRouting(session) {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === 'login.html';
    const isOnboardingPage = currentPage === 'onboarding.html';

    if (session) {
        const email = session.user.email;
        if (email && email.endsWith(ALLOWED_DOMAIN)) {
            // 1. Check if user has completed onboarding (exists in profiles table)
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('email, role')
                .eq('email', email)
                .maybeSingle();

            if (!profile) {
                // 2. Profile missing -> redirect to onboarding
                if (!isOnboardingPage) {
                    window.location.href = 'onboarding.html';
                }
            } else {
                // Unhide admin navigation links if they have privileges
                if (profile.role !== 'student') {
                    document.querySelectorAll('.admin-link').forEach(el => el.classList.remove('hidden'));
                }

                // 3. Profile exists -> block access to login and onboarding pages
                if (isLoginPage || isOnboardingPage) {
                    window.location.href = 'index.html';
                }
            }
        } else {
            // Invalid domain
            await supabaseClient.auth.signOut();
            if (isLoginPage) {
                showError(`Access restricted. Please use your ${ALLOWED_DOMAIN} email address.`);
            } else {
                window.location.href = 'login.html';
            }
        }
    } else {
        // No session -> redirect to login if not already there
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    }
}

async function checkSessionAndRoute() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    await handleRouting(session);
}

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

// Setup Login Button Listener
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: { prompt: 'select_account' },
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

// Setup Logout Button Listener
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
    });
}

// Run the session check when the script loads
document.addEventListener('DOMContentLoaded', checkSessionAndRoute);

window.app = {
    supabase: supabaseClient,
    ALLOWED_DOMAIN,
    checkSessionAndRoute
};
