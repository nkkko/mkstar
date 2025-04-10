# StarMaker

StarMaker is a web service that generates shareable square images displaying a GitHub repository's star count. These images are designed for social media sharing to celebrate star count milestones.

## Features

- Generate 1:1 square images showing a GitHub repository's star count
- Add optional custom notes to celebrate milestones
- Accept GitHub repository URLs directly or as part of the service URL
- Simple and responsive web interface
- Direct image download
- Copy shareable image URL

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/starmaker.git
cd starmaker
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file (optional)
```
PORT=5005
# Add GitHub token for higher rate limits (optional)
# GITHUB_TOKEN=your_github_token
```

4. Start the server
```
npm start
```

For development with auto-reload:
```
npm run dev
```

5. Open your browser and navigate to `http://localhost:5005`

## Usage

### Web Interface

1. Enter a GitHub repository in one of these formats:
   - Simple: `username/repository`  
   - Full URL: `https://github.com/username/repository`
2. Click "Generate Image"
3. Preview the generated image
4. Download or copy the direct URL

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- GitHub API
- Node.js and Express
- Sharp for image processing