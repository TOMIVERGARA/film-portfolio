/**
 * Client-side API utilities with automatic authentication
 */

export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

interface AuthenticatedFetchOptions extends RequestInit {
    requireAuth?: boolean; // Default: true for admin endpoints
}

/**
 * Fetch wrapper that automatically injects authentication token
 * Redirects to login if authentication fails
 */
export async function authenticatedFetch(
    url: string,
    options: AuthenticatedFetchOptions = {}
): Promise<Response> {
    const { requireAuth = true, headers = {}, ...fetchOptions } = options;

    // Prepare headers
    const finalHeaders: HeadersInit = { ...headers };

    // Inject authentication token if required
    if (requireAuth) {
        const token = getAuthToken();

        if (!token) {
            // No token available, redirect to login
            handleAuthenticationFailure();
            throw new AuthenticationError('No authentication token found');
        }

        (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: finalHeaders,
        });

        // Handle authentication/authorization errors
        if (response.status === 401) {
            handleAuthenticationFailure();
            throw new UnauthorizedError('Session expired or invalid');
        }

        if (response.status === 403) {
            throw new UnauthorizedError('Insufficient permissions');
        }

        return response;
    } catch (error) {
        // If it's a network error or our custom errors, rethrow
        if (error instanceof AuthenticationError || error instanceof UnauthorizedError) {
            throw error;
        }

        // For other errors, wrap them
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Convenience method for JSON requests
 */
export async function authenticatedFetchJSON<T = any>(
    url: string,
    options: AuthenticatedFetchOptions = {}
): Promise<T> {
    const response = await authenticatedFetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Convenience method for POST requests with JSON body
 */
export async function authenticatedPost<T = any>(
    url: string,
    body: any,
    options: AuthenticatedFetchOptions = {}
): Promise<T> {
    return authenticatedFetchJSON<T>(url, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify(body),
    });
}

/**
 * Convenience method for PUT requests with JSON body
 */
export async function authenticatedPut<T = any>(
    url: string,
    body: any,
    options: AuthenticatedFetchOptions = {}
): Promise<T> {
    return authenticatedFetchJSON<T>(url, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify(body),
    });
}

/**
 * Convenience method for DELETE requests
 */
export async function authenticatedDelete<T = any>(
    url: string,
    options: AuthenticatedFetchOptions = {}
): Promise<T> {
    return authenticatedFetchJSON<T>(url, {
        ...options,
        method: 'DELETE',
    });
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('auth_token');
}

/**
 * Handle authentication failure by redirecting to login
 */
function handleAuthenticationFailure(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Clear stored token
    localStorage.removeItem('auth_token');

    // Redirect to login page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
        window.location.href = '/login';
    }
}

/**
 * Store authentication token
 */
export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.setItem('auth_token', token);
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem('auth_token');
}

/**
 * Check if user is authenticated (has a token)
 * Note: This doesn't verify if the token is valid, just if it exists
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}
