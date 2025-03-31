
import axios from 'axios';
import { toast } from 'sonner';

// Use the correct base URL - if you're running the API locally on port 8080, this should be:
// For local development:
// const BASE_URL = 'http://localhost:8080/api';
// For hosted environment:
const BASE_URL = 'https://muscle-momentum-api.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    // Handle 401 (Unauthorized) - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) => 
    api.post('/auth/register', userData),
    
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
    
  updatePassword: (passwords: { oldPassword: string; newPassword: string }) => 
    api.put('/users/password', passwords)
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (profileData: { username?: string; weight?: number; height?: number }) => 
    api.put('/users/profile', profileData)
};

// Exercise APIs
export const exerciseAPI = {
  getAll: () => api.get('/exercises'),
  
  getByMuscleGroup: (muscleGroup: string) => 
    api.get(`/exercises/muscle-group/${muscleGroup}`),
    
  getById: (id: string) => api.get(`/exercises/${id}`),
  
  create: (exerciseData: { 
    name: string; 
    muscleGroup: string; 
    description: string; 
    requiresWeight: boolean 
  }) => api.post('/exercises', exerciseData),
  
  initialize: () => api.post('/exercises/initialize')
};

// Workout APIs
export const workoutAPI = {
  create: (workoutData: {
    date: string;
    dayOfWeek: string;
    exercises: {
      exerciseId: string;
      sets: { reps: number; weight: number }[];
    }[];
  }) => api.post('/workouts', workoutData),
  
  getById: (id: string) => api.get(`/workouts/${id}`),
  
  getByDateRange: (startDate: string, endDate: string) => 
    api.get(`/workouts/date-range?startDate=${startDate}&endDate=${endDate}`),
    
  getByDayOfWeek: (dayOfWeek: string) => 
    api.get(`/workouts/day/${dayOfWeek}`),
    
  update: (id: string, workoutData: any) => 
    api.put(`/workouts/${id}`, workoutData),
    
  delete: (id: string) => api.delete(`/workouts/${id}`),
  
  getVolume: (exerciseId: string, date: string) => 
    api.get(`/workouts/volume?exerciseId=${exerciseId}&date=${date}`),
    
  copyWorkout: (id: string, targetDate: string) => 
    api.post(`/workouts/${id}/copy?targetDate=${targetDate}`),
    
  getPreviousByDayOfWeek: (dayOfWeek: string, beforeDate: string) => 
    api.get(`/workouts/previous/${dayOfWeek}?beforeDate=${beforeDate}`)
};

// Template APIs
export const templateAPI = {
  getAll: () => api.get('/templates'),
  
  getSystemTemplates: () => api.get('/templates/system'),
  
  getCustomTemplates: () => api.get('/templates/custom'),
  
  create: (templateData: any) => api.post('/templates', templateData),
  
  update: (id: string, templateData: any) => 
    api.put(`/templates/${id}`, templateData),
    
  delete: (id: string) => api.delete(`/templates/${id}`),
  
  copyTemplate: (id: string) => api.post(`/templates/${id}/copy`)
};

export default api;
