// Alternative HTTP backend configuration for development
// Last updated: 2025-08-18T20:30:00.000Z
// Updated to use localhost for local development

export const BACKEND_CONFIG = {
  API_BASE_URL: 'http://localhost:3002',
  WS_URL: 'ws://localhost:3002',
  HEALTH_CHECK_URL: 'http://localhost:3002/health',
  
  // Connection settings
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Feature flags
  ENABLE_WEBSOCKETS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  
  // Security
  ALLOW_INSECURE_CONNECTIONS: true, // Allow HTTP for development
  VALIDATE_SSL: false // No SSL validation needed for HTTP
};

export default BACKEND_CONFIG;
