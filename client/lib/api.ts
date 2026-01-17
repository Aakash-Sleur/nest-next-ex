const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export const apiClient = new ApiClient();