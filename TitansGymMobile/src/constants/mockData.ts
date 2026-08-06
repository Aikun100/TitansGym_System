// Mock data for the member and trainer views

export const MEMBER_PROFILE = {
  id: 1,
  name: 'Aaron Cruz',
  email: 'aaron@titansgym.com',
  phone: '+63 912 345 6789',
  role: 'member',
  membershipType: 'Premium',
  membershipExpiry: '2026-06-15',
  membershipDaysRemaining: 49,
  membershipStatus: 'active',
  height: 175,
  weight: 78,
  age: 22,
  avatarUrl: null,
  joinDate: '2025-11-01',
  totalWorkouts: 127,
  currentStreak: 14,
  totalSpent: 12500,
};

export const TRAINER_PROFILE = {
  id: 2,
  name: 'Coach Miguel Santos',
  email: 'miguel@titansgym.com',
  phone: '+63 917 456 7890',
  role: 'trainer',
  specialization: 'Strength & Conditioning',
  certifications: 'NASM-CPT, ACE, CrossFit L2',
  experienceYears: 8,
  hourlyRate: 800,
  rating: 4.8,
  totalClients: 24,
  totalSessions: 342,
  isActive: true,
  avatarUrl: null,
};

export const MEMBER_STATS = {
  workoutsThisWeek: 4,
  workoutsThisMonth: 18,
  caloriesBurned: 12400,
  avgWorkoutDuration: 65, // minutes
  personalBests: 3,
  goalsCompleted: 7,
};

export const TRAINER_STATS = {
  activeClients: 24,
  sessionsToday: 5,
  sessionsThisWeek: 22,
  pendingBookings: 3,
  completedSessions: 342,
  avgRating: 4.8,
};

export const UPCOMING_BOOKINGS = [
  {
    id: 1,
    trainerName: 'Coach Miguel',
    memberName: 'Aaron Cruz',
    date: '2026-04-28',
    time: '09:00 AM',
    duration: 60,
    type: 'Personal Training',
    status: 'confirmed',
  },
  {
    id: 2,
    trainerName: 'Coach Miguel',
    memberName: 'Maria Santos',
    date: '2026-04-28',
    time: '11:00 AM',
    duration: 60,
    type: 'Strength Training',
    status: 'confirmed',
  },
  {
    id: 3,
    trainerName: 'Coach Liza',
    memberName: 'Aaron Cruz',
    date: '2026-04-29',
    time: '02:00 PM',
    duration: 45,
    type: 'Cardio HIIT',
    status: 'pending',
  },
  {
    id: 4,
    trainerName: 'Coach Miguel',
    memberName: 'Jake Rivera',
    date: '2026-04-30',
    time: '08:00 AM',
    duration: 60,
    type: 'Personal Training',
    status: 'confirmed',
  },
];

