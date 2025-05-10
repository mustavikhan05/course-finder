import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nsu-scheduler-api.onrender.com/api';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all valid schedules from the API
 * @returns {Promise} Promise that resolves with the schedule data
 */
export const fetchSchedules = async () => {
  try {
    const response = await api.get('/schedules');
    return response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw new Error('Failed to fetch schedules. Please try again later.');
  }
};

/**
 * Fetch system status from the API
 * @returns {Promise} Promise that resolves with the status data
 */
export const fetchStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw new Error('Failed to fetch system status.');
  }
};

export default api; 