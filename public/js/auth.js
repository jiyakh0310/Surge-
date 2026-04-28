/**
 * SURGE Authentication & Authorization Helper
 */

const auth = {
    // Get logged in user from localStorage
    getUser: () => {
        const user = localStorage.getItem('surge_user');
        return user ? JSON.parse(user) : null;
    },

    // Save user to localStorage
    setUser: (user) => {
        localStorage.setItem('surge_user', JSON.stringify(user));
    },

    // Logout
    logout: () => {
        localStorage.removeItem('surge_user');
        window.location.href = '/login.html';
    },

    // Check if user is logged in
    requireLogin: () => {
        const user = auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return false;
        }
        return user;
    },

    // Check if user is organizer
    requireOrganizer: () => {
        const user = auth.requireLogin();
        if (user && user.role !== 'organizer') {
            alert('Access Denied: Organizers only.');
            window.location.href = '/profile.html';
            return false;
        }
        return user;
    }
};
