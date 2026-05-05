// public/js/clubs.js
let allClubs = [];
let myClubIds = [];
let currentUser = null;
let clubsSearchTerm = '';

function fallbackClubLogo(name) {
    const n = encodeURIComponent((name || 'Club').slice(0, 24));
    return `https://ui-avatars.com/api/?name=${n}&background=18223b&color=4ce5f1&size=128&rounded=true`;
}

document.addEventListener('DOMContentLoaded', () => {
    currentUser = auth.requireLogin();
    if (!currentUser) return;

    const isOrganizer = currentUser.role === 'organizer';

    if (isOrganizer) {
        document.getElementById('add-club-section').innerHTML =
            '<button class="btn btn-primary" onclick="openClubModal(false)">Add Club</button>';
    } else {
        document.getElementById('join-info').textContent =
            'You can join up to 3 clubs. Select the ones that interest you!';
    }

    const searchEl = document.getElementById('clubs-search');
    if (searchEl) {
        searchEl.addEventListener('input', (e) => {
            clubsSearchTerm = (e.target.value || '').toLowerCase().trim();
            renderClubs();
        });
    }

    loadClubs();
});

async function loadClubs() {
    const isOrganizer = currentUser && currentUser.role === 'organizer';

    try {
        const res = await fetch('/api/clubs');
        allClubs = await res.json();
        allClubs = Array.isArray(allClubs) ? allClubs : [];

        if (!isOrganizer && currentUser) {
            const myRes = await fetch(`/api/clubs/my/${currentUser.user_id}`);
            const myClubs = await myRes.json();
            myClubIds = Array.isArray(myClubs) ? myClubs.map((c) => Number(c.club_id)) : [];
        }

        renderClubs();
    } catch (err) {
        console.error('Error loading clubs:', err);
    }
}

function getFilteredClubs() {
    if (!clubsSearchTerm) return allClubs;
    return allClubs.filter((club) => {
        const name = (club.club_name || club.name || '').toLowerCase();
        return name.includes(clubsSearchTerm);
    });
}

