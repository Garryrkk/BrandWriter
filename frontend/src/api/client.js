/**
 * API Client for BrandWriter Application
 * Handles connections to both main backend and Insta-App backend
 */

// API Base URLs - These will be proxied through Vite in development
const MAIN_API_BASE = '/api';           // Main backend (port 8000)
const INSTA_API_BASE = '/insta-api';    // Insta-App backend (port 8001)

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token') || '';

// Get API Key for Insta-App (if stored)
const getInstaApiKey = () => localStorage.getItem('insta_api_key') || '';

/**
 * Generic fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
      
      // Handle FastAPI validation errors (422) which return an array of errors
      let errorMessage;
      if (Array.isArray(errorData.detail)) {
        // Format validation errors nicely
        errorMessage = errorData.detail.map(err => {
          const field = err.loc ? err.loc.slice(1).join('.') : 'field';
          return `${field}: ${err.msg}`;
        }).join(', ');
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// =====================================================
// MAIN BACKEND API CLIENT
// =====================================================
export const mainApi = {
  /**
   * Make a request to the main backend
   */
  request: async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        ...customHeaders
      },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    return fetchWithErrorHandling(`${MAIN_API_BASE}${endpoint}`, options);
  },

  // Auth endpoints
  auth: {
    signup: (email, password) => mainApi.request('/auth/signup', 'POST', { email, password }),
    login: (email, password) => mainApi.request('/auth/login', 'POST', { email, password }),
    logout: () => mainApi.request('/auth/logout', 'POST'),
    deleteAccount: () => mainApi.request('/auth/delete-account', 'DELETE'),
  },

  // Brand endpoints
  brands: {
    list: (page = 1, pageSize = 10) => mainApi.request(`/v1/brands/?page=${page}&page_size=${pageSize}`),
    getActive: () => mainApi.request('/v1/brands/active'),
    get: (brandId) => mainApi.request(`/v1/brands/${brandId}`),
    create: (brandData) => mainApi.request('/v1/brands/', 'POST', brandData),
    update: (brandId, brandData) => mainApi.request(`/v1/brands/${brandId}`, 'PATCH', brandData),
    delete: (brandId) => mainApi.request(`/v1/brands/${brandId}`, 'DELETE'),
    setActive: (brandId) => mainApi.request(`/v1/brands/${brandId}/activate`, 'POST'),
    deactivate: (brandId) => mainApi.request(`/v1/brands/${brandId}/deactivate`, 'POST'),
  },

  // Draft endpoints
  drafts: {
    list: (brandId, page = 1, pageSize = 50, filters = {}) => {
      const params = new URLSearchParams({
        brand_id: brandId,
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters
      });
      return mainApi.request(`/v1/drafts/?${params}`);
    },
    get: (draftId) => mainApi.request(`/v1/drafts/${draftId}`),
    create: (draftData) => mainApi.request('/v1/drafts/', 'POST', draftData),
    update: (draftId, draftData) => mainApi.request(`/v1/drafts/${draftId}`, 'PATCH', draftData),
    delete: (draftId) => mainApi.request(`/v1/drafts/${draftId}`, 'DELETE'),
    getStats: (brandId) => mainApi.request(`/v1/drafts/stats?brand_id=${brandId}`),
    bulkDelete: (draftIds) => mainApi.request('/v1/drafts/bulk-delete', 'POST', { draft_ids: draftIds }),
    moveToBin: (draftId) => mainApi.request(`/v1/drafts/${draftId}/bin`, 'POST'),
    restore: (draftId) => mainApi.request(`/v1/drafts/${draftId}/restore`, 'POST'),
  },

  // Basket endpoints
  basket: {
    list: (brandId, page = 1, pageSize = 50, filters = {}) => {
      const params = new URLSearchParams({
        brand_id: brandId,
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters
      });
      return mainApi.request(`/v1/basket/?${params}`);
    },
    get: (itemId) => mainApi.request(`/v1/basket/${itemId}`),
    create: (itemData) => mainApi.request('/v1/basket/', 'POST', itemData),
    update: (itemId, itemData) => mainApi.request(`/v1/basket/${itemId}`, 'PATCH', itemData),
    delete: (itemId) => mainApi.request(`/v1/basket/${itemId}`, 'DELETE'),
    getStats: (brandId) => mainApi.request(`/v1/basket/stats?brand_id=${brandId}`),
    getReady: (brandId, limit = 50) => mainApi.request(`/v1/basket/ready?brand_id=${brandId}&limit=${limit}`),
  },

  // Schedule endpoints
  schedule: {
    list: (brandId, page = 1, pageSize = 50, filters = {}) => {
      const params = new URLSearchParams({
        brand_id: brandId,
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters
      });
      return mainApi.request(`/v1/schedules/?${params}`);
    },
    get: (scheduleId) => mainApi.request(`/v1/schedules/${scheduleId}`),
    create: (scheduleData) => mainApi.request('/v1/schedules/', 'POST', scheduleData),
    update: (scheduleId, scheduleData) => mainApi.request(`/v1/schedules/${scheduleId}`, 'PATCH', scheduleData),
    delete: (scheduleId) => mainApi.request(`/v1/schedules/${scheduleId}`, 'DELETE'),
    cancel: (scheduleId) => mainApi.request(`/v1/schedules/${scheduleId}/cancel`, 'POST'),
    getStats: (brandId) => mainApi.request(`/v1/schedules/stats?brand_id=${brandId}`),
    getCalendar: (brandId, month, year) => mainApi.request(`/v1/schedules/calendar?brand_id=${brandId}&month=${month}&year=${year}`),
    fromBasket: (brandId, basketItemId, scheduledTime) => 
      mainApi.request(`/v1/schedules/from-basket?brand_id=${brandId}`, 'POST', {
        basket_item_id: basketItemId,
        scheduled_time: scheduledTime
      }),
  },

  // Generation endpoints
  generations: {
    list: (brandId, page = 1, pageSize = 10) => 
      mainApi.request(`/v1/generations/?brand_id=${brandId}&page=${page}&page_size=${pageSize}`),
    get: (generationId) => mainApi.request(`/v1/generations/${generationId}`),
    quickGenerate: (brandId, category, platform = null, customPrompt = null) =>
      mainApi.request('/v1/generations/generate', 'POST', {
        brand_id: brandId,
        category,
        platform,
        custom_prompt: customPrompt
      }),
    batchGenerate: (brandId, categories) =>
      mainApi.request('/v1/generations/batch', 'POST', { brand_id: brandId, categories }),
    getStats: (brandId) => mainApi.request(`/v1/generations/stats?brand_id=${brandId}`),
    regenerate: (generationId) => mainApi.request(`/v1/generations/${generationId}/regenerate`, 'POST'),
    delete: (generationId) => mainApi.request(`/v1/generations/${generationId}`, 'DELETE'),
    addFeedback: (generationId, rating, comments = null) =>
      mainApi.request(`/v1/generations/${generationId}/feedback`, 'POST', { rating, feedback: comments }),
    convertToDraft: (generationId) =>
      mainApi.request(`/v1/generations/${generationId}/to-draft`, 'POST'),
  },

  // Template endpoints
  templates: {
    list: (brandId, page = 1, pageSize = 12, filters = {}) => {
      const params = new URLSearchParams({
        brand_id: brandId,
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters
      });
      return mainApi.request(`/v1/templates/?${params}`);
    },
    get: (templateId) => mainApi.request(`/v1/templates/${templateId}`),
    create: (templateData) => mainApi.request('/v1/templates/', 'POST', templateData),
    update: (templateId, templateData) => mainApi.request(`/v1/templates/${templateId}`, 'PATCH', templateData),
    delete: (templateId, hardDelete = false) => 
      mainApi.request(`/v1/templates/${templateId}${hardDelete ? '?hard_delete=true' : ''}`, 'DELETE'),
    duplicate: (templateId, newName) => 
      mainApi.request(`/v1/templates/${templateId}/duplicate?new_name=${encodeURIComponent(newName)}`, 'POST'),
    getStats: (brandId) => mainApi.request(`/v1/templates/stats?brand_id=${brandId}`),
  },

  // History endpoints
  history: {
    list: (brandId, page = 1, pageSize = 50) => 
      mainApi.request(`/v1/history/?brand_id=${brandId}&page=${page}&page_size=${pageSize}`),
    get: (historyId) => mainApi.request(`/v1/history/${historyId}`),
    delete: (historyId) => mainApi.request(`/v1/history/${historyId}`, 'DELETE'),
  },

  // Email Send endpoints
  send: {
    daily: () => mainApi.request('/v1/send/daily', 'POST'),
    pending: () => mainApi.request('/v1/send/pending'),
  },

  // Stats endpoints
  stats: {
    daily: (date) => mainApi.request(`/v1/stats/${date}`),
  },

  // Platform Validation endpoints
  platforms: {
    validate: (platform, content, assets = []) => 
      mainApi.request(`/v1/platforms/validate/${platform}`, 'POST', { content, assets }),
  },

  // Workers endpoints (for manual posting triggers)
  workers: {
    runSchedule: (scheduleId) => mainApi.request(`/v1/workers/run/${scheduleId}`, 'POST'),
    getStatus: (scheduleId) => mainApi.request(`/v1/workers/status/${scheduleId}`),
  },

  // Observability/Logs endpoints
  logs: {
    getPostingLogs: (scheduleId) => mainApi.request(`/v1/logs/posting/${scheduleId}`),
    getPlatformLogs: (platform, limit = 50, status = null) => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (status) params.append('status', status);
      return mainApi.request(`/v1/logs/platform/${platform}?${params}`);
    },
    health: () => mainApi.request('/v1/logs/health'),
  },

  // Dashboard/Stats
  dashboard: {
    getStats: () => mainApi.request('/v1/dashboard/stats'),
  },

  // Health check
  health: () => fetchWithErrorHandling('/health'),
};


