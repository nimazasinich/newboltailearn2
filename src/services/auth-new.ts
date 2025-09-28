import { apiFetch } from './api-new';

export const auth = {
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', { method: 'POST', body: { email, password } }),
  
  register: (email: string, password: string) =>
    apiFetch('/api/auth/register', { method: 'POST', body: { email, password } }),
  
  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),
  
  me: () =>
    apiFetch('/api/auth/me')
};