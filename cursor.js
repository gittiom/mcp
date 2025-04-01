// Add CORS protection
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://your-app-domain.com', 'http://localhost:*'],
  methods: ['POST', 'GET']
}));