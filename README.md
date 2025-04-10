# mkstar

<div align="center">
  <img src="https://raw.githubusercontent.com/nkkko/mkstar/main/public/images/github.svg" width="100" height="100" />
  <h1>mkstar</h1>
  <p>Generate beautiful shareable images of your GitHub repository star count for social media</p>
</div>

mkstar is a service that generates shareable square images displaying a GitHub repository's star count. These images are designed for social media sharing to celebrate star count milestones.

## ✨ Features

- Generate 1:1 square images showing a GitHub repository's star count
- Add optional custom notes to celebrate milestones
- Accept GitHub repository URLs directly or using the simple `username/repository` format
- Simple and responsive web interface
- Direct image download
- Copy shareable image URL
- Modern, dark theme design with GitHub branding

## 🚀 Live Demo

Try the application at: [https://mkstar.netlify.app](https://mkstar.netlify.app)

## 🔧 Installation & Local Development

### Prerequisites

- Node.js (v14 or newer)
- npm

### Clone and Install

1. Clone the repository
```
git clone https://github.com/nkkko/mkstar.git
cd mkstar
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the project root (optional)
```
PORT=5005
# Add GitHub token for higher rate limits (optional)
# GITHUB_TOKEN=your_github_token
```

4. Start the server in development mode
```
npm run dev
```

5. For production mode
```
npm start
```

6. Open your browser and navigate to `http://localhost:5005`

## 🎮 Usage

### Web Interface

1. Enter a GitHub repository in one of these formats:
   - Simple: `username/repository`
   - Full URL: `https://github.com/username/repository`
2. Add an optional custom note (e.g., "We reached 1000 stars!")
3. Click "Generate Image"
4. Preview the generated image
5. Download the image or copy the direct URL to share

### API Usage

Generate an image using a direct URL:

```
https://yourdomain.com/username/repository
```

Add a custom note:

```
https://yourdomain.com/username/repository?note=We%20reached%201K%20stars!
```

Or using the generate endpoint:

```
https://yourdomain.com/generate?url=https://github.com/username/repository&note=Thanks%20for%20the%20support!
```

## 🌩️ Deployment

### Docker Deployment

The easiest way to deploy mkstar is using Docker:

```bash
# Build the Docker image
docker build -t mkstar .

# Run the container
docker run -p 5005:5005 mkstar
```

Or with docker-compose:

```bash
docker-compose up -d
```

### Deploy to Vercel

mkstar can be deployed to Vercel with a few simple steps:

1. Fork this repository to your GitHub account

2. Create a vercel.json file in the project root:

```json
{
  "version": 2,
  "builds": [
    { "src": "src/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "src/index.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. Sign up for an account on [Vercel](https://vercel.com/) if you don't have one

4. Install the Vercel CLI:
```
npm install -g vercel
```

5. Login to Vercel:
```
vercel login
```

6. Deploy the project:
```
vercel
```

7. For production deployment:
```
vercel --prod
```

### Deploy to Netlify

1. Fork this repository to your GitHub account

2. Create a netlify.toml file in the project root:

```toml
[build]
  command = "npm install"
  functions = "netlify/functions"
  publish = "public"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

3. Create a netlify/functions/api.js file:

```javascript
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
    
    res.set('Content-Type', 'image/png');
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
    
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

module.exports.handler = serverless(app);
```

4. Install serverless-http:
```
npm install --save serverless-http
```

5. Create a Netlify account: [https://app.netlify.com/signup](https://app.netlify.com/signup)

6. Connect your GitHub repository to Netlify and deploy.

## 🔄 Updates and Maintenance

Check the [TODO.md](TODO.md) file for planned improvements and features.

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements

- GitHub API
- Node.js and Express
- Sharp for image processing