// =====================================================
// INSTA-APP BACKEND API CLIENT
// =====================================================
export const instaApi = {
  /**
   * Make a request to the Insta-App backend
   */
  request: async (endpoint, method = 'GET', body = null, requiresApiKey = true) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (requiresApiKey) {
      headers['X-API-Key'] = getInstaApiKey();
    }
    
    const options = {
      method,
      headers,
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    return fetchWithErrorHandling(`${INSTA_API_BASE}${endpoint}`, options);
  },

  // Auth/Account endpoints
  accounts: {
    create: (username, password) => 
      instaApi.request('/auth/create_account', 'POST', { username, password }, false),
  },

  // Posts endpoints
  posts: {
    schedule: (accountUsername, caption, type, mediaIds, scheduledAt) =>
      instaApi.request('/posts/schedule', 'POST', {
        account_username: accountUsername,
        caption,
        type,
        media_ids: mediaIds,
        scheduled_at: scheduledAt
      }),
    postNow: (accountUsername, caption, type, mediaIds, scheduledAt = null) =>
      instaApi.request('/posts/post-now', 'POST', {
        account_username: accountUsername,
        caption,
        type,
        media_ids: mediaIds,
        scheduled_at: scheduledAt || new Date().toISOString()
      }),
  },

  // Instagram posting endpoints (new)
  instagram: {
    post: (scheduleId, caption, assets = []) =>
      instaApi.request('/instagram/post', 'POST', { schedule_id: scheduleId, caption, assets }, false),
    story: (mediaUrl, caption = null) =>
      instaApi.request('/instagram/story', 'POST', { media_url: mediaUrl, caption }, false),
    reel: (mediaUrl, caption = '') =>
      instaApi.request('/instagram/reel', 'POST', { media_url: mediaUrl, caption }, false),
    getStatus: (postId) => instaApi.request(`/instagram/status/${postId}`, 'GET', null, false),
    getInsights: (postId) => instaApi.request(`/instagram/insights/${postId}`, 'GET', null, false),
  },

  // Media endpoints
  media: {
    register: (url, mimeType, brandPostId) =>
      instaApi.request('/media/register', 'POST', { url, mime_type: mimeType, brand_post_id: brandPostId }, false),
  },

  // Health check
  health: () => fetchWithErrorHandling(`${INSTA_API_BASE}/`),
};


// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Set the auth token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Clear the auth token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Set the Insta API key
 */
export const setInstaApiKey = (apiKey) => {
  localStorage.setItem('insta_api_key', apiKey);
};

/**
 * Clear the Insta API key
 */
export const clearInstaApiKey = () => {
  localStorage.removeItem('insta_api_key');
};

/**
 * Check if user is authenticated (main backend)
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Combined health check for both backends
 */
export const checkAllBackends = async () => {
  const results = {
    mainBackend: { status: 'unknown', error: null },
    instaBackend: { status: 'unknown', error: null },
  };
  
  try {
    await mainApi.health();
    results.mainBackend.status = 'healthy';
  } catch (error) {
    results.mainBackend.status = 'unhealthy';
    results.mainBackend.error = error.message;
  }
  
  try {
    await instaApi.health();
    results.instaBackend.status = 'healthy';
  } catch (error) {
    results.instaBackend.status = 'unhealthy';
    results.instaBackend.error = error.message;
  }
  
  return results;
};

// Export default for convenience
export default {
  main: mainApi,
  insta: instaApi,
  setAuthToken,
  clearAuthToken,
  setInstaApiKey,
  clearInstaApiKey,
  isAuthenticated,
  checkAllBackends,
};
