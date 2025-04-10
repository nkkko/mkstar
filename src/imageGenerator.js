const sharp = require('sharp');
const path = require('path');

// Cache to store generated images
const imageCache = new Map();

/**
 * Format star count for display (e.g., 1500 -> 1.5K)
 * @param {number} count - Star count
 * @returns {string} - Formatted star count
 */
function formatStarCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Generate a star celebration image
 * @param {Object} repoData - Repository data including star count
 * @param {string} note - Optional custom note to display above the star count
 * @returns {Promise<Buffer>} - PNG image buffer
 */
async function generateStarImage(repoData, note = '') {
  // Include note in cache key if provided
  const cacheKey = note
    ? `${repoData.fullName}_${repoData.stars}_${note}`
    : `${repoData.fullName}_${repoData.stars}`;

  // Check if image is in cache
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // Image dimensions
  const width = 1200;
  const height = 1200;

  // Format star count
  const starCount = formatStarCount(repoData.stars);

  // Create SVG for the image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2B3137" />
          <stop offset="100%" stop-color="#1B2025" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
          <feOffset dx="0" dy="0" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.7" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD700" />
          <stop offset="100%" stop-color="#FFA500" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />

      <!-- Decorative circles -->
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="120" fill="#ffffff08" />
      <circle cx="${width * 0.2}" cy="${height * 0.8}" r="150" fill="#ffffff08" />

      <!-- Stars pattern -->
      <g opacity="0.3">
        ${Array.from({ length: 80 }, (_, i) => {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 3 + 1;
          return `<circle cx="${x}" cy="${y}" r="${size}" fill="white" />`;
        }).join('')}
      </g>

      <!-- Center content container with subtle border -->
      <rect x="${width * 0.15}" y="${width * 0.15}" width="${width * 0.7}" height="${height * 0.7}" rx="20" fill="#ffffff05" stroke="#ffffff10" stroke-width="2" />

      ${note ? `
      <!-- Custom Note -->
      <g filter="url(#glow)">
        <text x="50%" y="${height * 0.3}" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">${note}</text>
      </g>
      ` : ''}

      <!-- Star count -->
      <g filter="url(#glow)">
        <text x="50%" y="${note ? height * 0.5 : height * 0.45}" font-family="Helvetica, Arial, sans-serif" font-size="180" font-weight="bold" fill="url(#star-gradient)" text-anchor="middle">${starCount}</text>

        <!-- Star icon next to STARS text -->
        <text x="${width * 0.39}" y="${note ? height * 0.62 : height * 0.57}" font-family="Arial, sans-serif" font-size="60" fill="#FFD700">⭐</text>
        <text x="${width * 0.46}" y="${note ? height * 0.62 : height * 0.57}" font-family="Helvetica, Arial, sans-serif" font-size="60" fill="white" letter-spacing="1">STARS</text>
      </g>

      <!-- Better approach with foreign object to ensure alignment -->
      <g>
        <!-- Center alignment helper -->
        <rect x="${width/2 - 250}" y="${height * 0.77}" width="500" height="40" fill="none" />

        <!-- Repository info container -->
        <g>
          <!-- GitHub logo - larger size -->
          <svg x="${width/2 - 175}" y="${height * 0.76}" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.521 21.27 9.521 21.006C9.521 20.742 9.499 19.758 9.499 18.871C7 19.42 6.35 18.357 6.15 17.775C6.037 17.488 5.6 16.601 5.15 16.337C4.775 16.126 4.275 15.577 5.137 15.565C5.95 15.553 6.541 16.289 6.75 16.588C7.75 18.139 9.137 17.813 9.557 17.549C9.649 16.873 9.917 16.421 10.217 16.166C7.975 15.911 5.65 15.026 5.65 11.286C5.65 10.259 6.05 9.417 6.775 8.756C6.675 8.505 6.325 7.491 7.025 6.121C7.025 6.121 7.962 5.866 9.521 7.086C10.325 6.866 11.175 6.756 12.025 6.756C12.875 6.756 13.725 6.866 14.529 7.086C16.087 5.855 17.025 6.121 17.025 6.121C17.725 7.491 17.375 8.505 17.275 8.756C18 9.417 18.4 10.247 18.4 11.286C18.4 15.037 16.063 15.911 13.821 16.166C14.21 16.483 14.55 17.105 14.55 18.072C14.55 19.468 14.529 20.655 14.529 21.006C14.529 21.27 14.712 21.592 15.212 21.489C17.1938 20.817 18.911 19.5149 20.1371 17.7702C21.3632 16.0255 21.9994 13.9453 22 11.817C22 6.477 17.523 2 12 2Z" fill="white"/>
          </svg>

          <!-- Repository name - centered vertically with the logo -->
          <text x="${width/2 - 125}" y="${height * 0.775 + 15}" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="white" letter-spacing="0.5">${repoData.fullName}</text>
        </g>
      </g>

      <!-- Subtle mkstar branding in bottom right corner -->
      <text x="${width - 60}" y="${height - 15}" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#bbbbbb" text-anchor="end">mkstar</text>
    </svg>
  `;

  // Convert SVG to PNG
  const imageBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // Store in cache (limited to 100 entries to prevent memory issues)
  if (imageCache.size >= 100) {
    // Remove the oldest entry
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  imageCache.set(cacheKey, imageBuffer);

  return imageBuffer;
}

module.exports = {
  generateStarImage
};