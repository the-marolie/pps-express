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
router.get('/hello', (req, res) => {
  res.send('Hello World from serverless express!');
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
