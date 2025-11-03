// Backend configuration for dual environment support
// Supports both local development and GitHub Pages deployment
// 
// Local Development: Uses localhost:3002
// GitHub Pages: Uses VITE_API_BASE_URL environment variable or fallback

const isGitHubPages = window.location.hostname === 'bennyg83.github.io' || 
                      window.location.hostname.includes('github.io')

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // 1. Check environment variable (set in GitHub Actions or .env file)
  // This can be your Tailscale URL (e.g., http://your-tailscale-ip:3002)
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL
    // Ensure URL is normalized (no trailing slash)
    return url.replace(/\/$/, '')
  }
  
  // 2. If running on GitHub Pages, show error
  // The URL should be set in GitHub Actions secrets or environment variables
  // CRITICAL: Never hardcode Tailscale IPs or domains in public repos
  // Use GitHub Secrets: Settings → Secrets → Actions → BACKEND_API_URL
  // NOTE: Backend is HTTP-only, so use http:// not https://
  if (isGitHubPages) {
    // If no environment variable is set, show error instead of using hardcoded values
    console.error('❌ GitHub Pages detected but no VITE_API_BASE_URL environment variable.')
    console.error('   Set BACKEND_API_URL secret in GitHub Actions with your Tailscale URL.')
    console.error('   Format: http://your-tailscale-ip:3002 (HTTP, not HTTPS - backend is HTTP-only)')
    console.error('   Example: http://100.74.73.107:3002')
    
    // Return a placeholder that will fail - forces proper configuration
    // This prevents accidentally exposing Tailscale infrastructure
    return 'http://configure-tailscale-url-in-github-secrets'
  }
  
  // 3. Default: Local development
  return 'http://localhost:3002'
}

const apiBaseUrl = getApiBaseUrl()
const wsUrl = apiBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://')

export const BACKEND_CONFIG = {
  API_BASE_URL: apiBaseUrl,
  WS_URL: wsUrl,
  HEALTH_CHECK_URL: `${apiBaseUrl}/health`,
  
  // Connection settings
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Feature flags
  ENABLE_WEBSOCKETS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  
  // Security - allow HTTP for local dev, require HTTPS for production
  ALLOW_INSECURE_CONNECTIONS: !isGitHubPages, // Allow HTTP for development only
  VALIDATE_SSL: isGitHubPages // Validate SSL for GitHub Pages
};

export default BACKEND_CONFIG;
