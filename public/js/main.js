// public/js/main.js
function getCurrentUser() {
    try {
        const raw = localStorage.getItem('surge_user');
        return raw ? JSON.parse(raw) : null;
    } catch (_err) {
        return null;
    }
}

function buildNavbar() {
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const user = getCurrentUser();
    const isOrganizer = Boolean(user && user.role === 'organizer');
    const isParticipant = Boolean(user && user.role === 'participant');
    const isProfilePage = (window.location.pathname.split('/').pop() || 'index.html') === 'profile.html';

    if (isOrganizer) {
        navUl.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="events.html">Events</a></li>
            <li><a href="clubs.html">Clubs</a></li>
            <li><a href="dashboard.html">Dashboard</a></li>
            <li><a href="manage-venues.html">Venues</a></li>
            <li><a href="manage-sponsors.html">Sponsors</a></li>
            <li><a href="manage-budget.html">Budget</a></li>
            <li><a href="manage-goodies.html">Goodies</a></li>
            <li><a href="reports.html">Reports</a></li>
            <li><a href="profile.html">Profile</a></li>
        `;
        return;
    }

    if (isParticipant) {
        navUl.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="events.html">Events</a></li>
            <li><a href="clubs.html">Clubs</a></li>
            <li><a href="profile.html">Profile</a></li>
        `;
        return;
    }

    navUl.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="events.html">Events</a></li>
        <li><a href="clubs.html">Clubs</a></li>
        ${isProfilePage ? `<li><a href="profile.html">Profile</a></li>` : `<li><a href="login.html">Login</a></li>`}
    `;
}

function setupHomeHeroHeader() {
    const authLink = document.getElementById('home-auth-link');
    const ctaAuthLink = document.getElementById('home-cta-auth-link');
    if (!authLink && !ctaAuthLink) return;
    const user = getCurrentUser();
    if (user) {
        if (authLink) {
            authLink.href = 'profile.html';
            authLink.textContent = 'Profile';
        }
        if (ctaAuthLink) {
            ctaAuthLink.href = 'profile.html';
            ctaAuthLink.textContent = 'Profile';
        }
        return;
    }
    if (authLink) {
        authLink.href = 'login.html';
        authLink.textContent = 'Login';
    }
    if (ctaAuthLink) {
        ctaAuthLink.href = 'login.html';
        ctaAuthLink.textContent = 'Login';
    }
}

function renderHomeModules() {
    const modules = document.getElementById('modules-grid');
    if (!modules) return;
    const user = getCurrentUser();

    if (!user) {
        modules.innerHTML = `
            <a href="events.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Events</a>
            <a href="clubs.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Clubs</a>
            <a href="login.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Login</a>
            <a href="register.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Register for Event</a>
        `;
        return;
    }

    if (user.role === 'organizer') {
        modules.innerHTML = `
            <a href="events.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Events</a>
            <a href="clubs.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Clubs</a>
            <a href="dashboard.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Dashboard</a>
            <a href="manage-venues.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Venues</a>
            <a href="manage-sponsors.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Sponsors</a>
            <a href="manage-budget.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Budget</a>
            <a href="manage-goodies.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Goodies</a>
            <a href="reports.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Reports</a>
            <a href="profile.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Profile</a>
        `;
        return;
    }

    modules.innerHTML = `
        <a href="events.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Events</a>
        <a href="clubs.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">Clubs</a>
        <a href="profile.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">My Profile</a>
        <a href="profile.html" class="glass-card module-card" style="padding: 1.5rem; text-decoration: none; color: inherit;">My Registrations</a>
    `;
}

function setActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === current || (current === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    buildNavbar();
    setActiveNav();
    setupHomeHeroHeader();
    renderHomeModules();
});
