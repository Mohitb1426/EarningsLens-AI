import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message, conversationId = null) => {
    // Return fetch response for SSE streaming
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/chat`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  },
};

// Conversations APIs
export const conversationsAPI = {
  getAll: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },
};

export default api;
