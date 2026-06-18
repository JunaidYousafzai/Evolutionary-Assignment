// ============================================
// TIMETABLE PSO — PREMIUM FRONTEND SYSTEM
// ============================================
const API = '';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const PAGE = document.body.dataset.page;
let fitnessChart; 
let activeModal = null;

// ============================================
// 3D CARD TILT SYSTEM (Premium Hover)
// ============================================
function init3DCards() {
    document.querySelectorAll('.card-3d').forEach(card => {
        const shine = card.querySelector('.card-3d-shine');
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            const tiltX = (y - 0.5) * -15; // Subtle tilt
            const tiltY = (x - 0.5) * 15;
            gsap.to(card, {
                rotateX: tiltX, rotateY: tiltY, scale: 1.02,
                duration: 0.4, ease: 'power2.out',
                transformPerspective: 1000, transformOrigin: 'center',
            });
            if (shine) {
                shine.style.opacity = '1';
                shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.1), transparent 60%)`;
            }
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
            if (shine) shine.style.opacity = '0';
        });
    });
}

// ============================================
// NAV EFFECT
// ============================================
function initNav() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
}

// ============================================
// CINEMATIC HERO ANIMATIONS
// ============================================
function initHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    // Staggered reveal
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1 }, 0.2)
      .to('.hero-h1 .line-in', { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }, 0.3)
      .fromTo('.hero-p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.8)
      .fromTo('.hero-btns', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 1.0);

    // Parallax Orbs
    gsap.to('.orb-a', { y: -200, scale: 1.1, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: 2 } });
    gsap.to('.orb-b', { y: 150, scale: 1.1, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: 1.5 } });
    gsap.to('.orb-c', { y: -300, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: 3 } });
}

function initPageHero() {
    gsap.from('.page-hero .sec-label', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.page-title', { y: 30, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    gsap.from('.page-hero .sec-p', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
    gsap.from('.upload-zone-wrapper', { y: 40, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
}

// ============================================
// SCROLL REVEALS
// ============================================
function initScrollReveals() {
    const scrollEls = gsap.utils.toArray('[data-scroll]');

    scrollEls.forEach((el) => {
        const direction = el.dataset.scroll || 'up';
        const fromVars = { opacity: 0, duration: 1, ease: 'power3.out' };

        if (direction === 'left') { fromVars.x = -60; }
        else if (direction === 'right') { fromVars.x = 60; }
        else if (direction === 'scale') { fromVars.scale = 0.85; }
        else { fromVars.y = 60; }

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out' })
        });
    });
}

// ============================================
// MODAL MANAGER
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    activeModal = modal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('active');
    activeModal = null;
    document.body.style.overflow = ''; // Unlock scroll
}

// Handle ESC and click outside
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeModal) closeModal();
});
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
});

// ============================================
// COUNT UP UTILITY
// ============================================
function countUp(el, target, dur = 1, dec = false) {
    if (!el) return;
    const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: dur, ease: 'power2.out',
        onUpdate: () => { el.textContent = dec ? obj.v.toFixed(4) : Math.round(obj.v); } });
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => gsap.to(t, { opacity: 0, x: 50, duration: 0.2, onComplete: () => t.remove() }));
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    gsap.to(t, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' });
    gsap.to(t, { opacity: 0, y: 10, duration: 0.3, delay: 3, ease: 'power2.in', onComplete: () => t.remove() });
}

// ============================================
// DASHBOARD DATA LOADERS (CRUD)
// ============================================
async function loadStats() {
    try {
        const [c, t, r, s] = await Promise.all([
            fetch(`${API}/api/courses`).then(r => r.json()),
            fetch(`${API}/api/teachers`).then(r => r.json()),
            fetch(`${API}/api/rooms`).then(r => r.json()),
            fetch(`${API}/api/timeslots`).then(r => r.json()),
        ]);
        countUp(document.getElementById('statCourses'), c.length);
        countUp(document.getElementById('statTeachers'), t.length);
        countUp(document.getElementById('statRooms'), r.length);
        countUp(document.getElementById('statTimeslots'), s.length);
    } catch (e) {}
}

async function loadCourses() {
    const data = await fetch(`${API}/api/courses`).then(r => r.json());
    const cc = document.getElementById('courseCount'); if (cc) cc.textContent = data.length;
    const list = document.getElementById('courseList'); if (!list) return;
    if (!data.length) { list.innerHTML = '<div style="color:var(--t3); padding: 10px;">No courses registered.</div>'; return; }
    list.innerHTML = data.map(c => `
        <div class="list-item">
            <div class="list-item-main">
                <div class="list-file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                </div>
                <div class="list-item-info">
                    <span class="list-item-name">${c.name}</span>
                    <span class="list-item-meta">${c.code} · ${c.credit_hours} cr</span>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteCourse(${c.id},this)">✕</button>
        </div>
    `).join('');
}
async function addCourse(e) {
    e.preventDefault();
    const n = document.getElementById('courseName').value.trim(), c = document.getElementById('courseCode').value.trim(), cr = document.getElementById('courseCredits').value;
    await fetch(`${API}/api/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, code: c, credit_hours: parseInt(cr), fileUrl: '' }) });
    e.target.reset(); loadCourses(); loadStats(); closeModal(); showToast('Course successfully created.');
}
async function deleteCourse(id, btn) { 
    gsap.to(btn.closest('.list-item'), {opacity:0, scale:0.9, duration:0.3, onComplete: async () => {
        await fetch(`${API}/api/courses/${id}`, { method: 'DELETE' }); loadCourses(); loadStats(); showToast('Course removed.', 'error');
    }});
}

