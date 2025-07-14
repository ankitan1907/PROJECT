import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const fetchAnomalies = async () => {
  try {
    const response = await api.get('/anomalies');
    return response.data;
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    throw error;
  }
};

export const fetchBiodiversity = async () => {
  try {
    const response = await api.get('/biodiversity');
    return response.data;
  } catch (error) {
    console.error('Error fetching biodiversity data:', error);
    throw error;
  }
};

export const fetchDisasterPredictions = async () => {
  try {
    const response = await api.get('/disaster-predictions');
    return response.data;
  } catch (error) {
    console.error('Error fetching disaster predictions:', error);
    throw error;
  }
};

export const fetchMapFeatures = async () => {
  try {
    const response = await api.get('/map-features');
    return response.data;
  } catch (error) {
    console.error('Error fetching map features:', error);
    throw error;
  }
};

export const fetchHistoricalData = async () => {
  try {
    const response = await api.get('/historical-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const fetchResearchData = async () => {
  try {
    const response = await api.get('/research-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching research data:', error);
    throw error;
  }
};

export const fetchResearchDataByFilename = async (filename) => {
  try {
    const response = await api.get(`/research-data/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching research data file:', error);
    throw error;
  }
};

export const uploadResearchData = async (formData) => {
  try {
    const response = await api.post('/upload-research-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading research data:', error);
    throw error;
  }
};

export default api;