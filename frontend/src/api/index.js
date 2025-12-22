/**
 * API Module Index
 * Re-exports all API functions for easier imports
 */

export {
  mainApi,
  instaApi,
  setAuthToken,
  clearAuthToken,
  setInstaApiKey,
  clearInstaApiKey,
  isAuthenticated,
  checkAllBackends,
  default as api
} from './client';
