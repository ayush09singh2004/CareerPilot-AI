import authService from './authService';

const { authAxios } = authService;

// Create a new resume
const createResume = async (resumeData) => {
  const response = await authAxios.post('/resume', resumeData);
  return response.data;
};

// Get all resumes for current user
const getResumes = async () => {
  const response = await authAxios.get('/resume');
  return response.data;
};

// Update a resume by ID
const updateResume = async (id, resumeData) => {
  const response = await authAxios.put(`/resume/${id}`, resumeData);
  return response.data;
};

// Delete a resume by ID
const deleteResume = async (id) => {
  const response = await authAxios.delete(`/resume/${id}`);
  return response.data;
};

// Get available templates
const getTemplates = async () => {
  const response = await authAxios.get('/resume/templates');
  return response.data;
};

// Upload resume for extraction
const uploadResume = async (formData) => {
  const response = await authAxios.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get a single resume by ID
const getResumeById = async (id) => {
  const response = await authAxios.get(`/resume/${id}`);
  return response.data;
};

const resumeService = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getTemplates,
  uploadResume
};

export default resumeService;
