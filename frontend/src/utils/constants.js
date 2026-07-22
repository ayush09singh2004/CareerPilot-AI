export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  RESUME_BUILDER: '/resume-builder',
  ANALYSIS: '/analysis',
  JOB_MATCH: '/job-match',
  PROFILE: '/profile',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  RESUME: {
    BASE: '/api/resume',
    BY_ID: (id) => `/api/resume/${id}`,
  },
  ANALYSIS: {
    BASE: '/api/analysis',
  },
  JOB: {
    MATCHES: '/api/job/matches',
    SKILL_GAP: '/api/job/skill-gap',
    RECOMMENDED: '/api/job/recommended',
  },
};
