const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const router = express.Router();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST'],
}));
app.use(express.json()); // Body parser

// Define routes
router.get('/metrics', (req, res) => {
  const metricsData = {
    metrics: [
      {
        id: "addressable_market",
        value: "$43.0M",
        title: "Addressable Market",
        tooltip: "Estimated total spend potential based on market surveys and client propensity data. Represents the maximum possible market share for this offering."
      },
      {
        id: "current_pipeline",
        value: "$184.1M",
        title: "Current Pipeline",
        tooltip: "Total value of opportunities currently in the Interact or Propose stages in Salesforce. Reflects near-term revenue potential for this offering."
      },
      {
        id: "fytd_revenue",
        value: "$0.0M",
        title: "FYTD Revenue",
        tooltip: "Total revenue from all won opportunities for this offering, fiscal year to date."
      },
      {
        id: "connected_growth",
        value: "$0.0M",
        title: "Pull Through",
        tooltip: "Total value generated when an opportunity is sourced by one offering but sold and delivered by another. Indicates connected selling and collaborative growth."
      },
      {
        id: "offering_performance_index",
        value: "Coming soon",
        title: "Proficiency Index",
        tooltip: "Readiness score (1-5) based on four dimensions: go-to-market strategy, delivery methodology, team optimization, and people management."
      }
    ]
  };
  res.json(metricsData);
});

router.post('/jira', async (req, res) => {
  const jiraUrl = 'https://acquiaps.atlassian.net/rest/api/3/issue';
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  try {
    const response = await axios.post(jiraUrl, req.body, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Jira API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Jira API call failed', details: error.response?.data || error.message });
  }
});

// Mount the router at /api
app.use('/api', router);

module.exports.handler = serverless(app);
