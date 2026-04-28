// public/js/reports.js
async function loadReports() {
    try {
        // 1. Attendance Report
        const resAtt = await fetch('/api/reports/event-attendance');
        const dataAtt = await resAtt.json();
        const attContainer = document.getElementById('attendance-report');
        attContainer.innerHTML = dataAtt.map(item => `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span>${item.title}</span>
                    <span style="color: var(--accent-cyan);">${item.attendance}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${Math.min(item.attendance * 10, 100)}%;"></div>
                </div>
            </div>
        `).join('');

        // 2. Financial Report
        const resFin = await fetch('/api/reports/financial-summary');
        const dataFin = await resFin.json();
        const finTable = document.getElementById('financial-report');
        finTable.innerHTML = dataFin.map(item => `
            <tr>
                <td>${item.title}</td>
                <td>$${item.budget_allocated.toLocaleString()}</td>
                <td style="color: ${item.total_sponsorship >= item.budget_allocated ? '#4ce5f1' : '#f783ac'};">
                    $${item.total_sponsorship.toLocaleString()}
                </td>
            </tr>
        `).join('');

        // 3. Club Activity
        const resClub = await fetch('/api/reports/club-activity');
        const dataClub = await resClub.json();
        const clubContainer = document.getElementById('club-report');
        clubContainer.innerHTML = dataClub.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
                <span>${item.club_name}</span>
                <span style="font-weight: 700; color: var(--accent-pink);">${item.event_count} Events</span>
            </div>
        `).join('');

        // 4. Venue Usage
        const resVenue = await fetch('/api/reports/venue-usage');
        const dataVenue = await resVenue.json();
        const venueContainer = document.getElementById('venue-report');
        venueContainer.innerHTML = dataVenue.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
                <span>${item.venue_name}</span>
                <span style="font-weight: 700; color: var(--accent-cyan);">${item.events_hosted}</span>
            </div>
        `).join('');

    } catch (err) {
        console.error('Reports error:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadReports);
