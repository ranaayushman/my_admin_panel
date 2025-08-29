import axios, { AxiosRequestConfig } from 'axios';
import { getApiEndpoint } from '@/utils/api';
import Cookies from 'js-cookie';
import { AuthResponse, LoginCredentials } from '@/types';

// Create an axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API services
export const authApi = {
  login: (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>(
      getApiEndpoint('/login'), 
      credentials
    );
  },
  
  logout: () => {
    return apiClient.post(getApiEndpoint('/logout'));
  },
  
  // Add more auth-related API calls here
};

// Users API services (for admin operations)
export const usersApi = {
  getAllUsers: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('users'), config);
  },
  
  getUserById: (id: string) => {
    return apiClient.get(getApiEndpoint(`users/${id}`));
  },
  
  createUser: (userData: any) => {
    return apiClient.post(getApiEndpoint('users'), userData);
  },
  
  updateUser: (id: string, userData: any) => {
    return apiClient.put(getApiEndpoint(`users/${id}`), userData);
  },
  
  deleteUser: (id: string) => {
    return apiClient.delete(getApiEndpoint(`users/${id}`));
  },
  
  // Add more user-related API calls here
};

// Members API services
export const membersApi = {
  getAllMembers: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('/members'), config);
  },
  
  verifyMember: (id: string) => {
    return apiClient.patch(getApiEndpoint(`/members/${id}/verify`));
  },
  
  deleteMember: (id: string) => {
    return apiClient.delete(getApiEndpoint(`/members/${id}`));
  },
  
  createMember: (formData: FormData) => {
    // Use FormData for file uploads
    return apiClient.post(getApiEndpoint('/members'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Override content type for file upload
      },
    });
  },
};

export default {
  auth: authApi,
  users: usersApi,
  members: membersApi,
};
