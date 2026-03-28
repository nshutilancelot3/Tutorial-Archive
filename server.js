
require('dotenv').config();

const express = require('express');
const https   = require('https');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname)));

/* YOUTUBE SEARCH PROXY */
// Keeps the API key on the server — browser only calls /api/search
app.get('/api/search', function (req, res) {
  var query      = req.query.q;
  var maxResults = req.query.max || 9;
  var order      = ['relevance', 'date'].includes(req.query.order) ? req.query.order : 'relevance';
  var apiKey     = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
    return res.status(500).json({
      error: 'YouTube API key not set. Add YOUTUBE_API_KEY to your .env file.'
    });
  }

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  var params = new URLSearchParams({
    part:              'snippet',
    q:                 query + ' -#shorts -shorts tutorial',
    type:              'video',
    maxResults:        Math.min(Number(maxResults) + 6, 25),
    order:             order,
    videoEmbeddable:   'true',
    videoDuration:     'medium',
    relevanceLanguage: 'en',
    key:               apiKey,
  });

  var ytUrl = 'https://www.googleapis.com/youtube/v3/search?' + params.toString();

  var ytReq = https.get(ytUrl, function (ytRes) {
    var data = '';
    ytRes.on('data', function (chunk) { data += chunk; });
    ytRes.on('end', function () {
      try {
        var parsed = JSON.parse(data);

        if (ytRes.statusCode !== 200) {
          return res.status(ytRes.statusCode).json({
            error: (parsed.error && parsed.error.message) || 'YouTube API error.'
          });
        }

        var videos = (parsed.items || [])
          .filter(function (item) {
            var title = (item.snippet.title || '').toLowerCase();
            return !title.includes('#shorts') && !title.includes(' shorts') && !title.startsWith('shorts');
          })
          .map(function (item) {
            var thumbs = item.snippet.thumbnails;
            return {
              id:      item.id.videoId,
              title:   item.snippet.title,
              channel: item.snippet.channelTitle,
              thumb:   ((thumbs.medium || thumbs.default || {}).url) || '',
              year:    (item.snippet.publishedAt || '').slice(0, 4),
            };
          })
          .slice(0, Number(maxResults));

        res.json({ videos: videos });

      } catch (e) {
        res.status(500).json({ error: 'Failed to parse YouTube response.' });
      }
    });
  }).on('error', function (e) {
    res.status(500).json({ error: 'Failed to reach YouTube API: ' + e.message });
  });

  ytReq.setTimeout(10000, function () {
    ytReq.destroy();
    res.status(504).json({ error: 'YouTube API request timed out. Try again.' });
  });
});

/* CATCH-ALL — serve index.html */
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* START */
app.listen(PORT, function () {
  console.log('');
  console.log('  ✅  Tuto Archive running at http://localhost:' + PORT);
  console.log('  🔑  API key: ' + (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE' ? 'LOADED ✓' : 'MISSING ✗ — add to .env'));
  console.log('');
});
