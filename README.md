# Tuto Archive

> A YouTube study-resource finder built for **ALU Software Engineering students** — browse curated course videos by year, search any topic, filter results, and bookmark tutorials for later.

**Live:** [https://tutoarchive.lancewreal.tech](https://tutoarchive.lancewreal.tech)

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [How It Works](#how-it-works)
- [Courses (Year 1)](#courses-year-1)
- [YouTube API Setup](#youtube-api-setup)
- [Data Storage](#data-storage)
- [API Quota](#api-quota)
- [Deployment](#deployment)
- [Credits & Attribution](#credits--attribution)
- [Challenges](#challenges)

---

## Overview

**Tuto Archive** is a lightweight, single-page web application that helps African Leadership University (ALU) Software Engineering students find relevant YouTube tutorials for their enrolled courses. It uses the **YouTube Data API v3** to fetch videos organised by year of study.

The app runs a **Node.js/Express** backend to proxy all YouTube API requests, keeping the API key secure on the server and never exposed to the browser. Students land on a year-selection screen, pick their year, then browse accordion-style course cards, search freely, sort and filter results, and bookmark videos — all persisted in `localStorage`.

---

## Demo

> Watch the 2-minute demo: **[YouTube Demo Link]**

The demo covers:
- Landing on the year selector and picking a year
- Expanding a course card to load 6 videos
- Searching a topic, sorting by Newest First, filtering by publication year
- Bookmarking a video and viewing it in the Saved tab
- Accessing the live deployment via the load balancer URL

---

## Features

| Feature | Description |
|---|---|
| **Year Selector** | Pick your year of study (1–4) on the landing screen — SE is the fixed program |
| **Course Catalogue** | Accordion cards for each real ALU course — click to load 6 YouTube videos on demand |
| **Global Search** | Header search bar accessible from any tab |
| **Topic Search** | Dedicated Search tab with free-text queries and quick-chip shortcuts |
| **Sort Results** | Sort by Most Relevant or Newest First — passed directly to the YouTube API |
| **Filter by Year** | One-click year chips narrow results client-side after fetching |
| **Shorts Filtering** | YouTube Shorts excluded via duration filter, query exclusion, and title matching |
| **In-App Video Player** | Videos open in a Bootstrap modal — no redirect to YouTube |
| **Save & Bookmark** | Bookmark any video; persists in `localStorage` across sessions |
| **Toast Notifications** | Contextual feedback for every user action |
| **Skeleton Loaders** | Animated placeholders while videos are being fetched |
| **Offline Detection** | Red banner and blocked searches when internet connection is lost |
| **Error Handling** | Inline error messages for API failures, timeouts, and quota exhaustion |
| **Responsive UI** | Works on desktop and mobile browsers |

---

## Project Structure

```
Tutorial_finder/
├── index.html          # Single-page shell — year selector + app screen + video modal
├── style.css           # All styles: CSS variables, components, animations, responsive
├── app.js              # Core logic: year selection, search, sort/filter, save, render
├── courses.js          # Real ALU SE course data per year with YouTube search topics
├── server.js           # Express server — proxies YouTube API requests securely
├── package.json        # Node.js dependencies: express, dotenv
├── .env                # YouTube API key (git-ignored — never committed)
├── .gitignore          # Excludes .env, node_modules, .DS_Store, logs, .claude/
└── nginx/
    ├── web-server.conf     # Nginx reverse-proxy config for Web01 and Web02
    └── load-balancer.conf  # HAProxy config reference for Lb01
```

---

## Getting Started (Local)

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- A YouTube Data API v3 key (see [YouTube API Setup](#youtube-api-setup))

### 1 — Clone the repository

```bash
git clone <repo-url>
cd Tutorial_finder
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Add your YouTube API key

Create a `.env` file in the project root:

```
YOUTUBE_API_KEY=your_api_key_here
```

> The `.env` file is listed in `.gitignore` and will never be accidentally committed.

### 4 — Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

```
User opens http://localhost:3000
        │
        ▼
  ┌───────────┐   no session   ┌─────────────────────┐
  │  Session? │ ─────────────► │   Year Selector      │
  └───────────┘                │   Pick Year 1–4      │
        │ session found        └──────────┬──────────┘
        │                                 │ confirmed
        ▼ ◄──────────────────────────────┘
  ┌──────────────────────────────────────────┐
  │                App Screen                │
  │  ┌──────────┐  ┌────────┐  ┌─────────┐  │
  │  │My Courses│  │ Search │  │  Saved  │  │
  │  └──────┬───┘  └───┬────┘  └────┬────┘  │
  │         │           │            │       │
  │   Fetch via    Free-text    Bookmarked   │
  │   /api/search  + sort/filter  videos    │
  └──────────────────────────────────────────┘
                    │
                    ▼
             server.js (Express)
                    │
                    ▼
          YouTube Data API v3
```

### Year Selection
Students pick their year (1–4) on the landing screen. The program is fixed to **Software Engineering**. The selection saves to `localStorage` (`ta_program`, `ta_year`) and is restored on every return visit. If a stale or invalid session is detected, the app clears it automatically and shows the selector.

### Course Videos
Each course card fetches videos lazily — only when a student clicks to expand it. 6 videos are loaded per card. This preserves API quota by avoiding bulk fetches on page load.

### API Proxy (Security)
The browser never calls YouTube directly. All requests go to `/api/search` on the Express server, which attaches the API key from `.env` before forwarding to YouTube. The key is never visible in the browser's network tab or JavaScript source.

### Shorts Filtering
YouTube Shorts (vertical videos ≤60 seconds) are excluded with three layers:
1. `videoDuration=medium` — YouTube API only returns videos between 4 and 20 minutes
2. `-#shorts -shorts tutorial` appended to every query — deprioritises Shorts in results
3. Server-side title filter — drops any result whose title contains "shorts"

### Search, Sort & Filter
- **Sort** by Most Relevant (default) or Newest First — triggers a fresh YouTube API fetch
- **Year filter chips** appear after results load and filter client-side to save quota
- **Quick-chip shortcuts** provide one-click searches for common SE topics

### In-App Video Player
Clicking a video opens a Bootstrap modal with an embedded YouTube `<iframe>`. Playback stays inside the app.

### Save / Unsave
Clicking the bookmark icon writes the video to `localStorage` under `ta_saved_SE`. The icon updates instantly across all tabs.

### Error Handling
- **12-second client-side timeout** via `AbortController`
- **10-second server-side timeout** via `request.setTimeout()`
- **Offline detection** via `navigator.onLine` — red banner appears and searches are blocked
- **API errors** (quota exceeded, invalid key, outage) shown inline with a styled error block

---

## Courses (Year 1)

These are the real ALU Software Engineering Year 1 courses currently in the app:

| Course | Topics searched on YouTube |
|---|---|
| Introduction to Python Programming and Databases | Python beginner tutorial, Python databases & SQL |
| Introduction to Linux and IT Tools | Linux for beginners, Linux command line & IT tools |
| Frontend Web Development | HTML/CSS/JS tutorial, frontend crash course |
| Web Infrastructure | Web infrastructure, servers & networking basics |

> Years 2–4 will be updated once the specialization track is confirmed.

---

## YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Navigate to **APIs & Services → Library**
4. Search for and enable **YouTube Data API v3**
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key into your `.env` file:

```
YOUTUBE_API_KEY=your_key_here
```

---

## Data Storage

All user data lives **entirely in the browser**. The server has no database.

| localStorage Key | Contents |
|---|---|
| `ta_program` | Always `SE` (Software Engineering) |
| `ta_year` | Selected year (`1`–`4`) |
| `ta_saved_SE` | JSON array of bookmarked videos |

To inspect: open DevTools (`F12`) → **Application** → **Local Storage**.
To reset: run `localStorage.clear()` in the DevTools console.

---

## API Quota

| Action | Units consumed |
|---|---|
| One search request | ~100 units |
| Free daily quota | 10,000 units |
| Approx. searches per day | ~100 |

If the daily quota is exhausted you will see: *"API quota exceeded or key invalid."*
The quota resets every day at midnight Pacific Time.

---

## Deployment

The application is live at **[https://tutoarchive.lancewreal.tech](https://tutoarchive.lancewreal.tech)**

| Server | Role | IP |
|---|---|---|
| Web01 | App server — Node.js + Nginx | `44.211.45.35` |
| Web02 | App server — Node.js + Nginx | `44.211.161.173` |
| Lb01 | Load balancer — HAProxy | `13.220.156.66` |

### Architecture

```
         Internet — tutoarchive.lancewreal.tech
                          │
                          ▼
              Lb01 — HAProxy (13.220.156.66)
              ┌──────────────────────────────┐
              │  HTTP → HTTPS (301 redirect) │
              │  Round-robin load balancing  │
              └──────────┬───────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
         Web01                       Web02
    44.211.45.35               44.211.161.173
    Nginx (port 80)            Nginx (port 80)
         │                           │
         ▼                           ▼
    Node.js/PM2                 Node.js/PM2
      (port 3000)                 (port 3000)
```

---

### Step 1 — Install Node.js and PM2 on Web01 and Web02

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

---

### Step 2 — Deploy the application

```bash
sudo mkdir -p /var/www/tuto-archive
sudo chown ubuntu:ubuntu /var/www/tuto-archive

cd /var/www/tuto-archive
npm install --production

echo "YOUTUBE_API_KEY=your_api_key_here" > .env

pm2 start server.js --name tuto-archive
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Verify:

```bash
pm2 status
curl http://localhost:3000
```

---

### Step 3 — Configure Nginx as a reverse proxy

```bash
sudo tee /etc/nginx/sites-available/tuto-archive > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name tutoarchive.lancewreal.tech;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/tuto-archive /etc/nginx/sites-enabled/tuto-archive
sudo nginx -t && sudo systemctl reload nginx
```

---

### Step 4 — Configure the load balancer (Lb01)

Lb01 uses **HAProxy** (pre-installed). The full config is documented in `nginx/load-balancer.conf`.

```haproxy
frontend balancer_http_in
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

frontend balancer_https_in
    bind *:443 ssl crt /etc/ssl/certs/ha_proxy_ssl.pem
    option forwardfor
    default_backend balancer_http_out

backend balancer_http_out
    balance roundrobin
    server web-01 44.211.45.35:80 check
    server web-02 44.211.161.173:80 check
```

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
sudo systemctl reload haproxy
```

---

### Step 5 — Verify load balancing

```bash
for i in $(seq 1 6); do
  curl -sk -o /dev/null -w "Hit $i: %{http_code}\n" https://tutoarchive.lancewreal.tech
done
```

---

### Updating the deployment

```bash
cd /var/www/tuto-archive
# copy updated files, then:
pm2 restart tuto-archive
```

---

## Credits & Attribution

| Resource | Purpose | Link |
|---|---|---|
| **YouTube Data API v3** by Google | Video search and metadata | [developers.google.com/youtube/v3](https://developers.google.com/youtube/v3) |
| **Bootstrap 5.3.2** by The Bootstrap Authors | UI components, grid, modal | [getbootstrap.com](https://getbootstrap.com) |
| **Bootstrap Icons 1.11.3** by The Bootstrap Authors | Icons throughout the interface | [icons.getbootstrap.com](https://icons.getbootstrap.com) |
| **Express.js** by the OpenJS Foundation | Node.js HTTP server and routing | [expressjs.com](https://expressjs.com) |
| **dotenv** by motdotla | Loads environment variables from `.env` | [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) |
| **Google Fonts** — Urbanist & JetBrains Mono | Typography | [fonts.google.com](https://fonts.google.com) |
| **HAProxy** | Load balancer on Lb01 | [haproxy.org](https://www.haproxy.org) |
| **PM2** by Unitech | Process manager — keeps Node.js alive across reboots | [pm2.keymetrics.io](https://pm2.keymetrics.io) |

---

## Challenges

**1. Keeping the API key secure**
The first prototype called the YouTube API directly from the browser, exposing the key in the JavaScript source and network requests. The fix was a Node.js/Express proxy — the browser calls `/api/search` on the local server, the server appends the key from `.env`, and the key never reaches the client.

**2. YouTube API quota limits**
The free quota is 10,000 units/day and each search costs ~100 units. Loading all course cards on page load would drain the quota instantly. The fix was a lazy accordion — videos only fetch when a student opens a specific card, so quota usage is proportional to actual interaction.

**3. Filtering out YouTube Shorts**
Shorts were appearing in course results and failing to embed properly. The YouTube Search API has no direct "exclude Shorts" filter, so three layers were combined: `videoDuration=medium` (API-level), `-#shorts -shorts tutorial` appended to queries, and a server-side title filter that drops results containing "shorts".

**4. Handling API timeouts and network errors**
YouTube API requests can time out silently. A 10-second server-side timeout was added via `request.setTimeout()` and a 12-second `AbortController` timeout on the client. Both states display a clear inline message instead of leaving the UI frozen.

**5. Offline detection**
On poor connections, API calls would fail with cryptic errors. `navigator.onLine` event listeners now catch the transition, show a red offline banner, and block searches with an explanatory toast.

**6. Load balancer conflicts with other hosted sites**
The web servers ran other sites. An alphabetically earlier Nginx config was loaded as the default server, serving a different site instead of Tuto Archive. The fix was adding `listen 80 default_server` and an explicit `server_name` to the Tuto Archive config.

**7. CSS grid row stretching**
When one course card expanded, sibling cards in the same grid row stretched to match its height. Fixed with `align-items: start` on `.course-grid`.

**8. Stale localStorage sessions**
After removing IBT and EL programs, returning users had a stored program code that no longer existed in the app. Added a validation check on load — if the stored program isn't in `ALU_PROGRAMS`, the session is cleared and the selector is shown.
