document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('starForm');
  const repoUrlInput = document.getElementById('repoUrl');
  const noteInput = document.getElementById('noteText');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const directUrlSpan = document.getElementById('directUrl');
  
  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const repoUrl = repoUrlInput.value.trim();
    
    if (!isValidGithubUrl(repoUrl)) {
      alert('Please enter a valid GitHub repository URL');
      return;
    }
    
    try {
      // Show loading state
      form.querySelector('button').textContent = 'Generating...';
      form.querySelector('button').disabled = true;
      
      // Get the note text
      const note = noteInput.value.trim();
      
      // Generate image URL with note parameter if provided
      let imageUrl = `/generate?url=${encodeURIComponent(repoUrl)}`;
      if (note) {
        imageUrl += `&note=${encodeURIComponent(note)}`;
      }
      
      // Update preview image with a timestamp to prevent caching
      const timestamp = new Date().getTime();
      previewImage.src = `${imageUrl}&t=${timestamp}`;
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        previewImage.onload = resolve;
        previewImage.onerror = reject;
      });
      
      // Show preview container
      previewContainer.style.display = 'block';
      
      // Extract owner and repo from input (handles both full URL and org/repo format)
      let owner, repo;
      
      // Check if it's a full GitHub URL
      const fullUrlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (fullUrlMatch && fullUrlMatch.length >= 3) {
        owner = fullUrlMatch[1];
        repo = fullUrlMatch[2].split('#')[0].split('?')[0]; // Remove any fragments or query params
      } else {
        // Try org/repo format
        const simpleMatch = repoUrl.match(/^([^\/\s]+)\/([^\/\s]+)$/);
        if (simpleMatch && simpleMatch.length >= 3) {
          owner = simpleMatch[1];
          repo = simpleMatch[2].split('#')[0].split('?')[0]; // Remove any fragments or query params
        }
      }
      
      if (owner && repo) {
        // Update direct URL, including note if provided (simplified path)
        let directUrl = `${window.location.origin}/${owner}/${repo}`;
        if (note) {
          directUrl += `?note=${encodeURIComponent(note)}`;
        }
        directUrlSpan.textContent = directUrl;
      } else {
        directUrlSpan.textContent = 'Invalid repository format';
      }
      
      // Show buttons
      downloadBtn.classList.remove('hidden');
      copyUrlBtn.classList.remove('hidden');
      
      // Setup download button
      downloadBtn.onclick = () => {
        downloadImage(imageUrl, getRepoName(repoUrl));
      };
      
      // Setup copy URL button
      copyUrlBtn.onclick = () => {
        copyToClipboard(directUrl);
      };
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      // Reset form button
      form.querySelector('button').textContent = 'Generate Image';
      form.querySelector('button').disabled = false;
    }
  });
  
  /**
   * Validate GitHub repository input (can be full URL or org/repo format)
   * @param {string} input - Input to validate
   * @returns {boolean} - Whether input is valid
   */
  function isValidGithubUrl(input) {
    // Full GitHub URL format (https://github.com/owner/repo)
    const fullUrlPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/;
    
    // Simple org/repo format (owner/repo)
    const simplePattern = /^[^\/\s]+\/[^\/\s]+$/;
    
    return fullUrlPattern.test(input) || simplePattern.test(input);
  }
  
  /**
   * Extract repository name from input (handles both URL and org/repo format)
   * @param {string} input - GitHub repository input
   * @returns {string} - Repository name
   */
  function getRepoName(input) {
    // Check if it's a full GitHub URL
    const fullUrlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (fullUrlMatch && fullUrlMatch.length >= 3) {
      return `${fullUrlMatch[1]}_${fullUrlMatch[2].split('#')[0].split('?')[0]}`;
    }
    
    // Try org/repo format
    const simpleMatch = input.match(/^([^\/\s]+)\/([^\/\s]+)$/);
    if (simpleMatch && simpleMatch.length >= 3) {
      return `${simpleMatch[1]}_${simpleMatch[2].split('#')[0].split('?')[0]}`;
    }
    
    return 'repository';
  }
  
  /**
   * Download image as PNG file
   * @param {string} url - Image URL
   * @param {string} filename - Filename without extension
   */
  async function downloadImage(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${filename}_stars.png`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 100);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Temporary feedback
        const originalText = copyUrlBtn.textContent;
        copyUrlBtn.textContent = 'Copied!';
        
        setTimeout(() => {
          copyUrlBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        
        // Fallback method for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
          const originalText = copyUrlBtn.textContent;
          copyUrlBtn.textContent = 'Copied!';
          
          setTimeout(() => {
            copyUrlBtn.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Fallback: Failed to copy text:', err);
          alert('Failed to copy URL. Please copy it manually.');
        }
        
        document.body.removeChild(textarea);
      });
  }
  
  // Check if URL has a repository path on page load (org/repo format)
  const path = window.location.pathname;
  // Match pattern like /owner/repo
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)$/);
  
  if (pathMatch && pathMatch.length >= 3) {
    const owner = pathMatch[1];
    const repo = pathMatch[2];
    repoUrlInput.value = `https://github.com/${owner}/${repo}`;
    form.dispatchEvent(new Event('submit'));
  }
});