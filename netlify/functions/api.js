const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const { fetchRepoData } = require('../../src/github');
const { generateStarImage } = require('../../src/imageGenerator');

const app = express();
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.urlencoded({ extended: true }));

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Generate image from query parameter
app.get('/generate', async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }
    
    const repoData = await fetchRepoData(req.query.url);
    const note = req.query.note || '';
    const imageBuffer = await generateStarImage(repoData, note);
    
    // Check if the response is SVG by looking at the first few bytes
    const isSvg = imageBuffer.toString('utf8', 0, 100).includes('<?xml') || 
                  imageBuffer.toString('utf8', 0, 100).includes('<svg');
    
    res.set('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Generate image with username/repo path parameter
app.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const githubUrl = `https://github.com/${owner}/${repo}`;
    
    const repoData = await fetchRepoData(githubUrl);
    const note = req.query.note || '';
    const imageBuffer = await generateStarImage(repoData, note);
    
    // Check if the response is SVG by looking at the first few bytes
    const isSvg = imageBuffer.toString('utf8', 0, 100).includes('<?xml') || 
                  imageBuffer.toString('utf8', 0, 100).includes('<svg');
    
    res.set('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

module.exports.handler = serverless(app);