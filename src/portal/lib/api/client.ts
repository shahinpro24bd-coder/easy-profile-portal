// @ts-nocheck -- legacy portal code ported from the original Next.js app

const getBaseUrl = (): string => '/api';

const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
  status: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('admin_token');
    if (localToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${localToken}`;
    }
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  try {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal || controller.signal
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: result.message || result.error || `Request failed with status ${response.status}`,
        success: false,
        status: response.status
      };
    }

    return {
      data: result.data !== undefined ? result.data : result,
      pagination: result.pagination,
      success: result.success !== undefined ? result.success : true,
      status: response.status
    };
  } catch (error: any) {
    return {
      error: error?.name === 'AbortError' ? 'Connection timeout. Please verify backend server is active.' : (error?.message || 'Network request failed'),
      success: false,
      status: 500
    };
  }
}
