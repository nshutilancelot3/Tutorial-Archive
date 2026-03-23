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
