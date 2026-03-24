/* ═══════════════════════════════════════════════════════════════
   TUTO ARCHIVE — app.js

   No login or signup. User picks a program + year and goes in.
   Choice is saved to localStorage so it persists on refresh.

   YouTube API key is read from .env on the server.
   All searches go through /api/search — key never reaches browser.

   Saved videos are stored in localStorage per program:
     ta_saved_SE   → saved videos for Software Engineering
═══════════════════════════════════════════════════════════════ */

/* ─── STATE ──────────────────────────────────────────────── */
var currentProgram      = localStorage.getItem('ta_program') || null;
var currentYear         = parseInt(localStorage.getItem('ta_year')) || null;
var selectedProgram     = null;
var selectedYear        = null;
var savedVideos         = [];
var activeTab           = 'courses';
var videoModalInst      = null;
var currentModalVid     = null;

/* search state */
var lastSearchQuery    = '';
var lastSearchResults  = [];
var searchSortOrder    = 'relevance';
var searchYearFilter   = 'all';

/* ─── QUICK SEARCH CHIPS PER PROGRAM ─────────────────────── */
var QUICK = {
  SE: ['React tutorial','Node.js API','Python basics','Git and GitHub','Docker','System design','Data structures','SQL tutorial','Linux terminal','TypeScript'],
};

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  // Clear stale session if stored program no longer exists
  if (currentProgram && !ALU_PROGRAMS[currentProgram]) {
    localStorage.removeItem('ta_program');
    localStorage.removeItem('ta_year');
    currentProgram = null;
    currentYear    = null;
  }

  // If user already chose a valid program + year, go straight to the app
  if (currentProgram && currentYear) {
    savedVideos = loadSaved(currentProgram);
    showApp();
  }

  // Enter key on search inputs
  document.getElementById('globalSearch').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doGlobalSearch();
  });
  document.getElementById('searchTopicInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doTopicSearch();
  });
});

/* ═══════════════════════════════════════════════════════════════
   PROGRAM SELECTOR
═══════════════════════════════════════════════════════════════ */
function selectProgram(card) {
  document.querySelectorAll('.program-card').forEach(function (c) {
    c.classList.remove('selected');
  });
  card.classList.add('selected');
  selectedProgram = card.dataset.program;
}

function selectYear(btn, year) {
  document.querySelectorAll('.year-pill').forEach(function (b) {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
  selectedYear = year;
}

function enterApp() {
  selectedProgram = 'SE'; // only one program
  if (!selectedYear) { showToast('Please select your year.', 'warn'); return; }

  currentProgram = selectedProgram;
  currentYear    = selectedYear;

  // Persist choice so user doesn't have to pick again on refresh
  localStorage.setItem('ta_program', currentProgram);
  localStorage.setItem('ta_year',    currentYear);

  savedVideos = loadSaved(currentProgram);
  showApp();
}

/* ═══════════════════════════════════════════════════════════════
   SHOW APP
═══════════════════════════════════════════════════════════════ */
function showApp() {
  document.getElementById('selectorScreen').classList.add('d-none');
  document.getElementById('appScreen').classList.remove('d-none');

  var prog = ALU_PROGRAMS[currentProgram];
  document.getElementById('headerTagline').textContent = 'ALU · ' + prog.label + ' · Year ' + currentYear;
  document.getElementById('enrolledLabel').textContent =
    prog.icon + ' ' + prog.label + ' · Year ' + currentYear + ' · African Leadership University';

  renderQuickChips();
  loadCourses();
  renderSavedVideos();
  updateSavedCount();
}

/* ─── Switch program — go back to selector ───────────────── */
function switchProgram() {
  if (!confirm('Switch your program? Your saved videos will stay.')) return;

  localStorage.removeItem('ta_program');
  localStorage.removeItem('ta_year');
  currentProgram = null;
  currentYear    = null;

  // Reset selector UI
  document.querySelectorAll('.program-card').forEach(function (c) { c.classList.remove('selected'); });
  document.querySelectorAll('.year-pill').forEach(function (b) { b.classList.remove('selected'); });
  selectedProgram = null;
  selectedYear    = null;

  document.getElementById('appScreen').classList.add('d-none');
  document.getElementById('selectorScreen').classList.remove('d-none');

  // Reset to courses tab for next time
  switchTabSilent('courses');
}

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */
function switchTab(btn, tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('tabCoursesContent').classList.toggle('d-none', tab !== 'courses');
  document.getElementById('tabSearchContent').classList.toggle('d-none',  tab !== 'search');
  document.getElementById('tabSavedContent').classList.toggle('d-none',   tab !== 'saved');
  if (tab === 'saved') renderSavedVideos();
}

function switchTabSilent(tab) {
  if (tab !== 'search') {
    lastSearchQuery = ''; lastSearchResults = [];
    document.getElementById('sortFilterBar').style.display = 'none';
  }
  activeTab = tab;
  ['courses','search','saved'].forEach(function (t) {
    document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1) + 'Content')
      .classList.toggle('d-none', t !== tab);
  });
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  var btn = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (btn) btn.classList.add('active');
}
