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
    // Try to use HTTPS with Tailscale MagicDNS first (recommended for Mixed Content)
    // Fallback to HTTP IP if HTTPS doesn't work
    // Tailscale MagicDNS domain: crm-mini.tail34e202.ts.net
    // IP: 100.74.73.107 (HTTP fallback: http://100.74.73.107:3002)
    
    // Prefer HTTPS if available (fixes Mixed Content)
    // If GitHub Actions secret is set, use it (could be either HTTP or HTTPS)
    // Otherwise, try HTTPS first
    console.warn('⚠️ GitHub Pages detected but no VITE_API_BASE_URL environment variable. Set BACKEND_API_URL secret in GitHub Actions.')
    console.log('🔐 Attempting HTTPS first (https://crm-mini.tail34e202.ts.net:3002)')
    
    // Use HTTPS to avoid Mixed Content issues
    // Note: Tailscale MagicDNS should support HTTPS, but may require cert setup
    // If HTTPS fails, browsers will fallback or show warning
    return 'https://crm-mini.tail34e202.ts.net:3002'
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
