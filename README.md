# Tuto Archive

> A YouTube study-resource finder built exclusively for **ALU Software Engineering students** — browse curated course videos by year, search any topic, filter results, and bookmark tutorials for later.

**Live:** [https://tutoarchive.lancewreal.tech](https://tutoarchive.lancewreal.tech)
**Demo:** [https://youtu.be/ceOe0AAAhK0](https://youtu.be/ceOe0AAAhK0)

---

## What it does

You pick your year of study (Year 1–3) on the landing screen and the app loads all your enrolled ALU Software Engineering courses. Each course card is an accordion — click it and 6 relevant YouTube tutorials load on demand. There's also a free-text search tab with quick-chip shortcuts for common SE topics, sort controls, and year filters.

Everything runs through a Node.js/Express backend. The YouTube API key never touches the browser — the server proxies all requests and keeps the key in a `.env` file. Bookmarked videos persist in `localStorage` across sessions with no login required.

---

## How to run it locally

You need **Node.js v16+** and a YouTube Data API v3 key (see [YouTube API Setup](#youtube-api-setup) below).

**1. Clone the repo**

```bash
git clone https://github.com/nshutilancelot3/Tutorial-Archive.git
cd Tutorial-Archive
```

**2. Install dependencies**

```bash
npm install
```

**3. Add your API key**

Create a `.env` file in the project root:

```
YOUTUBE_API_KEY=your_key_here
```

The `.env` file is in `.gitignore` and will never be committed.

**4. Start the server**

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Pick your year and start exploring.

---

## API used

**YouTube Data API v3** by Google

- Docs: https://developers.google.com/youtube/v3
- Requires a free API key from Google Cloud Console
- Returns video titles, channel names, thumbnails, and publish dates
- We request a max of 6 results per course card and 12 per free-text search
- All requests are proxied through the Express server — the key is never exposed to the browser
- Each search call costs ~100 units against a free daily quota of 10,000 units (~100 searches/day)

---

## Features

- Year selector screen — pick Year 1, 2, or 3; choice is saved to `localStorage` and restored on every visit
- Accordion course cards — videos fetch lazily only when you open a card, preserving API quota
- Global search bar in the header, accessible from any tab
- Topic search tab with 10 quick-chip shortcuts for common SE topics
- Sort results by Most Relevant or Newest First — passed directly to the YouTube API so the ranking is real
- Year filter chips — narrow results client-side without an extra API call
- Three-layer Shorts filter: `videoDuration=medium` at the API level, query exclusion, and a server-side title scan
- In-app video player — videos open in a Bootstrap modal, no redirect to YouTube
- Bookmark any video; saves to `localStorage` under `ta_saved_SE`
- Toast notifications for every save, remove, and error action
- Skeleton loaders while videos are fetching
- Offline detection — red banner appears and searches are blocked when the connection drops
- Inline error messages for timeouts, quota exhaustion, and API failures
- Responsive layout, works on mobile and desktop

---

## Project structure

```
Tutorial-Archive/
├── index.html          # Single-page shell: year selector + app screen + video modal + toast
├── style.css           # All styles: CSS variables, components, animations, responsive
├── app.js              # All logic: year selection, search, sort/filter, save, render
├── courses.js          # Real ALU SE course data (Years 1–4) with YouTube search topics
├── server.js           # Express server — proxies YouTube API requests, keeps key secure
├── package.json        # Dependencies: express, dotenv
├── .env                # YouTube API key — git-ignored, never committed
├── .gitignore          # Excludes .env, node_modules, .DS_Store, logs
└── nginx/
    ├── web-server.conf     # Nginx reverse-proxy config for Web01 and Web02
    └── load-balancer.conf  # HAProxy config for Lb01
```

---

## YouTube API setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Navigate to **APIs & Services → Library**
4. Search for and enable **YouTube Data API v3**
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Paste the key into your `.env` file as `YOUTUBE_API_KEY=your_key_here`

The quota resets every day at midnight Pacific Time.

---

## Deployment to web servers

The live deployment uses two Node.js app servers behind an HAProxy load balancer.

| Server | Role | IP |
|---|---|---|
| Web01 | Node.js app + Nginx reverse proxy | `44.211.45.35` |
| Web02 | Node.js app + Nginx reverse proxy | `44.211.161.173` |
| Lb01 | HAProxy load balancer (HTTPS termination) | `13.220.156.66` |

**Prerequisites:** Two Ubuntu servers with Nginx installed, one with HAProxy, SSH access to all three.

**Step 1 — Install Node.js and PM2 on Web01 and Web02**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

**Step 2 — Deploy the application**

```bash
sudo mkdir -p /var/www/tuto-archive
sudo chown ubuntu:ubuntu /var/www/tuto-archive

# Copy project files to the server, then:
cd /var/www/tuto-archive
npm install --production
echo "YOUTUBE_API_KEY=your_key_here" > .env

pm2 start server.js --name tuto-archive
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Verify it's running:

```bash
pm2 status
curl http://localhost:3000
```

**Step 3 — Configure Nginx as a reverse proxy on both web servers**

The config is in `nginx/web-server.conf`. Copy it into place:

```bash
sudo cp nginx/web-server.conf /etc/nginx/sites-available/tuto-archive
sudo ln -s /etc/nginx/sites-available/tuto-archive /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Step 4 — Configure HAProxy on Lb01**

The full config is in `nginx/load-balancer.conf`. It redirects HTTP to HTTPS and round-robins between the two web servers:

```bash
sudo cp nginx/load-balancer.conf /etc/haproxy/haproxy.cfg
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
sudo systemctl reload haproxy
```

**Step 5 — Verify load balancing**

```bash
for i in $(seq 1 6); do
  curl -sk -o /dev/null -w "Hit $i: %{http_code}\n" https://tutoarchive.lancewreal.tech
done
```

**Updating after code changes:**

```bash
cd /var/www/tuto-archive
# copy updated files, then:
pm2 restart tuto-archive
```

---

## Challenges and how I dealt with them

**Keeping the API key out of the browser.** The first version called YouTube directly from `app.js`, which meant the key was visible in the network tab and JavaScript source. The fix was writing a small Express proxy — `app.js` calls `/api/search` on the local server, the server appends the key from `.env`, and the key never leaves the server.

**API quota going to zero immediately.** With 32 courses across 4 years, loading everything on page load would exhaust the 10,000-unit daily quota in one visit. I switched to lazy fetching — a course only calls the API when the student clicks to expand it. Usage now scales with actual interaction, not page loads.

**YouTube Shorts polluting course results.** Shorts were showing up and failing to embed because they're vertical and blocked in iframes. The YouTube Search API has no direct "exclude Shorts" parameter, so I layered three filters: `videoDuration=medium` to restrict to 4–20 minute videos at the API level, `-#shorts -shorts tutorial` appended to every query, and a server-side `.filter()` that drops any result whose title contains the word "shorts".

**Silent request timeouts freezing the UI.** If YouTube was slow, the fetch would hang with no feedback. I added a 12-second `AbortController` timeout in the browser and a 10-second `request.setTimeout()` on the server side. Both produce a clear inline error message instead of leaving the skeleton loader spinning forever.

**Stale localStorage sessions after removing programs.** The original app supported three ALU programs. When IBT and EL were removed, returning users had a stored program code (`ta_program = 'IBT'`) that no longer existed. The fix was a validation check on page load — if `ALU_PROGRAMS[storedProgram]` is undefined, the session is cleared and the year selector is shown fresh.

**CSS grid row stretching.** When an accordion card expanded, the other cards in the same grid row stretched to match its height. One line fixed it: `align-items: start` on `.course-grid`. I spent more time debugging this than I should have.

**Nginx default server conflict on the web servers.** The servers hosted other projects. An alphabetically earlier config file was being picked up as the default server and serving the wrong site. The fix was adding `listen 80 default_server` and an explicit `server_name` to the Tuto Archive config so Nginx would route requests to the right project.

---

## Credits

- **YouTube Data API v3** by Google — video search and metadata — [developers.google.com/youtube/v3](https://developers.google.com/youtube/v3)
- **Bootstrap 5.3.2** — UI components, grid system, modal — [getbootstrap.com](https://getbootstrap.com)

- **Express.js** by the OpenJS Foundation — HTTP server and API routing — [expressjs.com](https://expressjs.com)
- **Google Fonts** — Urbanist and JetBrains Mono — [fonts.google.com](https://fonts.google.com)
- **HAProxy** — load balancer on Lb01 — [haproxy.org](https://www.haproxy.org)
- **Let's Encrypt** — free SSL/TLS certificate for HTTPS on the live domain — [letsencrypt.org](https://letsencrypt.org)

---

## Author

Lancelot Nshuti — African Leadership University, Kigali, Rwanda
