import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ─── Dynamic API Configuration ───
// The server URL is automatically detected from the Expo dev server IP.
// When you run `expo start`, Expo Go connects to your laptop via its current IP.
// We grab that same IP and use it for the Laravel API — so even if you change
// WiFi or hotspot, the app automatically finds the right IP.
const SERVER_URL_KEY = 'server_url';
const TOKEN_KEY = 'auth_token';
const DEFAULT_PORT = '8000';

// In-memory cache for performance
let _cachedBaseUrl: string | null = null;

/**
 * Auto-detect the laptop's IP from Expo's dev server connection.
 * Expo Go already knows the IP — we just extract it.
 * This works regardless of WiFi, hotspot, or network changes because
 * Expo updates this value each time the dev server starts.
 */
function getExpoHostIp(): string | null {
  try {
    // Expo SDK 54: Constants.expoGoConfig?.debuggerHost has "IP:PORT"
    const debuggerHost =
      (Constants as any).expoGoConfig?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {}
  return null;
}

/**
 * Get the current API base URL.
 * SMART LOGIC: Always checks if the network IP changed via Expo.
 * If the Expo dev server IP differs from the saved URL, it means the
 * network changed (e.g., switched WiFi/hotspot) — auto-update!
 */
export async function getApiBaseUrl(): Promise<string> {
  // Always check Expo IP to detect network changes
  const expoIp = getExpoHostIp();

  if (expoIp) {
    const expoUrl = `http://${expoIp}:${DEFAULT_PORT}/api`;

    // If we have a cached URL, check if Expo IP changed
    if (_cachedBaseUrl) {
      const cachedIpMatch = _cachedBaseUrl.match(/\/\/([^:\/]+)/);
      const cachedIp = cachedIpMatch ? cachedIpMatch[1] : null;

      if (cachedIp !== expoIp) {
        // Network changed! Auto-update to new IP
        console.log(`[API] Network changed: ${cachedIp} → ${expoIp}. Auto-updating.`);
        _cachedBaseUrl = expoUrl;
        await AsyncStorage.setItem(SERVER_URL_KEY, expoUrl);
        return expoUrl;
      }
      return _cachedBaseUrl;
    }

    // No cache yet — check saved value
    const saved = await AsyncStorage.getItem(SERVER_URL_KEY);
    if (saved) {
      const savedIpMatch = saved.match(/\/\/([^:\/]+)/);
      const savedIp = savedIpMatch ? savedIpMatch[1] : null;

      if (savedIp !== expoIp) {
        // Saved IP is outdated — network changed since last use
        console.log(`[API] Saved IP outdated: ${savedIp} → ${expoIp}. Auto-updating.`);
        _cachedBaseUrl = expoUrl;
        await AsyncStorage.setItem(SERVER_URL_KEY, expoUrl);
        return expoUrl;
      }
      _cachedBaseUrl = saved;
      return saved;
    }

    // Nothing saved — first run, use Expo IP
    _cachedBaseUrl = expoUrl;
    await AsyncStorage.setItem(SERVER_URL_KEY, expoUrl);
    return expoUrl;
  }

  // Expo IP not available (e.g., production build) — use saved/cached
  if (_cachedBaseUrl) return _cachedBaseUrl;

  const saved = await AsyncStorage.getItem(SERVER_URL_KEY);
  if (saved) {
    _cachedBaseUrl = saved;
    return saved;
  }

  // Last resort fallback
  return `http://192.168.1.1:${DEFAULT_PORT}/api`;
}

/**
 * Force re-detect the server IP from Expo (useful after network change).
 * Clears the cached URL and re-detects from Expo's connection.
 */
export async function autoDetectServerIp(): Promise<string | null> {
  const expoIp = getExpoHostIp();
  if (expoIp) {
    const url = `http://${expoIp}:${DEFAULT_PORT}/api`;
    _cachedBaseUrl = url;
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
    return expoIp;
  }
  return null;
}

/**
 * Set a new API base URL manually and persist it.
 * @param ip - Just the IP address (e.g. "192.168.1.5") or full URL
 */
export async function setApiBaseUrl(ip: string): Promise<void> {
  let url: string;
  if (ip.startsWith('http')) {
    url = ip.replace(/\/+$/, '');
    if (!url.endsWith('/api')) url += '/api';
  } else {
    const hasPort = ip.includes(':');
    url = `http://${ip}${hasPort ? '' : ':' + DEFAULT_PORT}/api`;
  }

  _cachedBaseUrl = url;
  await AsyncStorage.setItem(SERVER_URL_KEY, url);
}

/**
 * Get the currently saved server IP (for display in settings).
 */
export async function getSavedServerIp(): Promise<string> {
  const url = await getApiBaseUrl();
  const match = url.match(/\/\/([^/]+)/);
  return match ? match[1] : '';
}

/**
 * Test if a given server URL is reachable.
 * Returns true if the server responds within the timeout.
 */
export async function testServerConnection(ip: string): Promise<boolean> {
  const hasPort = ip.includes(':');
  const testUrl = `http://${ip}${hasPort ? '' : ':' + DEFAULT_PORT}/api/ping`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(testUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok || response.status === 200 || response.status === 404 || response.status === 401;
  } catch {
    clearTimeout(timeoutId);
    // Fallback: try /api/user — any response (even 401) means server is alive
    const fallbackUrl = `http://${ip}${hasPort ? '' : ':' + DEFAULT_PORT}/api/user`;
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
    try {
      const response = await fetch(fallbackUrl, {
        signal: controller2.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId2);
      return true;
    } catch {
      clearTimeout(timeoutId2);
      return false;
    }
  }
}

/**
 * Auto-discover the server by scanning common local network IP ranges.
 * Returns the first reachable IP or null.
 */
export async function autoDiscoverServer(): Promise<string | null> {
  // First try Expo's IP — almost always correct
  const expoIp = getExpoHostIp();
  if (expoIp) {
    const reachable = await testServerConnection(expoIp);
    if (reachable) return expoIp;
  }

  // Common subnets for hotspots and WiFi
  const prefixes = [
    '192.168.43',   // Android hotspot
    '192.168.137',  // Windows hotspot
    '172.20.10',    // iPhone hotspot
    '192.168.1',    // Common router
    '192.168.0',    // Common router
    '10.0.0',       // Some routers
    '192.168.100',  // Some ISPs
  ];

  const candidates: string[] = [];
  for (const prefix of prefixes) {
    for (const host of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 50, 100, 101, 254]) {
      candidates.push(`${prefix}.${host}`);
    }
  }

  const BATCH_SIZE = 15;
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (ip) => {
        const reachable = await testServerConnection(ip);
        if (reachable) return ip;
        throw new Error('not reachable');
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    }
  }

  return null;
}