async function loadTeachers() {
    const data = await fetch(`${API}/api/teachers`).then(r => r.json());
    const cc = document.getElementById('teacherCount'); if (cc) cc.textContent = data.length;
    const list = document.getElementById('teacherList'); if (!list) return;
    if (!data.length) { list.innerHTML = '<div style="color:var(--t3); padding: 10px;">No faculty registered.</div>'; return; }
    list.innerHTML = data.map(t => {
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random&color=fff&size=128`;
        return `
        <div class="list-item">
            <div class="list-item-main">
                <img src="${avatar}" class="list-avatar">
                <div class="list-item-info">
                    <span class="list-item-name">${t.name}</span>
                    <span class="list-item-meta">${t.department || 'General'}</span>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteTeacher(${t.id},this)">✕</button>
        </div>`;
    }).join('');
}
async function addTeacher(e) {
    e.preventDefault();
    const n = document.getElementById('teacherName').value.trim(), d = document.getElementById('teacherDept').value.trim();
    await fetch(`${API}/api/teachers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, department: d, imageUrl: '' }) });
    e.target.reset(); loadTeachers(); loadStats(); closeModal(); showToast('Faculty member added.');
}
async function deleteTeacher(id, btn) { 
    gsap.to(btn.closest('.list-item'), {opacity:0, scale:0.9, duration:0.3, onComplete: async () => {
        await fetch(`${API}/api/teachers/${id}`, { method: 'DELETE' }); loadTeachers(); loadStats(); showToast('Faculty removed.', 'error');
    }});
}

