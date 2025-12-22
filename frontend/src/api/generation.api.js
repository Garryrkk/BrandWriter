/**
 * Generation API Service
 * Handles all API calls for content generation and improvement
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Regenerate content with custom modifiers
 * @param {Object} params - Generation parameters
 * @param {string} params.platform - Platform (linkedin, instagram, etc.)
 * @param {string} params.category - Content category
 * @param {string} params.brand_id - Brand identifier
 * @param {string} params.base_content_id - Original content ID
 * @param {Object} params.prompt_modifiers - Improvement modifiers
 * @returns {Promise<Object>} Generated content
 */
export const regenerateWithModifiers = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generation/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error regenerating content:', error);
    throw error;
  }
};

/**
 * Generate new content
 * @param {Object} params - Generation parameters
 * @param {string} params.platform - Platform
 * @param {string} params.category - Category
 * @param {string} params.brand_id - Brand ID
 * @param {string} params.prompt - Optional custom prompt
 * @returns {Promise<Object>} Generated content
 */
export const generateContent = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generation/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

/**
 * Save edited content
 * @param {string} contentId - Content ID
 * @param {Object} updates - Updated content fields
 * @returns {Promise<Object>} Updated content
 */
export const saveEditedContent = async (contentId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

/**
 * Delete content
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteContent = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

/**
 * Add content to basket
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Result
 */
export const addToBasket = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/basket/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content_id: contentId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to basket:', error);
    throw error;
  }
};

/**
 * Save content as draft
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Result
 */
export const saveToDraft = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/drafts/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content_id: contentId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

/**
 * Fetch content by ID
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Content object
 */
export const fetchContent = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

export default {
  regenerateWithModifiers,
  generateContent,
  saveEditedContent,
  deleteContent,
  addToBasket,
  saveToDraft,
  fetchContent,
};