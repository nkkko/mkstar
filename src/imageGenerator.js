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

  // Image dimensions
  const width = 800;
  const height = 418;

  // Format star count
  const starCount = formatStarCount(repoData.stars);

  // Create simpler SVG without complex filters that might cause issues
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#2B3137" />

      <!-- Center content container -->
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.8}" height="${height * 0.8}" rx="10" fill="#1B2025" stroke="#ffffff10" stroke-width="1" />

      ${note ? `
      <!-- Custom Note -->
      <text x="50%" y="${height * 0.3}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${note}</text>
      ` : ''}

      <!-- Star count -->
      <text x="50%" y="${note ? height * 0.5 : height * 0.45}" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#FFD700" text-anchor="middle">${starCount}</text>

      <!-- Star text -->
      <text x="50%" y="${note ? height * 0.65 : height * 0.6}" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle">⭐ STARS</text>

      <!-- Repository info -->
      <text x="50%" y="${height * 0.8}" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle">${repoData.fullName}</text>

      <!-- Subtle mkstar branding -->
      <text x="${width - 20}" y="${height - 10}" font-family="Arial, sans-serif" font-size="12" fill="#bbbbbb" text-anchor="end">mkstar</text>
    </svg>
  `;

  // Store SVG buffer in cache
  const svgBuffer = Buffer.from(svg);
  
  // Store in cache (limited to 100 entries to prevent memory issues)
  if (imageCache.size >= 100) {
    // Remove the oldest entry
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  imageCache.set(cacheKey, svgBuffer);

  return svgBuffer;
}

module.exports = {
  generateStarImage
};