export const WORKOUT_PLANS = [
  {
    id: 1,
    name: 'Push Day - Chest & Shoulders',
    trainer: 'Coach Miguel',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75s' },
      { name: 'Military Press', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60s' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '60s' },
    ],
    status: 'active',
    isExecuted: false,
    date: '2026-04-28',
  },
  {
    id: 2,
    name: 'Pull Day - Back & Biceps',
    trainer: 'Coach Miguel',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5-6', rest: '120s' },
      { name: 'Pull-Ups', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s' },
      { name: 'Face Pulls', sets: 3, reps: '15-18', rest: '60s' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60s' },
    ],
    status: 'active',
    isExecuted: true,
    date: '2026-04-27',
  },
  {
    id: 3,
    name: 'Leg Day - Quads & Hamstrings',
    trainer: 'Coach Miguel',
    exercises: [
      { name: 'Barbell Squats', sets: 5, reps: '5-6', rest: '120s' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '75s' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '60s' },
    ],
    status: 'upcoming',
    isExecuted: false,
    date: '2026-04-29',
  },
];

export const RECENT_PROGRESS = [
  { date: '2026-04-20', weight: 79.2, bodyFat: 16.5 },
  { date: '2026-04-13', weight: 79.5, bodyFat: 16.8 },
  { date: '2026-04-06', weight: 80.0, bodyFat: 17.1 },
  { date: '2026-03-30', weight: 80.3, bodyFat: 17.4 },
  { date: '2026-03-23', weight: 80.8, bodyFat: 17.7 },
  { date: '2026-03-16', weight: 81.2, bodyFat: 18.0 },
];

export const ATTENDANCE_DATA = [
  { date: '2026-04-27', checkIn: '06:30 AM', checkOut: '08:15 AM', duration: '1h 45m' },
  { date: '2026-04-26', checkIn: '07:00 AM', checkOut: '08:30 AM', duration: '1h 30m' },
  { date: '2026-04-25', checkIn: '06:15 AM', checkOut: '08:00 AM', duration: '1h 45m' },
  { date: '2026-04-24', checkIn: '05:45 AM', checkOut: '07:30 AM', duration: '1h 45m' },
  { date: '2026-04-22', checkIn: '07:30 AM', checkOut: '09:00 AM', duration: '1h 30m' },
];

export const PAYMENT_HISTORY = [
  { id: 1, date: '2026-04-01', amount: 2500, type: 'Monthly Membership', status: 'paid', method: 'GCash' },
  { id: 2, date: '2026-03-15', amount: 800, type: 'Personal Training', status: 'paid', method: 'Cash' },
  { id: 3, date: '2026-03-01', amount: 2500, type: 'Monthly Membership', status: 'paid', method: 'GCash' },
  { id: 4, date: '2026-02-01', amount: 2500, type: 'Monthly Membership', status: 'paid', method: 'Card' },
];

export const TRAINER_CLIENTS = [
  { id: 1, name: 'Aaron Cruz', membershipType: 'Premium', lastSession: '2026-04-27', nextSession: '2026-04-28', progress: 'On Track' },
  { id: 2, name: 'Maria Santos', membershipType: 'Standard', lastSession: '2026-04-26', nextSession: '2026-04-28', progress: 'Excellent' },
  { id: 3, name: 'Jake Rivera', membershipType: 'Premium', lastSession: '2026-04-25', nextSession: '2026-04-30', progress: 'On Track' },
  { id: 4, name: 'Sofia Garcia', membershipType: 'Premium', lastSession: '2026-04-24', nextSession: '2026-04-29', progress: 'Needs Attention' },
  { id: 5, name: 'Carlos Reyes', membershipType: 'Standard', lastSession: '2026-04-22', nextSession: '2026-05-01', progress: 'On Track' },
  { id: 6, name: 'Liza Torres', membershipType: 'Basic', lastSession: '2026-04-20', nextSession: '2026-04-28', progress: 'Excellent' },
];

export const EXERCISE_LIBRARY = [
  { id: 1, name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell, Bench', difficulty: 'Intermediate', muscleGroup: 'Chest, Triceps, Shoulders' },
  { id: 2, name: 'Barbell Squats', category: 'Legs', equipment: 'Barbell, Squat Rack', difficulty: 'Intermediate', muscleGroup: 'Quads, Glutes, Hamstrings' },
  { id: 3, name: 'Deadlift', category: 'Back', equipment: 'Barbell', difficulty: 'Advanced', muscleGroup: 'Back, Hamstrings, Glutes' },
  { id: 4, name: 'Pull-Ups', category: 'Back', equipment: 'Pull-up Bar', difficulty: 'Intermediate', muscleGroup: 'Lats, Biceps, Core' },
  { id: 5, name: 'Military Press', category: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', muscleGroup: 'Shoulders, Triceps' },
  { id: 6, name: 'Dumbbell Curls', category: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', muscleGroup: 'Biceps' },
];

export const NOTIFICATIONS = [
  { id: 1, title: 'Booking Confirmed', message: 'Your session with Coach Miguel on April 28 is confirmed.', time: '2 hours ago', read: false, type: 'booking' },
  { id: 2, title: 'Membership Renewal', message: 'Your membership expires in 49 days. Renew now!', time: '1 day ago', read: false, type: 'membership' },
  { id: 3, title: 'New Workout Plan', message: 'Coach Miguel assigned a new Leg Day workout plan.', time: '2 days ago', read: true, type: 'workout' },
  { id: 4, title: 'Payment Received', message: 'Payment of ₱2,500 for membership has been processed.', time: '5 days ago', read: true, type: 'payment' },
];
