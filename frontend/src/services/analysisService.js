import authService from './authService';

const { authAxios } = authService;

// Analyze a resume by ID
const analyzeResume = async (resumeId) => {
  const response = await authAxios.post(`/analysis/${resumeId}`);
  return response.data;
};

const analysisService = {
  analyzeResume
};

export default analysisService;