async function loadRooms() {
    const data = await fetch(`${API}/api/rooms`).then(r => r.json());
    const cc = document.getElementById('roomCount'); if (cc) cc.textContent = data.length;
    const list = document.getElementById('roomList'); if (!list) return;
    if (!data.length) { list.innerHTML = '<div style="color:var(--t3); padding: 10px;">No rooms registered.</div>'; return; }
    list.innerHTML = data.map(r => `
        <div class="list-item">
            <div class="list-item-info">
                <span class="list-item-name">${r.name}</span>
                <span class="list-item-meta">Capacity: ${r.capacity}</span>
            </div>
            <button class="btn-delete" onclick="deleteRoom(${r.id},this)">✕</button>
        </div>`).join('');
}
async function addRoom(e) {
    e.preventDefault();
    const n = document.getElementById('roomName').value.trim(), c = document.getElementById('roomCapacity').value;
    await fetch(`${API}/api/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, capacity: parseInt(c) }) });
    e.target.reset(); loadRooms(); loadStats(); closeModal(); showToast('Room registered.');
}
async function deleteRoom(id, btn) { 
    gsap.to(btn.closest('.list-item'), {opacity:0, scale:0.9, duration:0.3, onComplete: async () => {
        await fetch(`${API}/api/rooms/${id}`, { method: 'DELETE' }); loadRooms(); loadStats(); showToast('Room removed.', 'error');
    }});
}

async function loadTimeslots() {
    const data = await fetch(`${API}/api/timeslots`).then(r => r.json());
    const cc = document.getElementById('timeslotCount'); if (cc) cc.textContent = data.length;
    const list = document.getElementById('timeslotList'); if (!list) return;
    if (!data.length) { list.innerHTML = '<div style="color:var(--t3); padding: 10px;">No time slots.</div>'; return; }
    list.innerHTML = data.map(s => `
        <div class="list-item">
            <div class="list-item-info">
                <span class="list-item-name">${s.day}</span>
                <span class="list-item-meta">${s.start_time} - ${s.end_time}</span>
            </div>
            <button class="btn-delete" onclick="deleteTimeslot(${s.id},this)">✕</button>
        </div>`).join('');
}
async function addTimeslot(e) {
    e.preventDefault();
    const d = document.getElementById('slotDay').value, s = document.getElementById('slotStart').value, en = document.getElementById('slotEnd').value;
    await fetch(`${API}/api/timeslots`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day: d, start_time: s, end_time: en }) });
    e.target.reset(); loadTimeslots(); loadStats(); closeModal(); showToast('Time slot added.');
}
async function deleteTimeslot(id, btn) { 
    gsap.to(btn.closest('.list-item'), {opacity:0, scale:0.9, duration:0.3, onComplete: async () => {
        await fetch(`${API}/api/timeslots/${id}`, { method: 'DELETE' }); loadTimeslots(); loadStats(); showToast('Slot removed.', 'error');
    }});
}

// ============================================
// GENERATE & RESULTS
// ============================================
async function generateTimetable() {
    const btn = document.getElementById('btnGenerate');
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    
    btn.disabled = true;
    gsap.to(text, { opacity: 0, duration: 0.3, onComplete: () => { text.style.display = 'none'; } });
    loader.style.display = 'block';
    gsap.fromTo(loader, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.3 });
    
    try {
        const res = await fetch(`${API}/api/generate`, { method: 'POST' });
        if (!res.ok) throw new Error((await res.json()).error || 'Engine Failure');
        displayResults(await res.json());
        showToast('Swarm Converged! Timetable Optimized.', 'success');
    } catch (err) { 
        showToast(err.message, 'error'); 
    } finally {
        gsap.to(loader, { opacity: 0, duration: 0.3, onComplete: () => {
            loader.style.display = 'none';
            text.style.display = 'block';
            gsap.to(text, { opacity: 1, duration: 0.3 });
            btn.disabled = false;
        }});
    }
}

function displayResults(data) {
    const sec = document.getElementById('resultsSection');
    sec.style.display = 'block';
    gsap.to(window, { scrollTo: { y: sec, offsetY: 80 }, duration: 1.2, ease: 'power3.inOut' });

    // Update Stats
    const cc = document.getElementById('clashCard');
    if (data.optimized.clashes === 0) {
        cc.style.borderColor = 'var(--emerald)';
        cc.querySelector('.rstat-icon').style.color = 'var(--emerald)';
        cc.querySelector('.rstat-icon').style.background = 'rgba(16,185,129,0.1)';
        document.getElementById('resultStatus').textContent = 'Stable';
        document.getElementById('resultStatus').style.color = 'var(--emerald)';
    } else {
        cc.style.borderColor = 'var(--red)';
        document.getElementById('resultStatus').textContent = 'Unstable';
        document.getElementById('resultStatus').style.color = 'var(--red)';
    }

    // Modern Grid populate (Master output)
    populateModernGrid('optimizedTableBody', data.optimized.timetable);
    drawFitnessChart(data.optimized.fitnessHistory);
    renderCalendarGrid(data.optimized.timetable);

    // Populate Comparison Grid
    document.getElementById('randomFitness').textContent = data.random.fitness.toFixed(4);
    document.getElementById('randomClashes').textContent = data.random.clashes;
    populateMiniList('randomTableBody', data.random.timetable);

    document.getElementById('optimizedFitness').textContent = data.optimized.fitness.toFixed(4);
    document.getElementById('optimizedClashes').textContent = data.optimized.clashes;
    populateMiniList('optimizedMiniBody', data.optimized.timetable);

    // Stagger in elements
    gsap.fromTo('.result-stat-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo('.chart-wrap', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.6 });
    gsap.fromTo('.comparison-card, .schedule-grid-modern', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.8, onComplete: () => { ScrollTrigger.refresh(); } });
    
    countUp(document.getElementById('resultClashes'), data.optimized.clashes, 1.5);
    countUp(document.getElementById('resultFitness'), data.optimized.fitness, 2, true);
    countUp(document.getElementById('resultGenerations'), data.optimized.generations, 1.8);
}

function populateMiniList(id, tt) {
    const container = document.getElementById(id);
    if (!container) return;

    // Quick clash detection for UI feedback
    const getClashStatus = (r) => {
        const isClash = tt.some(other => {
            if (other === r) return false;
            if (other.day === r.day && other.startTime === r.startTime) {
                if (other.teacher === r.teacher) return true;
                if (other.room === r.room) return true;
            }
            return false;
        });
        return isClash;
    };

    container.innerHTML = tt.map(r => {
        const clash = getClashStatus(r);
        const clashBadge = clash ? `<span style="color:var(--red); font-size:0.75rem; border:1px solid rgba(239,68,68,0.3); padding:2px 6px; border-radius:4px; margin-left:8px; background:rgba(239,68,68,0.1); font-weight:800;">CLASH</span>` : '';
        const rowStyle = clash ? 'border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05);' : '';
        
        return `
        <div class="mini-row" style="${rowStyle}">
            <div class="mini-title">
                <span style="display:flex; align-items:center;">${r.course} ${clashBadge}</span>
                <span>${r.courseCode}</span>
            </div>
            <div class="mini-meta">
                <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${r.teacher}</span>
                <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${r.day} ${r.startTime}</span>
                <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> ${r.room}</span>
            </div>
        </div>
        `;
    }).join('');
}

function populateModernGrid(id, tt) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = tt.map(r => {
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.teacher)}&background=random&color=fff&size=64`;
        return `
        <div class="sg-row">
            <div class="sg-course">
                <span class="sg-code">${r.courseCode}</span>
                <span>${r.course}</span>
            </div>
            <div class="sg-teacher">
                <img src="${avatar}" class="sg-avatar">
                <span>${r.teacher}</span>
            </div>
            <div class="sg-room">${r.room}</div>
            <div class="sg-day">${r.day}</div>
            <div class="sg-time">${r.startTime} - ${r.endTime}</div>
        </div>`;
    }).join('');
}

