const axios = require('axios');

/**
 * Extract owner and repo from a GitHub repository input (URL or org/repo format)
 * @param {string} input - GitHub repository input
 * @returns {Object} - Owner and repo name
 */
function parseGithubUrl(input) {
  // Handle URLs like https://github.com/owner/repo
  const urlPattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
  const urlMatch = input.match(urlPattern);
  
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].split('#')[0].split('?')[0] // Remove any fragments or query params
    };
  }
  
  // Handle simple org/repo format (owner/repo)
  const simplePattern = /^([^\/\s]+)\/([^\/\s]+)$/;
  const simpleMatch = input.match(simplePattern);
  
  if (simpleMatch) {
    return {
      owner: simpleMatch[1],
      repo: simpleMatch[2].split('#')[0].split('?')[0] // Remove any fragments or query params
    };
  }
  
  throw new Error('Invalid GitHub repository format. Please use either "owner/repo" or a full GitHub URL.');
}

/**
 * Fetch repository data from GitHub API
 * @param {string} input - GitHub repository input (URL or org/repo format)
 * @returns {Promise<Object>} - Repository data including star count
 */
async function fetchRepoData(input) {
  try {
    const { owner, repo } = parseGithubUrl(input);
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    const headers = {
      Accept: 'application/vnd.github.v3+json'
    };
    
    // Add authorization header if GitHub token is available
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(apiUrl, { headers });
    
    return {
      name: response.data.name,
      fullName: response.data.full_name,
      stars: response.data.stargazers_count,
      url: response.data.html_url,
      description: response.data.description
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Repository not found');
    } else if (error.response && error.response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again later or add a GitHub token.');
    }
    
    throw new Error(`Error fetching repository data: ${error.message}`);
  }
}

module.exports = {
  parseGithubUrl,
  fetchRepoData
};