const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    login: async (email: string, password: string) => {
      return this.request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    register: async (email: string, password: string) => {
      return this.request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    googleAuth: async (token: string) => {
      return this.request<{ user: any; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    }
  };

  // Resume endpoints
  resumes = {
    getAll: async () => {
      return this.request<any[]>('/resumes');
    },

    getById: async (id: string) => {
      return this.request<any>(`/resumes/${id}`);
    },

    create: async (data: { title: string; templateId?: string; content: any }) => {
      return this.request<any>('/resumes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { title?: string; content?: any }) => {
      return this.request<any>(`/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request<{ message: string }>(`/resumes/${id}`, {
        method: 'DELETE',
      });
    }
  };

  // Template endpoints
  templates = {
    getAll: async (category?: string, onlyFree?: boolean) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (onlyFree) params.append('onlyFree', 'true');
      
      return this.request<any[]>(`/templates?${params.toString()}`);
    },

    getById: async (id: string) => {
      return this.request<any>(`/templates/${id}`);
    }
  };

  // Scan endpoints
  scans = {
    performATS: async (resumeId: string, jobPosition?: string) => {
      return this.request<any>('/scans/ats', {
        method: 'POST',
        body: JSON.stringify({ resumeId, jobPosition }),
      });
    },

    getHistory: async (resumeId: string) => {
      return this.request<any[]>(`/scans/resume/${resumeId}`);
    }
  };

  // Job endpoints
  jobs = {
    getAll: async (filters?: { location?: string; remote?: boolean; salaryMin?: number }) => {
      const params = new URLSearchParams();
      if (filters?.location) params.append('location', filters.location);
      if (filters?.remote) params.append('remote', 'true');
      if (filters?.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
      
      return this.request<any[]>(`/jobs?${params.toString()}`);
    },

    getMatches: async (resumeId: string, filters?: { location?: string; remote?: boolean }) => {
      const params = new URLSearchParams();
      if (filters?.location) params.append('location', filters.location);
      if (filters?.remote) params.append('remote', 'true');
      
      return this.request<any[]>(`/jobs/matches/${resumeId}?${params.toString()}`);
    },

    generateMatches: async (resumeId: string, location?: string, radius?: number) => {
      return this.request<any>('/jobs/generate-matches', {
        method: 'POST',
        body: JSON.stringify({ resumeId, location, radius }),
      });
    },

    getRemoteJobs: async () => {
      return this.request<any[]>('/jobs/remote');
    }
  };

  // Cover letter endpoints
  coverLetters = {
    getAll: async () => {
      return this.request<any[]>('/cover-letters');
    },

    getById: async (id: string) => {
      return this.request<any>(`/cover-letters/${id}`);
    },

    generate: async (data: { resumeId: string; jobId?: string; jobTitle: string; companyName: string }) => {
      return this.request<any>('/cover-letters/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { title?: string; content?: string }) => {
      return this.request<any>(`/cover-letters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request<{ message: string }>(`/cover-letters/${id}`, {
        method: 'DELETE',
      });
    }
  };
}

export const api = new APIService();
export const authAPI = api.auth;
export const resumeAPI = api.resumes;
export const templateAPI = api.templates;
export const scanAPI = api.scans;
export const jobAPI = api.jobs;
export const coverLetterAPI = api.coverLetters;