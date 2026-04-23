const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });
    
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
}

export function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
}

export function setToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
}

export function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    const res = await fetch(`${API_URL}${url}`, { ...options, headers });
    if (!res.ok) {
        if (res.status === 401) {
            removeToken();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}

export async function getBooks() {
    return fetchWithAuth('/api/books');
}

export async function getSales() {
    return fetchWithAuth('/api/sales');
}

export async function adminReset() {
    return fetchWithAuth('/api/admin/reset', { method: 'POST' });
}

export async function adminAddJunk() {
    return fetchWithAuth('/api/admin/add-junk', { method: 'POST' });
}