function renderClubs() {
    const grid = document.getElementById('clubs-grid');
    const isOrganizer = currentUser && currentUser.role === 'organizer';
    const list = getFilteredClubs();

    if (allClubs.length === 0) {
        grid.innerHTML =
            '<div class="glass-card" style="grid-column:1/-1; text-align:center;"><p style="color:var(--text-dim);">No clubs yet.</p></div>';
        return;
    }

    if (list.length === 0) {
        grid.innerHTML =
            '<div class="glass-card" style="grid-column:1/-1; text-align:center;"><p style="color:var(--text-dim);">No clubs match your search.</p></div>';
        return;
    }

    grid.innerHTML = list
        .map((club) => {
            const cid = Number(club.club_id || club.id);
            const cname = club.club_name || club.name || 'Unnamed Club';
            const desc = club.description || 'No description available.';
            const logo =
                club.logo_url && String(club.logo_url).trim()
                    ? club.logo_url.trim()
                    : fallbackClubLogo(cname);
            const isJoined = myClubIds.includes(Number(cid));
            const atLimit = myClubIds.length >= 3;

            let participantBlock = '';
            if (!isOrganizer) {
                if (isJoined) {
                    participantBlock = `
                    <span class="joined-badge" title="Joined">✓ Joined</span>
                    <button type="button" class="btn btn-outline join-btn" style="margin-top: 0.5rem; border-color: var(--accent-pink); color: var(--accent-pink);" onclick="leaveClub(${cid})" title="Leave this club">Leave</button>`;
                } else if (!atLimit) {
                    participantBlock = `<button type="button" class="btn btn-primary join-btn" onclick="joinClub(${cid})" title="Join this club">Join Club</button>`;
                } else {
                    participantBlock = `<button type="button" class="btn btn-outline join-btn" disabled style="opacity:0.45; cursor:not-allowed;" title="You can join up to 3 clubs only.">Limit reached</button>`;
                }
            }

            const orgActions = isOrganizer
                ? `<div class="card-actions" role="toolbar">
                    <button type="button" class="action-icon" title="Edit" aria-label="Edit" onclick="beginEditClub(${cid})">✏️</button>
                    <button type="button" class="action-icon delete" title="Delete" aria-label="Delete" onclick="deleteClub(${cid})">🗑️</button>
                </div>`
                : '';

            return `
            <div class="glass-card club-card">
                ${orgActions}
                <img src="${escapeAttr(logo)}" alt="" class="club-logo" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=Club&background=18223b&color=4ce5f1&size=128&rounded=true'">
                <h3>${escapeHtml(cname)}</h3>
                <p>${escapeHtml(desc)}</p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%; margin-top: auto;">
                    ${participantBlock}
                </div>
            </div>`;
        })
        .join('');
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function escapeAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function beginEditClub(id) {
    const club = allClubs.find((c) => Number(c.club_id || c.id) === Number(id));
    if (!club) return;
    document.getElementById('edit_id').value = String(id);
    document.getElementById('club_name').value = club.club_name || club.name || '';
    document.getElementById('club_description').value = club.description || '';
    document.getElementById('club_logo_url').value = club.logo_url || '';
    openClubModal(true);
}

function openClubModal(isEdit) {
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Club' : 'Add Club';
    document.getElementById('modal-submit-btn').textContent = isEdit ? 'Update Club' : 'Save Club';
    if (!isEdit) {
        document.getElementById('club-form').reset();
        document.getElementById('edit_id').value = '';
    }
    document.getElementById('club-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('club-modal').style.display = 'none';
}

document.getElementById('club-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('club-msg');
    const editId = document.getElementById('edit_id').value;
    const data = {
        name: document.getElementById('club_name').value,
        description: document.getElementById('club_description').value,
        logo_url: document.getElementById('club_logo_url').value,
    };

    const url = editId ? `/api/clubs/${editId}` : '/api/clubs';
    const method = editId ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            closeModal();
            document.getElementById('club-form').reset();
            document.getElementById('edit_id').value = '';
            await loadClubs();
            msg.style.color = 'var(--accent-cyan)';
            msg.textContent = editId ? 'Club updated successfully.' : 'Club created successfully.';
            setTimeout(() => {
                msg.textContent = '';
            }, 3000);
        } else {
            const err = await res.json().catch(() => ({}));
            msg.style.color = 'var(--accent-pink)';
            msg.textContent = `Error: ${err.error || 'Unable to save club.'}`;
        }
    } catch (_err) {
        msg.style.color = 'var(--accent-pink)';
        msg.textContent = 'Error saving club.';
    }
});

async function deleteClub(id) {
    if (!confirm('Are you sure you want to delete this club?')) return;
    try {
        const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadClubs();
            const msg = document.getElementById('club-msg');
            msg.style.color = 'var(--accent-cyan)';
            msg.textContent = 'Club deleted successfully.';
            setTimeout(() => {
                msg.textContent = '';
            }, 3000);
        }
    } catch (_err) {
        alert('Error deleting club');
    }
}

async function joinClub(clubId) {
    const msg = document.getElementById('club-msg');
    if (myClubIds.length >= 3) {
        msg.style.color = 'var(--accent-pink)';
        msg.textContent = 'You can join up to 3 clubs only.';
        return;
    }
    try {
        const res = await fetch('/api/clubs/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.user_id, club_id: clubId }),
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok) {
            msg.style.color = 'var(--accent-cyan)';
            msg.textContent = 'Joined club successfully!';
            setTimeout(() => {
                msg.textContent = '';
            }, 3000);
            await loadClubs();
        } else {
            msg.style.color = 'var(--accent-pink)';
            msg.textContent = result.error || 'Unable to join club.';
        }
    } catch (_err) {
        msg.style.color = 'var(--accent-pink)';
        msg.textContent = 'Error joining club.';
    }
}

async function leaveClub(clubId) {
    const msg = document.getElementById('club-msg');
    try {
        const res = await fetch(`/api/clubs/leave/${currentUser.user_id}/${clubId}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            msg.style.color = 'var(--accent-cyan)';
            msg.textContent = 'Left club successfully.';
            setTimeout(() => {
                msg.textContent = '';
            }, 3000);
            await loadClubs();
        } else {
            msg.style.color = 'var(--accent-pink)';
            msg.textContent = 'Error leaving club.';
        }
    } catch (_err) {
        msg.style.color = 'var(--accent-pink)';
        msg.textContent = 'Error leaving club.';
    }
}
