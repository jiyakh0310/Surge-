// public/js/dashboard.js
async function loadDashboard() {
    const safeText = (value, fallback = 'No data') => {
        if (value === null || value === undefined || value === '') return fallback;
        return String(value);
    };

    const safeMoney = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? `$${num.toLocaleString()}` : '$0';
    };

    try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        const recentRegistrations = Array.isArray(data.recentRegistrations) ? data.recentRegistrations : [];
        const upcomingEvents = Array.isArray(data.upcomingEvents) ? data.upcomingEvents : [];

        // Update Stats
        document.getElementById('stat-events').innerText = safeText(data.totalEvents, '0');
        document.getElementById('stat-participants').innerText = safeText(data.totalParticipants, '0');
        document.getElementById('stat-funding').innerText = safeMoney(data.totalFunding);
        document.getElementById('stat-budget').innerText = safeMoney(data.totalBudget);
        document.getElementById('stat-remaining').innerText = safeMoney(data.totalRemainingBudget);

        // Render Recent Registrations
        const registrationTable = document.getElementById('recent-registrations');
        if (recentRegistrations.length === 0) {
            registrationTable.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-dim);">No recent activity.</td></tr>';
        } else {
            registrationTable.innerHTML = recentRegistrations.map(r => `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${safeText(r.name)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-dim);">${safeText(r.email)}</div>
                    </td>
                    <td style="color: var(--accent-cyan);">${safeText(r.event_name || r.title, 'Not assigned')}</td>
                    <td style="font-size: 0.85rem;">${r.registration_date ? new Date(r.registration_date).toLocaleDateString() : 'No data'}</td>
                </tr>
            `).join('');
        }

        // Render Upcoming Events
        const upcomingList = document.getElementById('upcoming-events');
        if (upcomingEvents.length === 0) {
            upcomingList.innerHTML = '<p style="color: var(--text-dim);">No upcoming events.</p>';
        } else {
            upcomingList.innerHTML = upcomingEvents.map(e => `
                <div style="padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border);">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${safeText(e.event_name || e.title)}</div>
                    <div style="font-size: 0.8rem; color: var(--accent-lavender);">${e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not assigned'}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
