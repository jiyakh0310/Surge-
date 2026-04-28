// public/js/register.js
document.addEventListener('DOMContentLoaded', async () => {
    const eventSelect = document.getElementById('event-select');
    const params = new URLSearchParams(window.location.search);
    const urlEventId = params.get('event_id');

    // Load Events into Dropdown
    try {
        const res = await fetch('/api/events');
        const result = await res.json();
        const events = Array.isArray(result) ? result : (result.events || result.data || []);
        const safeEvents = Array.isArray(events) ? events : [];

        eventSelect.innerHTML = '<option value="" disabled>Select an event</option>' +
            safeEvents.map((e) => {
                const eventId = e.event_id || e.id || '';
                const eventName = e.event_name || e.title || 'Untitled Event';
                return `<option value="${eventId}" ${urlEventId == eventId ? 'selected' : ''}>${eventName}</option>`;
            }).join('');
        
        if (!urlEventId) {
            eventSelect.value = "";
        }
    } catch (err) {
        eventSelect.innerHTML = '<option disabled>Error loading events</option>';
    }

    // Handle Form Submission
    document.getElementById('reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('msg');
        const btn = document.getElementById('submit-btn');
        
        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            college: document.getElementById('college').value,
            event_id: document.getElementById('event-select').value
        };

        if (!data.event_id) {
            msg.style.color = 'var(--accent-pink)';
            msg.innerText = 'Please select an event.';
            return;
        }

        btn.disabled = true;
        btn.innerText = 'Processing...';

        try {
            const res = await fetch('/api/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                msg.style.color = '#4ce5f1';
                msg.innerText = 'Registration Successful! We look forward to seeing you.';
                document.getElementById('reg-form').reset();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            msg.style.color = '#f783ac';
            msg.innerText = 'Error: ' + err.message;
        } finally {
            btn.disabled = false;
            btn.innerText = 'Complete Registration';
        }
    });
});
