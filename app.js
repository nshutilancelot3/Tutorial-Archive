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

  // Offline / online detection
  function updateOfflineBanner() {
    document.getElementById('offlineBanner').classList.toggle('show', !navigator.onLine);
    if (!navigator.onLine) showToast('No internet connection.', 'warn');
  }
  window.addEventListener('offline', updateOfflineBanner);
  window.addEventListener('online',  function () {
    document.getElementById('offlineBanner').classList.remove('show');
    showToast('Back online!');
  });

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

/* ═══════════════════════════════════════════════════════════════
   LOAD COURSES + FETCH VIDEOS
═══════════════════════════════════════════════════════════════ */
function loadCourses() {
  var courses = getCourses(currentProgram, currentYear);
  var grid    = document.getElementById('courseGrid');

  if (!courses.length) {
    grid.innerHTML = emptyState('bi-journal-x', 'No courses found for this year and program.');
    return;
  }

  // Store courses on window so toggleCourseVideos can access them
  window._courses = courses;

  grid.innerHTML = courses.map(function (c, i) {
    return '<div class="course-card animate-in" style="animation-delay:' + (i * 0.05) + 's" id="card_' + c.id + '">' +
      '<div class="course-header" onclick="toggleCourseVideos(\'' + c.id + '\')" style="cursor:pointer;user-select:none">' +
        '<div class="course-icon" style="background:' + c.color + '"></div>' +
        '<div style="flex:1">' +
          '<div class="course-name">' + c.name + '</div>' +
          '<div class="course-meta" id="meta_' + c.id + '">Click to load videos</div>' +
        '</div>' +
        '<i class="bi bi-chevron-down" id="chev_' + c.id + '" style="color:var(--muted);font-size:.85rem;transition:transform .25s"></i>' +
      '</div>' +
      '<div class="course-videos" id="videos_' + c.id + '" style="display:none;padding-top:.4rem"></div>' +
    '</div>';
  }).join('');
}

/* Accordion — only one card open at a time, fetch only on first open */
var _loadedCourses = {};
var _openCourse    = null;

function toggleCourseVideos(courseId) {
  var vEl    = document.getElementById('videos_' + courseId);
  var chev   = document.getElementById('chev_'   + courseId);
  var mEl    = document.getElementById('meta_'   + courseId);
  var isOpen = vEl.style.display === 'block';

  // Close ALL course cards first
  document.querySelectorAll('.course-videos').forEach(function (el) {
    el.style.display = 'none';
  });
  document.querySelectorAll('[id^="chev_"]').forEach(function (el) {
    el.style.transform = 'rotate(0deg)';
  });

  if (isOpen) {
    // Was open — leave it closed
    _openCourse = null;
  } else {
    // Open this one
    vEl.style.display = 'block';
    if (chev) chev.style.transform = 'rotate(180deg)';
    _openCourse = courseId;

    // Only call API once per course
    if (!_loadedCourses[courseId]) {
      var course = (window._courses || []).find(function (c) { return c.id === courseId; });
      if (course) {
        _loadedCourses[courseId] = true;
        vEl.innerHTML = skeleton(3);
        if (mEl) mEl.textContent = 'Loading...';
        fetchVideos(course);
      }
    }
  }
}

function skeleton(n) {
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="video-row" style="cursor:default">' +
      '<div class="sk-thumb"></div>' +
      '<div class="flex-grow-1">' +
        '<div class="sk-line" style="width:88%"></div>' +
        '<div class="sk-line" style="width:60%"></div>' +
      '</div>' +
    '</div>';
  }
  return html;
}

async function fetchVideos(course) {
  var vEl = document.getElementById('videos_' + course.id);
  var mEl = document.getElementById('meta_' + course.id);

  try {
    var videos = await apiSearch(course.topics[0], 6);
    if (mEl) mEl.textContent = videos.length + ' videos';
    vEl.innerHTML = videos.length
      ? videos.map(videoRowHTML).join('')
      : emptyState('bi-camera-video-off', 'No videos found.');
  } catch (err) {
    vEl.innerHTML = errMsg(err.message);
    if (mEl) mEl.textContent = 'Failed to load';
  }
}

