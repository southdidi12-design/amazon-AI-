const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const aiClient = require('./aiClient');
const amazonAds = require('./amazonAdsClient');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// API endpoints
app.post('/api/generate-audience', async (req, res) => {
  try {
    const { productTitle, productDetails, targetAcos } = req.body;
    const audience = await aiClient.suggestAudience({ productTitle, productDetails, targetAcos });
    res.json({ ok: true, audience });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/generate-copy', async (req, res) => {
  try {
    const { productTitle, productDetails } = req.body;
    const copy = await aiClient.generateAdCopy({ productTitle, productDetails });
    res.json({ ok: true, copy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/create-ad-draft', async (req, res) => {
  try {
    const payload = req.body;
    const draft = await amazonAds.createAdDraft(payload);
    res.json({ ok: true, draft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/optimize', async (req, res) => {
  try {
    const { adId, metrics, targetAcos } = req.body;
    const plan = await aiClient.optimizeAds({ adId, metrics, targetAcos });
    // optionally apply optimization via amazonAds client (disabled by default)
    res.json({ ok: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
