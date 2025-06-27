import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const validateVariant = async (variant, assembly = 'GRCh38', transcriptSet = 'mane') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/validate`, {
      variant,
      assembly,
      transcript_set: transcriptSet
    });
    return response.data;
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
};

export const getExamples = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/examples`);
    return response.data;
  } catch (error) {
    console.error('Error fetching examples:', error);
    return [];
  }
};