/* ═══════════════════════════════════════════════════════════════
   YOUTUBE SEARCH — proxied through /api/search on the server
   API key stays in .env on the server, never reaches the browser
═══════════════════════════════════════════════════════════════ */
async function apiSearch(query, max, order) {
  max   = max   || 9;
  order = order || 'relevance';
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 12000);
  try {
    var res  = await fetch(
      '/api/search?q=' + encodeURIComponent(query) + '&max=' + max + '&order=' + order,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Search failed.');
    return data.videos || [];
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL SEARCH (header bar)
═══════════════════════════════════════════════════════════════ */
function doGlobalSearch() {
  var q = document.getElementById('globalSearch').value.trim();
  if (!q) return;
  document.getElementById('searchTopicInput').value = q;
  switchTab(document.getElementById('tabSearch'), 'search');
  doTopicSearch();
  document.getElementById('globalSearch').value = '';
}

/* ═══════════════════════════════════════════════════════════════
   TOPIC SEARCH (Search tab)
═══════════════════════════════════════════════════════════════ */
async function doTopicSearch() {
  var q   = document.getElementById('searchTopicInput').value.trim();
  var res = document.getElementById('searchResults');

  if (!q) { showToast('Enter a topic to search.', 'warn'); return; }
  if (!navigator.onLine) { showToast('No internet connection.', 'warn'); return; }

  searchSortOrder  = document.getElementById('sortOrder').value;
  searchYearFilter = 'all';

  res.innerHTML =
    '<div class="d-flex align-items-center gap-2 py-3 text-muted" style="font-size:.84rem">' +
    '<div class="spinner-border spinner-border-sm" style="color:var(--accent)"></div>' +
    'Searching for <strong>' + esc(q) + '</strong>…</div>';

  document.getElementById('sortFilterBar').style.display = 'none';

  try {
    var videos = await apiSearch(q, 12, searchSortOrder);
    lastSearchQuery   = q;
    lastSearchResults = videos;
    renderSearchResults();
  } catch (err) {
    res.innerHTML = errMsg(err.message);
    document.getElementById('sortFilterBar').style.display = 'none';
  }
}

function onSortChange() {
  searchSortOrder = document.getElementById('sortOrder').value;
  if (!lastSearchQuery) return;
  // Re-fetch with new sort order
  document.getElementById('searchTopicInput').value = lastSearchQuery;
  doTopicSearch();
}

function setYearFilter(year) {
  searchYearFilter = year;
  renderSearchResults();
}

function renderSearchResults() {
  var res    = document.getElementById('searchResults');
  var bar    = document.getElementById('sortFilterBar');
  var videos = lastSearchResults;

  if (!videos.length) {
    res.innerHTML = emptyState('bi-search', 'No results for "' + esc(lastSearchQuery) + '".');
    bar.style.display = 'none';
    return;
  }

  // Build year filter chips from unique years in results
  var years = videos.map(function (v) { return v.year; })
    .filter(function (y, i, a) { return y && a.indexOf(y) === i; })
    .sort(function (a, b) { return b - a; });

  var chipsHTML = '<span style="font-size:.72rem;font-weight:700;color:var(--muted)">YEAR</span>' +
    '<button class="year-chip' + (searchYearFilter === 'all' ? ' active' : '') + '" onclick="setYearFilter(\'all\')">All</button>';
  years.forEach(function (y) {
    chipsHTML += '<button class="year-chip' + (searchYearFilter === y ? ' active' : '') + '" onclick="setYearFilter(\'' + y + '\')">' + y + '</button>';
  });
  document.getElementById('yearFilterChips').innerHTML = chipsHTML;
  bar.style.removeProperty('display');

  // Apply year filter
  var filtered = searchYearFilter === 'all'
    ? videos
    : videos.filter(function (v) { return v.year === searchYearFilter; });

  if (!filtered.length) {
    res.innerHTML = emptyState('bi-filter', 'No results from ' + searchYearFilter + '. Try "All".');
    return;
  }

  res.innerHTML =
    '<p class="mb-3" style="font-size:.8rem;color:var(--muted)">' +
      filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') +
      ' for <strong>' + esc(lastSearchQuery) + '</strong>' +
    '</p>' +
    '<div class="video-grid">' + filtered.map(videoCardHTML).join('') + '</div>';
}

/* ═══════════════════════════════════════════════════════════════
   SAVE / UNSAVE — stored in localStorage per program
═══════════════════════════════════════════════════════════════ */
function loadSaved(program) {
  try {
    return JSON.parse(localStorage.getItem('ta_saved_' + program) || '[]');
  } catch (e) {
    return [];
  }
}

function persistSaved() {
  localStorage.setItem('ta_saved_' + currentProgram, JSON.stringify(savedVideos));
}

function isSaved(id) {
  return savedVideos.some(function (v) { return v.id === id; });
}

function toggleSave(video) {
  var idx = savedVideos.findIndex(function (v) { return v.id === video.id; });

  if (idx === -1) {
    savedVideos.push(video);
    showToast('Saved: ' + video.title.slice(0, 45) + '…');
  } else {
    savedVideos.splice(idx, 1);
    showToast('Removed from saved.');
  }

  persistSaved();
  updateSavedCount();
  refreshSaveBtns(video.id);
  if (activeTab === 'saved') renderSavedVideos();
}

function refreshSaveBtns(id) {
  var saved = isSaved(id);

  document.querySelectorAll('[data-vid="' + id + '"]').forEach(function (btn) {
    btn.classList.toggle('saved', saved);
    btn.title     = saved ? 'Remove' : 'Save';
    btn.innerHTML = '<i class="bi ' + (saved ? 'bi-bookmark-check-fill' : 'bi-bookmark') + '"></i>';
  });

  document.querySelectorAll('[data-card-vid="' + id + '"]').forEach(function (btn) {
    btn.classList.toggle('saved', saved);
    btn.textContent = saved ? 'Saved' : 'Save';
  });
}

function updateSavedCount() {
  document.getElementById('savedCount').textContent = savedVideos.length;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER SAVED VIDEOS
═══════════════════════════════════════════════════════════════ */
function renderSavedVideos() {
  var el  = document.getElementById('savedVideos');
  var btn = document.getElementById('clearSavedBtn');

  if (!savedVideos.length) {
    btn.classList.add('d-none');
    el.innerHTML = emptyState('bi-bookmark',
      'No saved videos yet.<br>Bookmark videos from your courses or search.');
    return;
  }

  btn.classList.remove('d-none');
  el.innerHTML = '<div class="video-grid">' + savedVideos.map(videoCardHTML).join('') + '</div>';
}

function clearAllSaved() {
  if (!confirm('Remove all saved videos?')) return;
  savedVideos = [];
  persistSaved();
  updateSavedCount();
  renderSavedVideos();
}

/* ═══════════════════════════════════════════════════════════════
   QUICK CHIPS
═══════════════════════════════════════════════════════════════ */
function renderQuickChips() {
  var topics = QUICK[currentProgram] || QUICK.SE;
  document.getElementById('quickChips').innerHTML = topics.map(function (t) {
    return '<button class="chip" onclick="quickSearch(\'' + esc(t) + '\')">' + t + '</button>';
  }).join('');
}

function quickSearch(topic) {
  document.getElementById('searchTopicInput').value = topic;
  doTopicSearch();
}

/* ═══════════════════════════════════════════════════════════════
   OPEN VIDEO — plays directly inside the app
   Works because the app is served over HTTP (not file://)
═══════════════════════════════════════════════════════════════ */
function openVideo(videoId, title, channel, year) {
  currentModalVid = { id: videoId, title: title, channel: channel, year: year,
    thumb: 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg' };

  if (!videoModalInst) {
    var modalEl = document.getElementById('videoModal');
    videoModalInst = new bootstrap.Modal(modalEl);
    modalEl.addEventListener('hidden.bs.modal', function () {
      document.getElementById('videoPlayer').src = '';
      currentModalVid = null;
    });
  }

  document.getElementById('videoPlayer').src =
    'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
  document.getElementById('videoModalTitle').textContent = title || '';
  document.getElementById('videoModalMeta').innerHTML =
    '<span class="yt-badge me-1">YT</span>' + esc(channel || '') + ' · ' + (year || '');
  document.getElementById('modalYtLink').href =
    'https://www.youtube.com/watch?v=' + videoId;

  updateModalSaveBtn();
  videoModalInst.show();
}

function toggleSaveFromModal() {
  if (!currentModalVid) return;
  toggleSave(currentModalVid);
  updateModalSaveBtn();
}

function updateModalSaveBtn() {
  if (!currentModalVid) return;
  var saved = isSaved(currentModalVid.id);
  var btn   = document.getElementById('modalSaveBtn');
  btn.innerHTML = saved
    ? '<i class="bi bi-bookmark-check-fill me-1"></i>Saved'
    : '<i class="bi bi-bookmark me-1"></i>Save';
  btn.classList.toggle('saved', saved);
}

function showToast(msg, type) {
  var el = document.getElementById('liveToast');
  document.getElementById('toastMsg').textContent = msg;
  el.style.background = type === 'warn' ? '#d97706' : '#1e1b4b';
  new bootstrap.Toast(el, { delay: 3000 }).show();
}