// ─── Token Management ───
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Base Request ───
const REQUEST_TIMEOUT_MS = 8000;

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);

    // ─── AUTO-RETRY: If request fails, try re-detecting server IP ───
    // This handles the case where the network changed mid-session
    const newIp = getExpoHostIp();
    if (newIp) {
      const currentUrl = baseUrl;
      const newUrl = `http://${newIp}:${DEFAULT_PORT}/api`;
      if (newUrl !== currentUrl) {
        // IP changed! Update and retry once
        _cachedBaseUrl = newUrl;
        await AsyncStorage.setItem(SERVER_URL_KEY, newUrl);
        console.log(`[API] Network changed. Auto-updated server IP to ${newIp}`);

        try {
          const retryController = new AbortController();
          const retryTimeout = setTimeout(() => retryController.abort(), REQUEST_TIMEOUT_MS);
          response = await fetch(`${newUrl}${endpoint}`, {
            ...options,
            headers,
            signal: retryController.signal,
          });
          clearTimeout(retryTimeout);
          // Success! Continue with this response below
        } catch (retryErr: any) {
          clearTimeout(timeoutId);
          if (retryErr.name === 'AbortError') {
            throw new ApiError('Server not reachable. Check your connection and make sure the backend is running.', 0);
          }
          throw new ApiError(retryErr.message || 'Network error. Check your connection.', 0);
        }
      } else {
        if (err.name === 'AbortError') {
          throw new ApiError('Server not reachable. Check your connection and make sure the backend is running.', 0);
        }
        throw new ApiError(err.message || 'Network error. Check your connection.', 0);
      }
    } else {
      if (err.name === 'AbortError') {
        throw new ApiError('Server not reachable. Check your connection and make sure the backend is running.', 0);
      }
      throw new ApiError(err.message || 'Network error. Check your connection.', 0);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 - token expired
  if (response!.status === 401) {
    await removeToken();
    throw new ApiError('Session expired. Please login again.', 401);
  }

  const data = await response!.json();

  if (!response!.ok) {
    const message = data.message || data.errors
      ? Object.values(data.errors || {}).flat().join(', ')
      : 'Something went wrong';
    throw new ApiError(message, response!.status, data.errors);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// ─── Auth API ───
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: any }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(data.token);
    return data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    role: 'member' | 'trainer';
    sex?: string;
    date_of_birth?: string;
    membership_type?: string;
    specialization?: string;
    certifications?: string;
    experience_years?: number;
    hourly_rate?: number;
  }) => {
    return request<{ message: string; user: any }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
      await request('/logout', { method: 'POST' });
    } finally {
      await removeToken();
    }
  },

  getUser: async () => {
    return request<{ user: any }>('/user');
  },
};

