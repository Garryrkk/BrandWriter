const API_BASE_URL = '/api';

/**
 * Fetch email statistics for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Stats object with total, new, and repeated counts
 */
export const fetchStatsForDate = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/stats/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Fetch email list for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of email objects with address and type
 */
export const fetchEmailsForDate = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/emails/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

/**
 * Fetch complete dashboard data (stats + emails) for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Object containing stats and emails
 */
export const fetchDashboardData = async (date) => {
  try {
    const [stats, emails] = await Promise.all([
      fetchStatsForDate(date),
      fetchEmailsForDate(date),
    ]);

    return {
      stats,
      emails,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Mock data for development/testing
 * Remove this in production
 */
export const getMockData = (date) => {
  return {
    stats: {
      total: 100,
      new: 85,
      repeated: 15,
    },
    emails: [
      { address: 'user1@example.com', type: 'new' },
      { address: 'user2@example.com', type: 'repeated' },
      { address: 'user3@example.com', type: 'new' },
      { address: 'user4@example.com', type: 'new' },
      { address: 'user5@example.com', type: 'repeated' },
      { address: 'user6@example.com', type: 'new' },
      { address: 'user7@example.com', type: 'new' },
      { address: 'user8@example.com', type: 'repeated' },
      { address: 'user9@example.com', type: 'new' },
      { address: 'user10@example.com', type: 'new' },
    ],
  };
};

export default {
  fetchStatsForDate,
  fetchEmailsForDate,
  fetchDashboardData,
  getMockData,
};