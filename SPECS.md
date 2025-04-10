# StarMaker: GitHub Stars Celebration Image Generator

## Project Overview
StarMaker is a service that generates shareable square images displaying a GitHub repository's star count. These images are designed for social media sharing to celebrate star count milestones.

## Core Requirements

1. **GitHub API Integration**
   - Use the GitHub REST API to fetch repository star counts
   - Handle rate limiting and authentication appropriately

2. **Input Methods**
   - Accept GitHub repository URLs in two ways:
     - Direct input via a form
     - As part of the service URL (e.g., `https://localhost:5005/https://github.com/daytonaio/ai-enablement-stack`)

3. **Image Generation**
   - Create a 1:1 square image (recommended size: 1200×1200 pixels)
   - Display the star count prominently in the center
   - Include repository name and optional milestone messaging
   - Design should be visually appealing and social-media ready

## Technical Specifications

### Backend

1. **API Endpoints**
   - `GET /generate` - Accept repo URL as query parameter
   - `GET /:githubUrl` - Accept repo URL as part of the path

2. **Image Processing**
   - Use a library like Sharp, Canvas, or similar for image generation
   - Support PNG output format with transparency
   - Option to customize colors and design elements

3. **Error Handling**
   - Handle invalid URLs gracefully
   - Provide meaningful error messages for GitHub API issues
   - Implement proper logging

### Frontend

1. **Web Interface**
   - Simple, responsive form for URL input
   - Preview of generated image
   - Direct download option
   - "Copy image URL" button for easy sharing

2. **Design Customization (Optional)**
   - Allow users to customize colors, fonts, and layout
   - Provide templates for different occasions (e.g., "We reached 100 stars!")

## Development Guidelines

1. **Technology Stack**
   - Backend: Node.js/Express or similar framework
   - Frontend: Simple HTML/CSS/JS or lightweight framework
   - Image Processing: Canvas API or Sharp
   - Containerization: Docker for easy deployment

2. **Security Considerations**
   - Implement GitHub API token storage securely
   - Validate and sanitize all user inputs
   - Set appropriate cache headers for generated images

3. **Performance**
   - Cache generated images to reduce API calls and processing
   - Optimize image generation for speed
   - Implement reasonable rate limiting

## Deliverables

1. Source code with documentation
2. Docker container for easy deployment
3. API documentation
4. Basic user guide
5. Example images for various star counts

## Implementation Timeline

1. **Phase 1**: Core functionality - GitHub API integration and basic image generation
2. **Phase 2**: Frontend development and design refinement
3. **Phase 3**: Performance optimization, caching, and additional features

## Future Enhancements

1. Support for other repository metrics (forks, contributors)
2. Animation options for milestone celebrations
3. Twitter/social media direct posting integration
4. Custom templates and themes