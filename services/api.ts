import axios, { AxiosRequestConfig } from 'axios';
import { getApiEndpoint } from '@/utils/api';
import Cookies from 'js-cookie';
import { AuthResponse, LoginCredentials, EventParticipantsResponse } from '@/types';

// Create an axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Add a request interceptor to attach the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token'); 
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
    return apiClient.get(getApiEndpoint('/members/admin/all'), config);
  },
  
  verifyMember: (id: string) => {
    return apiClient.patch(getApiEndpoint(`/members/${id}/verify`));
  },
  
  // Toggle the active status of a member
  toggleActive: (id: string, isActive: boolean) => {
    // Assuming backend supports PATCH /members/:id with partial body
    return apiClient.patch(getApiEndpoint(`/members/toggle-status/${id}`), { isActive });
  },
  
  deleteMember: (id: string) => {
    return apiClient.delete(getApiEndpoint(`/members/hard-delete/${id}`));
  },
  
  createMember: (memberData: any) => {
    return apiClient.post(getApiEndpoint('/members'), memberData);
  },
  
  getMemberById: (id: string) => {
    return apiClient.get(getApiEndpoint(`/members/${id}`));
  },
  
  updateMember: (id: string, memberData: any) => {
    return apiClient.put(getApiEndpoint(`/members/${id}`), memberData);
  },
};

// Events API services
export const eventsApi = {
  getAllEvents: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('/events'), config);
  },
  
  getEventById: (id: string) => {
    return apiClient.get(getApiEndpoint(`/events/${id}`));
  },
  
  createEvent: (formData: FormData) => {
    // kept for backward compatibility (multipart)
    return apiClient.post(getApiEndpoint('/events'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // JSON-based create/update (preferred): send base64 image strings in JSON
  createEventJson: (payload: any) => {
    return apiClient.post(getApiEndpoint('/events'), payload);
  },

  updateEvent: (id: string, formDataOrJson: any) => {
    // if it's FormData, send multipart, otherwise send JSON
    if (formDataOrJson instanceof FormData) {
      return apiClient.put(getApiEndpoint(`/events/${id}`), formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.put(getApiEndpoint(`/events/${id}`), formDataOrJson);
  },
  
  deleteEvent: (id: string) => {
    return apiClient.delete(getApiEndpoint(`/events/${id}`));
  },
  
  // Contact info endpoints
  getContact: (eventId: string) => {
    return apiClient.get(getApiEndpoint(`/events/${eventId}/contact`));
  },

  updateContact: (eventId: string, contactInfo: Array<any>) => {
    return apiClient.put(getApiEndpoint(`/events/${eventId}/contact`), { contactInfo });
  },
  
  getEventParticipants: (eventId: string) => {
    return apiClient.get<EventParticipantsResponse>(getApiEndpoint(`/event-participant/sheet/${eventId}`));
  },
};

export default {
  auth: authApi,
  users: usersApi,
  members: membersApi,
  events: eventsApi,
};
