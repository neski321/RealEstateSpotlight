import { auth } from './firebase';

const API_BASE_URL = '/api';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };
  if (data !== undefined) {
    fetchOptions.body = JSON.stringify(data);
  }
  const res = await fetch(url, fetchOptions);
  await throwIfResNotOk(res);
  return res;
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint),
  
  post: <T = any>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string) => 
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
}; 