require('dotenv').config();
const express = require('express');
const path = require('path');
const { fetchRepoData } = require('./github');
const { generateStarImage } = require('./imageGenerator');

const app = express();
const PORT = process.env.PORT || 5005;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Generate image from query parameter
app.get('/generate', async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }
    
    const repoData = await fetchRepoData(req.query.url);
    // Pass the note to the image generator if provided
    const note = req.query.note || '';
    const imageBuffer = await generateStarImage(repoData, note);
    
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Generate image with username/repo path parameter (simplified URL)
app.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const githubUrl = `https://github.com/${owner}/${repo}`;
    
    const repoData = await fetchRepoData(githubUrl);
    // Check for note in query parameters
    const note = req.query.note || '';
    const imageBuffer = await generateStarImage(repoData, note);
    
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});