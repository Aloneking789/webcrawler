const express = require('express');
const bodyParser = require('body-parser');
const { scrapeGoogleBusiness } = require('./index');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/scrape-gmb', async (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).send('Missing url');
  try {
    const data = await scrapeGoogleBusiness(url);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(String(e.message || e));
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

module.exports = app;