function drawFitnessChart(history) {
    const ctx = document.getElementById('fitnessChart').getContext('2d');
    if (fitnessChart) fitnessChart.destroy();
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';
    
    fitnessChart = new Chart(ctx, {
        type: 'line',
        data: { labels: history.map(h => h.generation), datasets: [
            { label: 'Max Fitness', data: history.map(h => h.bestFitness), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)', fill: true, tension: .4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 6 },
            { label: 'Avg Fitness', data: history.map(h => h.avgFitness), borderColor: '#d946ef', backgroundColor: 'rgba(217,70,239,.05)', fill: true, tension: .4, borderWidth: 2, borderDash: [5,5], pointRadius: 0, pointHoverRadius: 6 },
        ]},
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { labels: { color: '#eef0f6', font: { size: 13, weight: 600 }, usePointStyle: true, padding: 25 } },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: '#94a3b8', borderColor: 'rgba(99,102,241,.3)', borderWidth: 1, cornerRadius: 12, padding: 16 } },
            scales: { x: { grid: { color: 'rgba(255,255,255,0.02)' } },
                y: { grid: { color: 'rgba(255,255,255,0.02)' }, min: 0, max: 1.05 } } }
    });
}

function switchView(view) {
    const grid = document.getElementById('comparisonGrid');
    const calendar = document.getElementById('calendarView');
    const tableBtn = document.getElementById('viewTableBtn');
    const calendarBtn = document.getElementById('viewCalendarBtn');

    if (view === 'calendar') {
        grid.style.display = 'none';
        calendar.style.display = 'block';
        gsap.fromTo(calendar, {opacity:0, y:20}, { opacity: 1, y: 0, duration: 0.5 });
        tableBtn.classList.remove('active', 'btn-primary');
        tableBtn.classList.add('btn-ghost');
        calendarBtn.classList.add('active', 'btn-primary');
        calendarBtn.classList.remove('btn-ghost');
    } else {
        grid.style.display = 'flex';
        calendar.style.display = 'none';
        gsap.fromTo(grid, {opacity:0, y:20}, { opacity: 1, y: 0, duration: 0.5 });
        tableBtn.classList.add('active', 'btn-primary');
        tableBtn.classList.remove('btn-ghost');
        calendarBtn.classList.remove('active', 'btn-primary');
        calendarBtn.classList.add('btn-ghost');
    }
}

