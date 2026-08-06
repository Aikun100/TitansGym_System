import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuration ───
// Your computer's local network IP for Expo Go on physical device
// Change this if your IP changes (run: ipconfig in terminal)
const API_BASE_URL = 'http://10.0.0.50:8001/api';

const TOKEN_KEY = 'auth_token';

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
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - token expired
  if (response.status === 401) {
    await removeToken();
    throw new ApiError('Session expired. Please login again.', 401);
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.message || data.errors
      ? Object.values(data.errors || {}).flat().join(', ')
      : 'Something went wrong';
    throw new ApiError(message, response.status, data.errors);
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

  // Bookings
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

  // Progress
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

  // Workout Plans
  getWorkoutPlans: () =>
    request<any[]>('/member/workout-plans'),

  markPlanExecuted: (id: number) =>
    request<{ message: string }>(`/member/workout-plans/${id}/execute`, { method: 'POST' }),

  // Workout Logs
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

  // Attendance
  getAttendance: () =>
    request<any>('/member/attendance'),

  // Payments
  getPayments: () =>
    request<any>('/member/payments'),

  // Profile
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

  // Trainers
  getTrainers: () =>
    request<any[]>('/member/trainers'),

  // Notifications
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

  // Bookings
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

  // Workout Plans
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

  // Clients
  getClients: () =>
    request<any[]>('/trainer/clients'),

  // Attendance
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

  // Progress
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

  // Profile
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

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[]; unread_count: number }>('/trainer/notifications'),
};

// ─── API URL Configuration Helper ───
export function setApiBaseUrl(url: string) {
  // This would require a different approach in production
  // For now, change API_BASE_URL constant at the top of this file
  console.log(`To change API URL, edit the API_BASE_URL constant in src/services/api.ts to: ${url}`);
}
