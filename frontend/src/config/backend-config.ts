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
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 2. If running on GitHub Pages, use Tailscale URL
  // The URL should be set in GitHub Actions secrets or environment variables
  if (isGitHubPages) {
    // Your Tailscale IP: 100.74.73.107
    // Note: This is a fallback - GitHub Actions should set VITE_API_BASE_URL via secret
    // For GitHub Pages, the backend URL should be set in GitHub Actions secrets as BACKEND_API_URL
    console.warn('⚠️ GitHub Pages detected but no VITE_API_BASE_URL environment variable. Set BACKEND_API_URL secret in GitHub Actions.')
    // CRITICAL: For Mixed Content issues, we need to use the Tailscale IP directly
    // Use http (not https) because Tailscale is already encrypted
    return 'http://100.74.73.107:3002'
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
