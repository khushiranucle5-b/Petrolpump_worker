/**
 * Global Application Configuration
 * Configurable for development, staging, and production environments
 */
export const CONFIG = {
  APP_NAME: 'PetrolPump Worker',
  APP_VERSION: '1.0.0',
  
  // API URL - Changeable via environment or build variant
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.petrolpump.example.com/api/v1',
  
  // Request timeout in ms
  API_TIMEOUT: 15000,
  
  // Feature flag to enable isolated mock service fallback when backend is unreachable or offline
  USE_MOCK_FALLBACK: true,
  
  // Mock delay in ms for realistic loading UX
  MOCK_DELAY_MS: 600,
  
  // QR Token validity window buffer (seconds)
  QR_VALIDITY_WINDOW_SECONDS: 60,
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@petrolpump_worker_auth_token',
    REFRESH_TOKEN: '@petrolpump_worker_refresh_token',
    USER_DATA: '@petrolpump_worker_user_data',
    APP_SETTINGS: '@petrolpump_worker_settings',
    OFFLINE_TRANSACTIONS: '@petrolpump_worker_offline_txs',
  },
  
  // Petrol Pump Branches list for registration selection
  DEFAULT_BRANCHES: [
    { id: 'b-01', name: 'Downtown City Station - Branch #104' },
    { id: 'b-02', name: 'West Highway Express - Branch #208' },
    { id: 'b-03', name: 'Metro Airport Road - Branch #312' },
    { id: 'b-04', name: 'East Ring Road Station - Branch #415' },
    { id: 'b-05', name: 'Central Logistics Hub - Branch #520' },
  ],
};
