import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const resumeService = {
  getResumes: () => api.get('/resume'),
  createResume: (data) => api.post('/resume', data),
  getResumeById: (id) => api.get(`/resume/${id}`),
  updateResume: (id, data) => api.put(`/resume/${id}`, data),
  deleteResume: (id) => api.delete(`/resume/${id}`),
};

export const analysisService = {
  analyzeResume: (data) => api.post('/analysis', data),
  getAnalysisHistory: () => api.get('/analysis'),
};

export const jobService = {
  getJobMatches: () => api.get('/job/matches'),
  getSkillGap: () => api.get('/job/skill-gap'),
  getRecommendedJobs: () => api.get('/job/recommended'),
};
