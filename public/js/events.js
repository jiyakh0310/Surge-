// public/js/events.js
let allEvents = [];

async function fetchEvents() {
  const grid = document.getElementById("events-grid");

  try {
    const res = await fetch("/api/events");
    const result = await res.json().catch(() => ([]));
    const events = Array.isArray(result) ? result : (result.events || result.data || []);
    allEvents = Array.isArray(events) ? events : [];

    // normalize to array always
    if (!Array.isArray(allEvents)) allEvents = [];

    renderEvents(allEvents);
  } catch (err) {
    grid.innerHTML = `<p>Error loading events: ${err.message}</p>`;
  }
}

function getEventId(event) {
  return event.event_id || event.id || "";
}

function getEventName(event) {
  return event.event_name || event.title || "Untitled Event";
}

function renderEvents(events) {
  const grid = document.getElementById("events-grid");

  if (!events || events.length === 0) {
    grid.innerHTML = `
      <div class="glass-card empty-state-card" style="grid-column: 1/-1; text-align:center;">
        <h3 style="margin-bottom:0.5rem;">No events found</h3>
        <p style="color:var(--text-dim); margin-bottom:1.25rem;">Try refreshing to load the latest schedule.</p>
        <button class="btn btn-outline" id="refresh-events-btn" type="button">Refresh Events</button>
      </div>
    `;
    const refreshBtn = document.getElementById("refresh-events-btn");
    if (refreshBtn) refreshBtn.addEventListener("click", fetchEvents);
    return;
  }

  grid.innerHTML = events.map(event => {
    const eventId = getEventId(event);
    const eventName = getEventName(event);
    const clubName = event.club_name || "General";
    const clubLogo = event.club_logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((clubName || "C").charAt(0))}&background=18223b&color=4ce5f1&size=48&rounded=true`;
    const venueName = event.venue_name || "TBA";

    return `
      <div class="glass-card event-card animate">
        <div class="card-content">
          <div class="club-tag">
            <img src="${clubLogo}" alt="" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=C&background=18223b&color=4ce5f1&size=48&rounded=true'">
            <span>${clubName}</span>
          </div>

          <h3>${eventName}</h3>

          <p style="color:var(--text-gray); margin-bottom:1.5rem; font-size:0.95rem;">
            ${
              event.description && event.description.length > 100
                ? event.description.substring(0, 100) + "..."
                : (event.description || "No description available")
            }
          </p>

          <div class="meta">
            <span>📅 ${
              event.event_date
                ? new Date(event.event_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })
                : "Date TBA"
            }</span>
            <span>📍 ${venueName}</span>
          </div>
        </div>

        <a href="register.html?event_id=${encodeURIComponent(eventId)}" class="btn btn-primary">
          Register Now
        </a>
      </div>
    `;
  }).join("");
}

const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    const filteredEvents = allEvents.filter(event => {
      const eventName = getEventName(event).toLowerCase();
      const clubName = (event.club_name || "").toLowerCase();

      return eventName.includes(searchTerm) || clubName.includes(searchTerm);
    });

    renderEvents(filteredEvents);
  });
}

fetchEvents();