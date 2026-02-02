import axios, { AxiosRequestConfig } from 'axios';
import { getApiEndpoint } from '@/utils/api';
import Cookies from 'js-cookie';
import { AuthResponse, LoginCredentials, EventParticipantsResponse } from '@/types';

// -------------------------------------------------------------------
// Axios instance
// -------------------------------------------------------------------
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------------------------------
// AUTH API
// -------------------------------------------------------------------
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
};

// -------------------------------------------------------------------
// USERS API (ADMIN)
// -------------------------------------------------------------------
export const usersApi = {
  getAllUsers: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('/users'), config);
  },

  getUserById: (id: string) => {
    return apiClient.get(getApiEndpoint(`/users/${id}`));
  },

  createUser: (userData: any) => {
    return apiClient.post(getApiEndpoint('/users'), userData);
  },

  updateUser: (id: string, userData: any) => {
    return apiClient.put(getApiEndpoint(`/users/${id}`), userData);
  },

  deleteUser: (id: string) => {
    return apiClient.delete(getApiEndpoint(`/users/${id}`));
  },
};

// -------------------------------------------------------------------
// MEMBERS API
// -------------------------------------------------------------------
export const membersApi = {
  getAllMembers: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('/members/admin/all'), config);
  },

  verifyMember: (id: string) => {
    return apiClient.patch(getApiEndpoint(`/members/${id}/verify`));
  },

  toggleActive: (id: string, isActive: boolean) => {
    return apiClient.patch(
      getApiEndpoint(`/members/toggle-status/${id}`),
      { isActive }
    );
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

  getMemberByIdAdmin: (id: string) => {
    return apiClient.get(getApiEndpoint(`/members/admin/${id}`));
  },

  updateMember: (id: string, memberData: any) => {
    return apiClient.put(getApiEndpoint(`/members/${id}`), memberData);
  },
};

// -------------------------------------------------------------------
// EVENTS API
// -------------------------------------------------------------------
export const eventsApi = {
  getAllEvents: (config?: AxiosRequestConfig) => {
    return apiClient.get(getApiEndpoint('/events'), config);
  },

  getEventById: (id: string) => {
    return apiClient.get(getApiEndpoint(`/events/${id}`));
  },

  createEvent: (formData: FormData) => {
    return apiClient.post(getApiEndpoint('/events'), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createEventJson: (payload: any) => {
    return apiClient.post(getApiEndpoint('/events'), payload);
  },

  updateEvent: (id: string, data: any) => {
    if (data instanceof FormData) {
      return apiClient.put(getApiEndpoint(`/events/${id}`), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.put(getApiEndpoint(`/events/${id}`), data);
  },

  deleteEvent: (id: string) => {
    return apiClient.delete(getApiEndpoint(`/events/${id}`));
  },

  getContact: (eventId: string) => {
    return apiClient.get(getApiEndpoint(`/events/${eventId}/contact`));
  },

  updateContact: (eventId: string, contactInfo: any[]) => {
    return apiClient.put(
      getApiEndpoint(`/events/${eventId}/contact`),
      { contactInfo }
    );
  },

  getEventParticipants: (eventId: string) => {
    return apiClient.get<EventParticipantsResponse>(
      getApiEndpoint(`/event-participant/sheet/${eventId}`)
    );
  },
};

// -------------------------------------------------------------------
// ✅ RECRUITMENT API (FIXED PATHS)
// -------------------------------------------------------------------
const recruitmentBase = '/recruitment';

export const recruitmentApi = {
  createForm: (data: any) => {
    return apiClient.post(getApiEndpoint(`${recruitmentBase}/forms`), data);
  },

  getAllForms: () => {
    return apiClient.get(getApiEndpoint(`${recruitmentBase}/forms`));
  },

  updateForm: (id: string, data: any) => {
    return apiClient.put(
      getApiEndpoint(`${recruitmentBase}/forms/${id}`),
      data
    );
  },

  deleteForm: (id: string) => {
    return apiClient.delete(
      getApiEndpoint(`${recruitmentBase}/forms/${id}`)
    );
  },

  getActiveForm: () => {
    return apiClient.get(
      getApiEndpoint(`${recruitmentBase}/active-form`)
    );
  },

  getStats: () => {
    return apiClient.get(
      getApiEndpoint(`${recruitmentBase}/stats`)
    );
  },

  getAllApplications: (params?: any) => {
    return apiClient.get(
      getApiEndpoint(`${recruitmentBase}/applications`),
      { params }
    );
  },

  updateApplicationStatus: (id: string, status: string) => {
    return apiClient.put(
      getApiEndpoint(`${recruitmentBase}/applications/${id}`),
      { status }
    );
  },

  getRecruitmentData: (params?: any) => {
    return apiClient.get(
      getApiEndpoint(`${recruitmentBase}/getAllRecruitmentData`),
      { params }
    );
  },
};

// -------------------------------------------------------------------
// EXPORT CONSOLIDATED API
// -------------------------------------------------------------------
export default {
  auth: authApi,
  users: usersApi,
  members: membersApi,
  events: eventsApi,
  recruitment: recruitmentApi,
};