function filterResults() {
    const query = document.getElementById('scheduleFilter').value.toLowerCase();
    const rows = document.querySelectorAll('.sg-row:not(.sg-header)');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? 'grid' : 'none';
    });
}

async function renderCalendarGrid(timetable) {
    const grid = document.getElementById('calendarGridBody');
    if (!grid) return;
    grid.innerHTML = '';

    const timeMap = new Map();
    timetable.forEach(entry => {
        const key = `${entry.startTime}-${entry.endTime}`;
        if (!timeMap.has(key)) timeMap.set(key, { start: entry.startTime, end: entry.endTime });
    });
    const sortedTimes = Array.from(timeMap.values()).sort((a, b) => a.start.localeCompare(b.start));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    sortedTimes.forEach(time => {
        const row = document.createElement('div');
        row.className = 'cal-time-row';
        row.innerHTML = `<div class="cal-hour">${time.start}</div>`;

        days.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'cal-cell';
            
            const entries = timetable.filter(e => e.day === day && e.startTime === time.start);
            entries.forEach(e => {
                const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(e.teacher)}&background=random&color=fff&size=64`;
                const div = document.createElement('div');
                div.className = 'cal-entry';
                div.innerHTML = `
                    <div class="cal-entry-header">
                        <img src="${avatar}" class="sg-avatar" style="width:24px; height:24px;">
                        <strong>${e.courseCode}</strong>
                    </div>
                    <span>${e.teacher}</span>
                    <div class="cal-room">${e.room}</div>
                `;
                cell.appendChild(div);
            });
            row.appendChild(cell);
        });
        grid.appendChild(row);
    });
}

function printSchedule() {
    window.print();
}

// ============================================
// SMART IMPORTER
// ============================================
function switchImporterTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.importer-pane').forEach(p => p.classList.remove('active'));
    
    if (tab === 'file') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('fileImporter').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('pasteImporter').classList.add('active');
    }
}

async function processMagicPaste() {
    const text = document.getElementById('magicPasteArea').value;
    if (!text.trim()) { showToast('Please paste data', 'error'); return; }
    showToast('Importing dataset...', 'success');
    try {
        const data = parseCSV(text);
        await importData(data);
        showToast('System synchronized successfully.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (err) { showToast('Syntax error in payload.', 'error'); }
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const data = { courses: [], teachers: [], rooms: [], timeslots: [] };
    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        const type = parts[0].toLowerCase();
        if (type === 'course') data.courses.push({ name: parts[1], code: parts[2], credit_hours: parseInt(parts[3]) || 3 });
        if (type === 'teacher') data.teachers.push({ name: parts[1], department: parts[2] });
        if (type === 'room') data.rooms.push({ name: parts[1], capacity: parseInt(parts[2]) || 30 });
        if (type === 'timeslot') data.timeslots.push({ day: parts[1], start_time: parts[2], end_time: parts[3] });
    });
    return data;
}
async function importData(data) {
    if (data.courses) for (const c of data.courses) await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
    if (data.teachers) for (const t of data.teachers) await fetch('/api/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) });
    if (data.rooms) for (const r of data.rooms) await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
    if (data.timeslots) for (const s of data.timeslots) await fetch('/api/timeslots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
}
function downloadTemplate() {
    const csv = "type,name,code_or_dept_or_day,credits_or_cap_or_start,end_time\ncourse,Quantum Physics,PHY101,4\nteacher,Dr. Alan Turing,Computer Science\nroom,Lecture Hall 1,120\ntimeslot,Monday,09:00,10:30";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'timetable_template.csv'; a.click();
}
async function clearAllData() {
    if (!confirm('CRITICAL ACTION: This will purge all datasets. Proceed?')) return;
    showToast('Purging system databases...', 'error');
    try {
        await fetch('/api/clear-all', { method: 'POST' });
        showToast('System factory reset successful.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (err) { showToast('Purge failed', 'error'); }
}

async function loadLastTimetable() {
    try {
        const res = await fetch(`${API}/api/last-timetable`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.optimized) displayResults(data);
    } catch (e) {}
}

// ============================================
// BOOTSTRAP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    init3DCards();

    if (PAGE === 'home') {
        initHero();
        loadStats();
    } else {
        initPageHero();
    }

    if (PAGE === 'dashboard') {
        loadCourses(); loadTeachers(); loadRooms(); loadTimeslots(); loadStats();
        
        const cf = document.getElementById('courseForm'); if (cf) cf.addEventListener('submit', addCourse);
        const tf = document.getElementById('teacherForm'); if (tf) tf.addEventListener('submit', addTeacher);
        const rf = document.getElementById('roomForm'); if (rf) rf.addEventListener('submit', addRoom);
        const sf = document.getElementById('timeslotForm'); if (sf) sf.addEventListener('submit', addTimeslot);

        // CSV File Upload Handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    showToast('Importing dataset from file...', 'success');
                    try {
                        const data = parseCSV(ev.target.result);
                        await importData(data);
                        showToast('Dataset imported successfully!', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (err) { showToast('Failed to parse CSV file.', 'error'); }
                };
                reader.readAsText(file);
            });
        }

        // Drag & Drop Handler
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.csv')) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                        showToast('Importing dataset from file...', 'success');
                        try {
                            const data = parseCSV(ev.target.result);
                            await importData(data);
                            showToast('Dataset imported successfully!', 'success');
                            setTimeout(() => window.location.reload(), 1500);
                        } catch (err) { showToast('Failed to parse CSV file.', 'error'); }
                    };
                    reader.readAsText(file);
                } else { showToast('Please drop a .csv file', 'error'); }
            });
        }
    }

    if (PAGE === 'generate') {
        loadLastTimetable();
    }

    initScrollReveals();
});