// ─── Member API ───
export const memberApi = {
  getDashboard: () =>
    request<{
      stats: any;
      today_session: any;
      upcoming_sessions: any[];
      recent_progress: any[];
      recent_attendance: any[];
    }>('/member/dashboard'),

  getBookings: (status?: string) =>
    request<any>(`/member/bookings${status ? `?status=${status}` : ''}`),

  createBooking: (data: {
    trainer_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    session_type: string;
    notes?: string;
    payment_method?: string;
  }) =>
    request<{ message: string; booking: any }>('/member/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelBooking: (id: number) =>
    request<{ message: string }>(`/member/bookings/${id}/cancel`, { method: 'PATCH' }),

  getProgress: () =>
    request<any>('/member/progress'),

  storeProgress: (data: {
    weight: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
    bmi?: number;
    notes?: string;
  }) =>
    request<{ message: string; progress: any }>('/member/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWorkoutPlans: () =>
    request<any[]>('/member/workout-plans'),

  markPlanExecuted: (id: number) =>
    request<{ message: string }>(`/member/workout-plans/${id}/execute`, { method: 'POST' }),

  getWorkoutLogs: () =>
    request<any>('/member/workout-logs'),

  storeWorkoutLog: (data: {
    exercise_name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }) =>
    request<{ message: string; log: any }>('/member/workout-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAttendance: () =>
    request<any>('/member/attendance'),

  getPayments: () =>
    request<any>('/member/payments'),

  createPaymongoCheckout: (membership_type: string) =>
    request<{ checkout_url: string }>('/member/create-paymongo-checkout', {
      method: 'POST',
      body: JSON.stringify({ membership_type }),
    }),

  verifyPaymongoPayment: () =>
    request<{ message: string; user: any }>('/member/verify-paymongo-payment', {
      method: 'POST',
    }),

  getProfile: () =>
    request<{ user: any }>('/member/profile'),

  updateProfile: (data: Partial<{
    name: string;
    phone: string;
    date_of_birth: string;
    height: number;
    weight: number;
    sex: string;
  }>) =>
    request<{ message: string; user: any }>('/member/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTrainers: () =>
    request<any[]>('/member/trainers'),

  getNotifications: () =>
    request<{ notifications: any[]; unread_count: number }>('/member/notifications'),

  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/member/notifications/${id}/read`, { method: 'POST' }),
};

// ─── Trainer API ───
export const trainerApi = {
  getDashboard: () =>
    request<{
      stats: any;
      today_sessions: any[];
      upcoming_bookings: any[];
    }>('/trainer/dashboard'),

  getBookings: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.date) qs.append('date', params.date);
    const queryString = qs.toString();
    return request<any>(`/trainer/bookings${queryString ? `?${queryString}` : ''}`);
  },

  updateBookingStatus: (id: number, status: string) =>
    request<{ message: string; booking: any }>(`/trainer/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getWorkoutPlans: () =>
    request<any[]>('/trainer/workout-plans'),

  createWorkoutPlan: (data: {
    member_id: number;
    title: string;
    description?: string;
    exercises?: string;
    exercise_recommendations?: string;
    schedule_day?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    request<{ message: string; plan: any }>('/trainer/workout-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWorkoutPlan: (id: number, data: Partial<{
    title: string;
    description: string;
    exercises: string;
    exercise_recommendations: string;
    schedule_day: string;
    start_date: string;
    end_date: string;
  }>) =>
    request<{ message: string; plan: any }>(`/trainer/workout-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteWorkoutPlan: (id: number) =>
    request<{ message: string }>(`/trainer/workout-plans/${id}`, { method: 'DELETE' }),

  getClients: () =>
    request<any[]>('/trainer/clients'),

  getAttendance: (date?: string) =>
    request<any>(`/trainer/attendance${date ? `?date=${date}` : ''}`),

  storeAttendance: (data: {
    member_id: number;
    date: string;
    check_in: string;
    check_out?: string;
    workout_duration?: number;
    calories_burned?: number;
    notes?: string;
  }) =>
    request<{ message: string; attendance: any }>('/trainer/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProgress: (memberId?: number) =>
    request<any>(`/trainer/progress${memberId ? `?member_id=${memberId}` : ''}`),

  storeProgress: (data: {
    member_id: number;
    weight: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
    bmi?: number;
    notes?: string;
  }) =>
    request<{ message: string; progress: any }>('/trainer/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    request<{ user: any }>('/trainer/profile'),

  updateProfile: (data: Partial<{
    name: string;
    phone: string;
    specialization: string;
    certifications: string;
    experience_years: number;
    hourly_rate: number;
  }>) =>
    request<{ message: string; user: any }>('/trainer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getNotifications: () =>
    request<{ notifications: any[]; unread_count: number }>('/trainer/notifications'),
};

// ─── CASHIER API ───
export const cashierApi = {
  getDashboardStats: () =>
    request<any>('/cashier/dashboard-stats'),

  getTransactions: () =>
    request<{ transactions: any[] }>('/cashier/transactions'),

  simulateScan: () =>
    request<any>('/cashier/simulate-scan'),

  getMember: (id: string | number) =>
    request<any>(`/cashier/member/${id}`),

  createSessionPayment: (data: { member_id: string | number | null; amount: number; description: string; method: 'cash' | 'paymongo'; items: any[] }) =>
    request<any>('/cashier/create-session-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifySessionPayment: (checkout_id: string) =>
    request<any>('/cashier/verify-session-payment', {
      method: 'POST',
      body: JSON.stringify({ checkout_id }),
    }),
    
  verifyOrderQr: (qrCode: string) => request<any>(`/cashier/orders/${qrCode}`),
  completeOrder: (qrCode: string, paymentMethod: string) => request<any>(`/cashier/orders/${qrCode}/complete`, { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod }) }),
};

// ─── SOCIAL API ───
export const socialApi = {
  getFriends: () => request<{ friends: any[], requests: any[], potential: any[] }>('/social/friends'),
  addFriend: (friend_id: number) => request<any>('/social/friends/add', { method: 'POST', body: JSON.stringify({ friend_id }) }),
  acceptFriend: (friend_id: number) => request<any>('/social/friends/accept', { method: 'POST', body: JSON.stringify({ friend_id }) }),
  getPublicProfile: (id: number) => request<any>(`/social/profile/${id}`),
  getMessages: (friendId: string) => request<any[]>(`/social/messages/${friendId}`),
  sendMessage: (receiver_id: number, content: string, image_base64?: string) => request<any>('/social/messages', { method: 'POST', body: JSON.stringify({ receiver_id, content, image_base64 }) }),
  deleteMessage: (id: string) => request<any>(`/social/messages/${id}`, { method: 'DELETE' }),
  unsendMessage: (id: string) => request<any>(`/social/messages/${id}/unsend`, { method: 'POST' }),
  reactToMessage: (id: string, emoji: string) => request<any>(`/social/messages/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
  getActivities: () => request<any[]>('/social/activities'),
  storeActivity: (data: { type: string, title?: string, duration_minutes?: number, notes?: string, photo_uri?: string }) => request<any>('/social/activities', { method: 'POST', body: JSON.stringify(data) }),
  toggleLike: (id: number) => request<any>(`/social/activities/${id}/toggle-like`, { method: 'POST' }),
  addComment: (id: number, comment: string) => request<any>(`/social/activities/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
};

// ─── SHOP API ───
export const shopApi = {
  getProducts: () => request<any[]>('/products'),
  checkoutOrder: (items: any[], payment_method?: 'cash' | 'paymongo') => request<any>('/orders/checkout', { method: 'POST', body: JSON.stringify({ items, payment_method }) }),
};
