import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, memberApi, trainerApi, getToken, removeToken } from '../services/api';

// ─── Types ───
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'member' | 'trainer';
  sex?: string;
  address?: string;
  date_of_birth?: string;
  avatar?: string;
  membershipType?: string;
  membershipExpiry?: string;
  membershipDaysRemaining?: number;
  membershipStatus?: string;
  height?: number;
  weight?: number;
  age?: number;
  joinDate?: string;
  totalWorkouts?: number;
  currentStreak?: number;
  totalSpent?: number;
  specialization?: string;
  certifications?: string;
  experienceYears?: number;
  hourlyRate?: number;
  rating?: number;
  totalClients?: number;
  totalSessions?: number;
  isActive?: boolean;
}

export interface Booking {
  id: number;
  trainerName: string;
  memberName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  trainerId?: number;
  memberId?: number;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  trainer: string;
  memberId?: number;
  exercises: Exercise[];
  status: string;
  isExecuted: boolean;
  date: string;
  notes?: string;
  description?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: string;
}

export interface ProgressEntry {
  id: number;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

export interface AttendanceEntry {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
}

export interface Payment {
  id: number;
  date: string;
  amount: number;
  type: string;
  status: string;
  method: string;
}

export interface Client {
  id: number;
  name: string;
  membershipType: string;
  lastSession: string;
  nextSession: string;
  progress: string;
  email?: string;
  phone?: string;
  totalSessions?: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

// ─── Context Type ───
interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<string>;
  logout: () => Promise<void>;
  bookings: Booking[];
  addBooking: (b: any) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  workoutPlans: WorkoutPlan[];
  addWorkoutPlan: (p: any) => Promise<void>;
  toggleWorkoutExecuted: (id: number) => Promise<void>;
  deleteWorkoutPlan: (id: number) => Promise<void>;
  progressEntries: ProgressEntry[];
  addProgressEntry: (e: any) => Promise<void>;
  deleteProgressEntry: (id: number) => void;
  attendance: AttendanceEntry[];
  checkIn: () => void;
  checkOut: () => void;
  payments: Payment[];
  clients: Client[];
  updateClientProgress: (id: number, progress: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: number) => void;
  unreadCount: number;
  refreshDashboard: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  dashboardStats: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helper: Format API data to app format ───
function formatUserFromApi(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role,
    sex: apiUser.sex,
    date_of_birth: apiUser.date_of_birth,
    avatar: apiUser.avatar,
    membershipType: apiUser.membership_type,
    membershipExpiry: apiUser.membership_expiry,
    membershipDaysRemaining: apiUser.membership_days_remaining ? Math.floor(apiUser.membership_days_remaining) : undefined,
    membershipStatus: apiUser.membership_status,
    height: apiUser.height ? parseFloat(apiUser.height) : undefined,
    weight: apiUser.weight ? parseFloat(apiUser.weight) : undefined,
    age: apiUser.age,
    joinDate: apiUser.join_date,
    totalWorkouts: apiUser.total_workouts,
    totalSpent: apiUser.total_spent,
    specialization: apiUser.specialization,
    certifications: apiUser.certifications,
    experienceYears: apiUser.experience_years,
    hourlyRate: apiUser.hourly_rate,
    totalClients: apiUser.total_clients,
    totalSessions: apiUser.total_sessions,
    isActive: apiUser.is_active,
  };
}

function formatBookingFromApi(apiBooking: any): Booking {
  return {
    id: apiBooking.id,
    trainerName: apiBooking.trainer_name || 'Unknown Trainer',
    memberName: apiBooking.member_name || 'Unknown Member',
    date: apiBooking.booking_date,
    time: apiBooking.start_time,
    duration: 60,
    type: apiBooking.session_type || 'Training',
    status: apiBooking.status,
    notes: apiBooking.notes,
    trainerId: apiBooking.trainer_id,
    memberId: apiBooking.member_id,
  };
}

function formatProgressFromApi(apiProgress: any): ProgressEntry {
  return {
    id: apiProgress.id,
    date: apiProgress.record_date,
    weight: parseFloat(apiProgress.weight),
    bodyFat: apiProgress.body_fat_percentage ? parseFloat(apiProgress.body_fat_percentage) : undefined,
    muscleMass: apiProgress.muscle_mass ? parseFloat(apiProgress.muscle_mass) : undefined,
    notes: apiProgress.notes,
  };
}

function formatAttendanceFromApi(apiAtt: any): AttendanceEntry {
  return {
    id: apiAtt.id,
    date: apiAtt.date,
    checkIn: apiAtt.check_in || '--',
    checkOut: apiAtt.check_out || '--',
    duration: apiAtt.workout_duration ? `${apiAtt.workout_duration}m` : 'N/A',
  };
}

function formatPaymentFromApi(apiPay: any): Payment {
  return {
    id: apiPay.id,
    date: apiPay.created_at?.split('T')[0] || apiPay.payment_date || '',
    amount: parseFloat(apiPay.amount),
    type: apiPay.description || 'Payment',
    status: apiPay.status,
    method: apiPay.payment_method || 'N/A',
  };
}

function formatClientFromApi(apiClient: any): Client {
  return {
    id: apiClient.id,
    name: apiClient.name,
    membershipType: apiClient.membership_type || 'Standard',
    lastSession: apiClient.last_session || 'N/A',
    nextSession: apiClient.next_session || 'N/A',
    progress: 'On Track',
    email: apiClient.email,
    phone: apiClient.phone,
    totalSessions: apiClient.total_sessions,
  };
}

// ─── Provider ───
export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});

  // ─── Auto-restore session ───
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (token) {
          const { user: apiUser } = await authApi.getUser();
          setUser(formatUserFromApi(apiUser));
        }
      } catch (e) {
        await removeToken();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Auth ───
  const login = useCallback(async (email: string, password: string) => {
    const { user: apiUser } = await authApi.login(email, password);
    setUser(formatUserFromApi(apiUser));
  }, []);

  const register = useCallback(async (data: any) => {
    const result = await authApi.register(data);
    return result.message;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore errors during logout
    }
    setUser(null);
    setBookings([]);
    setWorkoutPlans([]);
    setProgressEntries([]);
    setAttendance([]);
    setPayments([]);
    setClients([]);
    setNotifications([]);
    setDashboardStats({});
  }, []);

  // ─── Dashboard Refresh ───
  const refreshDashboard = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === 'member') {
        const data = await memberApi.getDashboard();
        setDashboardStats(data.stats);
        if (data.upcoming_sessions) {
          setBookings(prev => {
            const upcoming = data.upcoming_sessions.map(formatBookingFromApi);
            const existingIds = new Set(upcoming.map((b: Booking) => b.id));
            const others = prev.filter(b => !existingIds.has(b.id));
            return [...upcoming, ...others];
          });
        }
        if (data.recent_progress) {
          setProgressEntries(data.recent_progress.map(formatProgressFromApi));
        }
        if (data.recent_attendance) {
          setAttendance(data.recent_attendance.map(formatAttendanceFromApi));
        }
      } else {
        const data = await trainerApi.getDashboard();
        setDashboardStats(data.stats);
        if (data.today_sessions) {
          setBookings(prev => {
            const today = data.today_sessions.map(formatBookingFromApi);
            const existingIds = new Set(today.map((b: Booking) => b.id));
            const others = prev.filter(b => !existingIds.has(b.id));
            return [...today, ...others];
          });
        }
      }
    } catch (e) {
      console.error('Dashboard refresh error:', e);
    }
  }, [user]);

  // ─── Bookings ───
  const refreshBookings = useCallback(async () => {
    if (!user) return;
    try {
      const api = user.role === 'member' ? memberApi : trainerApi;
      const data = await api.getBookings();
      const items = data.data || data;
      setBookings(Array.isArray(items) ? items.map(formatBookingFromApi) : []);
    } catch (e) {
      console.error('Bookings refresh error:', e);
    }
  }, [user]);

  const addBooking = useCallback(async (bookingData: any) => {
    const { booking } = await memberApi.createBooking(bookingData);
    setBookings(prev => [formatBookingFromApi(booking), ...prev]);
  }, []);

  const cancelBooking = useCallback(async (id: number) => {
    await memberApi.cancelBooking(id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b));
  }, []);

  const updateBookingStatus = useCallback(async (id: number, status: Booking['status']) => {
    await trainerApi.updateBookingStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  // ─── Workout Plans ───
  const addWorkoutPlan = useCallback(async (planData: any) => {
    const { plan } = await trainerApi.createWorkoutPlan(planData);
    setWorkoutPlans(prev => [plan, ...prev]);
  }, []);

  const toggleWorkoutExecuted = useCallback(async (id: number) => {
    if (user?.role === 'member') {
      await memberApi.markPlanExecuted(id);
    }
    setWorkoutPlans(prev => prev.map(w => w.id === id ? { ...w, isExecuted: !w.isExecuted } : w));
  }, [user]);

  const deleteWorkoutPlan = useCallback(async (id: number) => {
    await trainerApi.deleteWorkoutPlan(id);
    setWorkoutPlans(prev => prev.filter(w => w.id !== id));
  }, []);

  // ─── Progress ───
  const refreshProgress = useCallback(async () => {
    if (!user) return;
    try {
      const data = user.role === 'member'
        ? await memberApi.getProgress()
        : await trainerApi.getProgress();
      const items = data.data || data;
      setProgressEntries(Array.isArray(items) ? items.map(formatProgressFromApi) : []);
    } catch (e) {
      console.error('Progress refresh error:', e);
    }
  }, [user]);

  const addProgressEntry = useCallback(async (entryData: any) => {
    if (user?.role === 'member') {
      const { progress } = await memberApi.storeProgress(entryData);
      setProgressEntries(prev => [formatProgressFromApi(progress), ...prev]);
    } else {
      const { progress } = await trainerApi.storeProgress(entryData);
      setProgressEntries(prev => [formatProgressFromApi(progress), ...prev]);
    }
  }, [user]);

  const deleteProgressEntry = useCallback((id: number) => {
    setProgressEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── Attendance (local actions for now) ───
  const checkIn = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];
    setAttendance(prev => [
      { id: Date.now(), date: dateStr, checkIn: timeStr, checkOut: '--', duration: 'In progress' },
      ...prev,
    ]);
  }, []);

  const checkOut = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setAttendance(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], checkOut: timeStr, duration: 'Completed' };
      return updated;
    });
  }, []);

  // ─── Clients ───
  const updateClientProgress = useCallback((id: number, progress: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, progress } : c));
  }, []);

  // ─── Notifications ───
  const markNotificationRead = useCallback((id: number) => {
    memberApi.markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ─── Load initial data when user logs in ───
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        await refreshDashboard();
        await refreshBookings();

        if (user.role === 'member') {
          try {
            const paymentsData = await memberApi.getPayments();
            const payItems = paymentsData.data || paymentsData;
            setPayments(Array.isArray(payItems) ? payItems.map(formatPaymentFromApi) : []);
          } catch (e) { console.error('Payments load error:', e); }

          try {
            const attData = await memberApi.getAttendance();
            const attItems = attData.data || attData;
            setAttendance(Array.isArray(attItems) ? attItems.map(formatAttendanceFromApi) : []);
          } catch (e) { console.error('Attendance load error:', e); }
        }

        if (user.role === 'trainer') {
          try {
            const clientsData = await trainerApi.getClients();
            setClients(Array.isArray(clientsData) ? clientsData.map(formatClientFromApi) : []);
          } catch (e) { console.error('Clients load error:', e); }
        }

        // Notifications
        try {
          const api = user.role === 'member' ? memberApi : trainerApi;
          const notifData = await api.getNotifications();
          setNotifications((notifData.notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message || n.body || '',
            time: n.created_at || '',
            read: n.is_read || false,
            type: n.type || 'general',
          })));
        } catch (e) { console.error('Notifications load error:', e); }

      } catch (e) {
        console.error('Data load error:', e);
      }
    };

    loadData();
  }, [user?.id]);

  return (
    <AppContext.Provider value={{
      user, setUser, loading,
      login, register, logout,
      bookings, addBooking, cancelBooking, updateBookingStatus,
      workoutPlans, addWorkoutPlan, toggleWorkoutExecuted, deleteWorkoutPlan,
      progressEntries, addProgressEntry, deleteProgressEntry,
      attendance, checkIn, checkOut,
      payments,
      clients, updateClientProgress,
      notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, unreadCount,
      refreshDashboard, refreshBookings, refreshProgress,
      dashboardStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
