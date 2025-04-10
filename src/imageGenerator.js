// Try to require Sharp, but fail gracefully if it's not available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, falling back to SVG mode:', error.message);
}

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
 * @returns {Buffer} - SVG buffer
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

  // Image dimensions (1:1 ratio)
  const width = 800;
  const height = 800;

  // Format star count
  const starCount = formatStarCount(repoData.stars);

  // Create beautiful SVG with gradient backgrounds and better styling
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
      <defs>
        <!-- Background gradient -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2B3137" />
          <stop offset="100%" stop-color="#1B2025" />
        </linearGradient>
        
        <!-- Star gradient -->
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD700" />
          <stop offset="100%" stop-color="#FFA500" />
        </linearGradient>
        
        <!-- Simple glow effect that works in SVG without filters -->
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2A3036" />
          <stop offset="100%" stop-color="#1A1F24" />
        </linearGradient>
        
        <!-- Circle decoration gradients -->
        <radialGradient id="circle1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.01)" />
        </radialGradient>
        
        <radialGradient id="circle2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.05)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.01)" />
        </radialGradient>
      </defs>

      <!-- Background with gradient -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />
      
      <!-- Decorative elements -->
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="80" fill="url(#circle1)" />
      <circle cx="${width * 0.15}" cy="${height * 0.85}" r="120" fill="url(#circle2)" />
      
      <!-- Add stars in background -->
      ${Array.from({ length: 50 }, (_, i) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.3 + 0.1;
        return `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}" />`;
      }).join('')}

      <!-- Center content container with gradient and subtle shadow -->
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.8}" height="${height * 0.8}" rx="20" 
        fill="url(#cardGradient)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

      ${note ? `
      <!-- Custom Note -->
      <text x="50%" y="${height * 0.32}" font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" font-size="32" 
        font-weight="bold" fill="white" text-anchor="middle">${note}</text>
      ` : ''}

      <!-- Star count with gradient fill -->
      <text x="50%" y="${note ? height * 0.5 : height * 0.45}" font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" 
        font-size="120" font-weight="bold" fill="url(#starGradient)" text-anchor="middle">${starCount}</text>

      <!-- Star icon and text -->
      <text x="50%" y="${note ? height * 0.65 : height * 0.6}" font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" 
        font-size="48" fill="white" text-anchor="middle">⭐ STARS</text>

      <!-- GitHub logo and Repository info in a centered container -->
      <g>
        <!-- Background capsule for the repo info -->
        <rect x="${width/2 - 180}" y="${height * 0.75 - 15}" width="360" height="40" rx="20" 
          fill="rgba(255,255,255,0.1)" />
        
        <!-- GitHub icon -->
        <svg x="${width/2 - 160}" y="${height * 0.75 - 8}" width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
        
        <!-- Repository name - centered in the capsule and properly aligned -->
        <text x="50%" y="${height * 0.75 + 10}" font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" font-size="22" 
          fill="white" text-anchor="middle" transform="translate(10, 0)">${repoData.fullName}</text>
      </g>

      <!-- Subtle mkstar branding with a slight glow -->
      <text x="${width - 25}" y="${height - 15}" font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" 
        font-size="16" fill="#dddddd" text-anchor="end" opacity="0.6">mkstar</text>
    </svg>
  `;

  // Try to convert SVG to PNG if Sharp is available
  if (sharp) {
    try {
      // Use a unique cache key for the PNG version
      const pngCacheKey = `png_${cacheKey}`;
      
      // Check if PNG is in cache
      if (imageCache.has(pngCacheKey)) {
        return imageCache.get(pngCacheKey);
      }
      
      // Convert SVG to PNG (with safety settings for Netlify)
      const pngBuffer = await sharp(Buffer.from(svg), {
        density: 150,  // Lower density to reduce memory usage
        limitInputPixels: false
      })
      .png({
        compressionLevel: 8,
        quality: 90
      })
      .toBuffer();
      
      // Store in cache (limited to 100 entries to prevent memory issues)
      if (imageCache.size >= 100) {
        // Remove the oldest entry
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
      imageCache.set(pngCacheKey, pngBuffer);
      
      return pngBuffer;
    } catch (error) {
      console.error('Error converting SVG to PNG:', error);
      // Continue to SVG fallback
    }
  }
  
  // Fallback to SVG if Sharp is not available or conversion fails
  console.log('Using SVG fallback mode');
  const svgBuffer = Buffer.from(svg);
  
  // Cache the SVG result
  if (imageCache.size >= 100) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  imageCache.set(cacheKey, svgBuffer);
  
  return svgBuffer;
}

module.exports = {
  generateStarImage
};