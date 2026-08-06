<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Attendance;
use App\Models\Progress;
use App\Models\WorkoutPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0');
        User::truncate();
        Booking::truncate();
        Payment::truncate();
        Attendance::truncate();
        Progress::truncate();
        WorkoutPlan::truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gym.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+1234567890',
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        // Create Trainers
        $trainers = [];
        $trainers[] = User::create([
            'name' => 'John Trainer',
            'email' => 'trainer@gym.com',
            'password' => Hash::make('password'),
            'role' => 'trainer',
            'phone' => '+1234567891',
            'specialization' => 'Personal Training',
            'certifications' => 'ACE Certified Personal Trainer, CPR/AED Certified',
            'experience_years' => 5,
            'hourly_rate' => 60.00,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $trainers[] = User::create([
            'name' => 'Sarah Coach',
            'email' => 'sarah@gym.com',
            'password' => Hash::make('password'),
            'role' => 'trainer',
            'phone' => '+1234567892',
            'specialization' => 'Yoga & Pilates',
            'certifications' => 'RYT 200 Yoga Instructor, Pilates Certified',
            'experience_years' => 3,
            'hourly_rate' => 50.00,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $trainers[] = User::create([
            'name' => 'Mike Strength',
            'email' => 'mike@gym.com',
            'password' => Hash::make('password'),
            'role' => 'trainer',
            'phone' => '+1234567895',
            'specialization' => 'Strength & Conditioning',
            'certifications' => 'NSCA Certified Strength Coach, CSCS',
            'experience_years' => 7,
            'hourly_rate' => 75.00,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        // Create Members
        $members = [];
        $members[] = User::create([
            'name' => 'Mike Member',
            'email' => 'member@gym.com',
            'password' => Hash::make('password'),
            'role' => 'member',
            'phone' => '+1234567893',
            'date_of_birth' => Carbon::create(1990, 5, 15),
            'address' => '123 Main St, City, State 12345',
            'membership_type' => 'premium',
            'membership_expiry' => Carbon::now()->addMonths(6),
            'height' => 175.5,
            'weight' => 75.2,
            'emergency_contact' => '+1234567899',
            'health_notes' => 'No known health issues',
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $members[] = User::create([
            'name' => 'Lisa Johnson',
            'email' => 'lisa@gym.com',
            'password' => Hash::make('password'),
            'role' => 'member',
            'phone' => '+1234567894',
            'date_of_birth' => Carbon::create(1985, 8, 22),
            'address' => '456 Oak Ave, City, State 12345',
            'membership_type' => 'vip',
            'membership_expiry' => Carbon::now()->addYear(),
            'height' => 165.0,
            'weight' => 62.5,
            'emergency_contact' => '+1234567888',
            'health_notes' => 'Allergic to nuts',
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        // Create additional members with more realistic data
        $memberNames = [
            'John Smith', 'Emma Wilson', 'David Brown', 'Sarah Davis', 'Michael Johnson',
            'Jennifer Miller', 'Chris Wilson', 'Amanda Taylor', 'Robert Clark', 'Jessica Lee'
        ];

        for ($i = 0; $i < 10; $i++) {
            $members[] = User::create([
                'name' => $memberNames[$i],
                'email' => strtolower(str_replace(' ', '.', $memberNames[$i])) . '@gym.com',
                'password' => Hash::make('password'),
                'role' => 'member',
                'phone' => '+1234567' . (100 + $i),
                'date_of_birth' => Carbon::now()->subYears(rand(20, 50))->subMonths(rand(0, 11))->subDays(rand(0, 30)),
                'address' => rand(100, 999) . ' Street Name, City, State ' . rand(10000, 99999),
                'membership_type' => ['basic', 'premium', 'vip'][array_rand(['basic', 'premium', 'vip'])],
                'membership_expiry' => Carbon::now()->addMonths(rand(1, 12)),
                'height' => rand(150, 190) + rand(0, 99) / 100,
                'weight' => rand(50, 100) + rand(0, 99) / 100,
                'emergency_contact' => '+1234567' . (200 + $i),
                'health_notes' => rand(0, 1) ? 'No health issues' : 'Consult doctor before intense exercise',
                'is_active' => rand(0, 10) > 1, // 90% active
                'approval_status' => 'approved',
            ]);
        }

        // Create enhanced bookings with realistic distribution
        foreach ($members as $member) {
            // Create past completed sessions
            foreach (range(1, rand(3, 8)) as $index) {
                $trainer = $trainers[array_rand($trainers)];
                $bookingDate = Carbon::now()->subDays(rand(1, 60));
                $sessionType = ['personal_training', 'group_session', 'consultation'][rand(0, 2)];
                
                Booking::create([
                    'member_id' => $member->id,
                    'trainer_id' => $trainer->id,
                    'booking_date' => $bookingDate,
                    'start_time' => $this->generateRandomTime(),
                    'end_time' => $this->generateRandomEndTime(),
                    'session_type' => $sessionType,
                    'status' => 'completed',
                    'price' => $this->calculateSessionPrice($trainer->hourly_rate, $sessionType),
                    'notes' => $this->generateSessionNotes(),
                ]);
            }

            // Create upcoming sessions
            foreach (range(1, rand(1, 3)) as $index) {
                $trainer = $trainers[array_rand($trainers)];
                $bookingDate = Carbon::now()->addDays(rand(1, 14));
                $sessionType = ['personal_training', 'group_session', 'consultation'][rand(0, 2)];
                
                Booking::create([
                    'member_id' => $member->id,
                    'trainer_id' => $trainer->id,
                    'booking_date' => $bookingDate,
                    'start_time' => $this->generateRandomTime(),
                    'end_time' => $this->generateRandomEndTime(),
                    'session_type' => $sessionType,
                    'status' => ['pending', 'confirmed'][rand(0, 1)],
                    'price' => $this->calculateSessionPrice($trainer->hourly_rate, $sessionType),
                    'notes' => 'Upcoming ' . str_replace('_', ' ', $sessionType) . ' session',
                ]);
            }

            // Create some cancelled sessions
            if (rand(0, 1)) {
                $trainer = $trainers[array_rand($trainers)];
                $bookingDate = Carbon::now()->subDays(rand(1, 30));
                $sessionType = ['personal_training', 'group_session', 'consultation'][rand(0, 2)];
                
                Booking::create([
                    'member_id' => $member->id,
                    'trainer_id' => $trainer->id,
                    'booking_date' => $bookingDate,
                    'start_time' => $this->generateRandomTime(),
                    'end_time' => $this->generateRandomEndTime(),
                    'session_type' => $sessionType,
                    'status' => 'cancelled',
                    'price' => $this->calculateSessionPrice($trainer->hourly_rate, $sessionType),
                    'notes' => 'Cancelled due to schedule conflict',
                ]);
            }
        }

        // Create enhanced payment data - FIXED: All issues resolved
        $transactionCounter = 1; // Counter for unique transaction IDs
        foreach ($members as $member) {
            // Create payment history (paid payments)
            foreach (range(1, rand(2, 6)) as $index) {
                $paymentDate = Carbon::now()->subMonths(rand(0, 6));
                $amount = match($member->membership_type) {
                    'basic' => rand(50, 80),
                    'premium' => rand(100, 150),
                    'vip' => rand(200, 300),
                };
                
                Payment::create([
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'payment_date' => $paymentDate,
                    'due_date' => $paymentDate->copy()->addMonth(),
                    'payment_method' => ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'e_wallet'][rand(0, 5)],
                    'transaction_id' => 'TXN' . time() . $member->id . $index . $transactionCounter++ . rand(1000, 9999),
                    'status' => 'paid',
                    'description' => ucfirst($member->membership_type) . ' membership fee',
                    'membership_type' => $member->membership_type,
                    'period_start' => $paymentDate,
                    'period_end' => $paymentDate->copy()->addMonth(),
                ]);
            }

            // Create some pending payments
            if (rand(0, 1)) {
                $amount = match($member->membership_type) {
                    'basic' => rand(50, 80),
                    'premium' => rand(100, 150),
                    'vip' => rand(200, 300),
                };
                $dueDate = Carbon::now()->addDays(rand(1, 7));
                
                Payment::create([
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'payment_date' => $dueDate,
                    'due_date' => $dueDate,
                    'payment_method' => ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'e_wallet'][rand(0, 5)],
                    'transaction_id' => 'TXN' . time() . $member->id . 'P' . $transactionCounter++ . rand(10000, 99999),
                    'status' => 'pending',
                    'description' => ucfirst($member->membership_type) . ' membership renewal',
                    'membership_type' => $member->membership_type,
                    'period_start' => Carbon::now(),
                    'period_end' => Carbon::now()->addMonth(),
                ]);
            }

            // Create some overdue payments
            if (rand(0, 3) === 0) {
                $amount = match($member->membership_type) {
                    'basic' => rand(50, 80),
                    'premium' => rand(100, 150),
                    'vip' => rand(200, 300),
                };
                $dueDate = Carbon::now()->subDays(rand(1, 14));
                
                Payment::create([
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'payment_date' => $dueDate,
                    'due_date' => $dueDate,
                    'payment_method' => ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'e_wallet'][rand(0, 5)],
                    'transaction_id' => 'TXN' . time() . $member->id . 'O' . $transactionCounter++ . rand(10000, 99999),
                    'status' => 'pending',
                    'description' => 'Overdue ' . $member->membership_type . ' membership fee',
                    'membership_type' => $member->membership_type,
                    'period_start' => Carbon::now()->subMonth(),
                    'period_end' => Carbon::now(),
                ]);
            }
        }

        // Create enhanced attendance records
        foreach ($members as $member) {
            $usedDates = [];
            
            // Create more attendance records for active members
            $attendanceCount = $member->is_active ? rand(8, 20) : rand(0, 5);
            
            foreach (range(1, $attendanceCount) as $index) {
                do {
                    $date = Carbon::now()->subDays(rand(0, 60));
                    $dateString = $date->toDateString();
                } while (in_array($dateString, $usedDates));
                
                $usedDates[] = $dateString;
                
                $checkIn = $date->copy()->setTime(rand(6, 20), rand(0, 59));
                $checkOut = $checkIn->copy()->addMinutes(rand(30, 120));
                $duration = $checkOut->diffInMinutes($checkIn);
                $calories = $duration * rand(6, 10);
                
                Attendance::create([
                    'member_id' => $member->id,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'date' => $date,
                    'workout_duration' => $duration,
                    'calories_burned' => $calories,
                    'notes' => $this->generateWorkoutNotes(),
                ]);
            }
        }

        // Create enhanced progress records
        foreach ($members as $member) {
            $currentWeight = $member->weight;
            $currentBodyFat = 20 + rand(-8, 8);
            $currentMuscle = 30 + rand(-5, 5);
            $usedProgressDates = [];
            
            foreach (range(1, rand(4, 8)) as $index) {
                do {
                    $recordDate = Carbon::now()->subDays(rand(0, 90));
                    $dateString = $recordDate->toDateString();
                } while (in_array($dateString, $usedProgressDates));
                
                $usedProgressDates[] = $dateString;
                
                // Simulate realistic progress
                $weightChange = rand(-15, 15) * 0.1;
                $currentWeight = max(45, $currentWeight + $weightChange);
                
                $bodyFatChange = rand(-5, 5) * 0.1;
                $currentBodyFat = max(10, min(40, $currentBodyFat + $bodyFatChange));
                
                $muscleChange = rand(-3, 5) * 0.1;
                $currentMuscle = max(25, $currentMuscle + $muscleChange);
                
                $height = $member->height;
                $bmi = $height > 0 ? round($currentWeight / (($height / 100) * ($height / 100)), 1) : null;
                
                Progress::create([
                    'member_id' => $member->id,
                    'record_date' => $recordDate,
                    'weight' => $currentWeight,
                    'height' => $height,
                    'bmi' => $bmi,
                    'body_fat_percentage' => $currentBodyFat,
                    'muscle_mass' => $currentMuscle,
                    'chest_measurement' => 95 + rand(-10, 10) + ($currentMuscle - 30),
                    'waist_measurement' => 80 + rand(-15, 15) - ($weightChange * 2),
                    'hip_measurement' => 95 + rand(-10, 10),
                    'arm_measurement' => 32 + rand(-5, 5) + ($currentMuscle - 30) * 0.5,
                    'thigh_measurement' => 55 + rand(-8, 8) + ($currentMuscle - 30) * 0.3,
                    'notes' => $this->generateProgressNotes($weightChange),
                ]);
            }
        }

        // Create enhanced workout plans
        foreach ($members as $member) {
            if (rand(0, 2) > 0) {
                $trainer = $trainers[array_rand($trainers)];
                $goal = ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Endurance Training', 'Strength Building'][rand(0, 4)];
                $difficulty = ['beginner', 'intermediate', 'advanced'][rand(0, 2)];
                
                WorkoutPlan::create([
                    'trainer_id' => $trainer->id,
                    'member_id' => $member->id,
                    'title' => $goal . ' Program for ' . $member->name,
                    'description' => 'Customized ' . strtolower($goal) . ' program designed specifically for ' . $member->name . '. Focus on achieving fitness goals through structured exercises and proper nutrition.',
                    'goal' => $goal,
                    'duration_weeks' => rand(4, 12),
                    'difficulty_level' => $difficulty,
                    'exercises' => $this->generateExercises($goal, $difficulty),
                    'schedule' => $this->generateWorkoutSchedule(),
                    'diet_plan' => $this->generateDietPlan($goal),
                    'status' => ['active', 'completed', 'paused'][rand(0, 2)],
                ]);
            }
        }

        // Create specific data for test accounts
        $this->createTestAccountData($members, $trainers);

        $this->call([
            CashierSeeder::class,
        ]);

        $this->command->info('Enhanced database seeded successfully!');
        $this->command->info('Admin Login: admin@gym.com / password');
        $this->command->info('Trainer Login: trainer@gym.com / password');
        $this->command->info('Member Login: member@gym.com / password');
        $this->command->info('Cashier Login: cashier@gym.com / password');
        $this->command->info('Sample Trainer: sarah@gym.com / password');
        $this->command->info('Sample Member: lisa@gym.com / password');
    }

    private function generateRandomTime()
    {
        $hours = rand(6, 20);
        $minutes = rand(0, 1) ? '00' : '30';
        return sprintf('%02d:%02d:00', $hours, $minutes);
    }

    private function generateRandomEndTime()
    {
        $hours = rand(7, 21);
        $minutes = rand(0, 1) ? '00' : '30';
        return sprintf('%02d:%02d:00', $hours, $minutes);
    }

    private function calculateSessionPrice($hourlyRate, $sessionType)
    {
        return match($sessionType) {
            'personal_training' => $hourlyRate,
            'group_session' => $hourlyRate * 0.6,
            'consultation' => $hourlyRate * 0.5,
            default => $hourlyRate,
        };
    }

    private function generateSessionNotes()
    {
        $notes = [
            'Great session focusing on form and technique',
            'High intensity workout with focus on cardio',
            'Strength training with emphasis on compound movements',
            'Flexibility and mobility work',
            'Endurance training session',
            'Skill development and technique refinement',
            'Recovery and active rest day',
            'Full body workout completed',
            'Upper body focus with accessory work',
            'Lower body strength and conditioning'
        ];
        return $notes[array_rand($notes)];
    }

    private function generateWorkoutNotes()
    {
        $notes = [
            'Completed scheduled workout routine',
            'Extra cardio session added',
            'Focus on proper form and technique',
            'Increased weights from previous session',
            'Good energy levels throughout workout',
            'Working on mobility and flexibility',
            'Strength training focus',
            'Endurance building session',
            'Recovery workout - light intensity',
            'Skill practice and technique work'
        ];
        return $notes[array_rand($notes)];
    }

    private function generateProgressNotes($weightChange)
    {
        if ($weightChange > 0.5) {
            return 'Weight gain observed, maintaining muscle mass';
        } elseif ($weightChange < -0.5) {
            return 'Weight loss progress, maintaining strength';
        } else {
            return 'Maintaining current weight, strength improvements noted';
        }
    }

    private function generateExercises($goal, $difficulty)
    {
        $baseExercises = [
            'Weight Loss' => [
                ['name' => 'Treadmill Running', 'sets' => 1, 'reps' => '20-30 min', 'rest' => '30s'],
                ['name' => 'Burpees', 'sets' => 3, 'reps' => '12-15', 'rest' => '45s'],
                ['name' => 'Mountain Climbers', 'sets' => 3, 'reps' => '20-25', 'rest' => '30s'],
                ['name' => 'Jumping Jacks', 'sets' => 3, 'reps' => '30-40', 'rest' => '30s'],
            ],
            'Muscle Gain' => [
                ['name' => 'Bench Press', 'sets' => 4, 'reps' => '8-12', 'rest' => '60-90s'],
                ['name' => 'Barbell Squats', 'sets' => 4, 'reps' => '8-10', 'rest' => '90s'],
                ['name' => 'Deadlifts', 'sets' => 3, 'reps' => '6-8', 'rest' => '120s'],
                ['name' => 'Pull-ups', 'sets' => 3, 'reps' => '6-10', 'rest' => '60s'],
            ],
            'General Fitness' => [
                ['name' => 'Push-ups', 'sets' => 3, 'reps' => '12-15', 'rest' => '45s'],
                ['name' => 'Bodyweight Squats', 'sets' => 3, 'reps' => '15-20', 'rest' => '45s'],
                ['name' => 'Plank', 'sets' => 3, 'reps' => '30-60s', 'rest' => '30s'],
                ['name' => 'Lunges', 'sets' => 3, 'reps' => '12-15 each', 'rest' => '45s'],
            ]
        ];

        $exercises = $baseExercises[$goal] ?? $baseExercises['General Fitness'];

        // Adjust for difficulty - FIXED: Simple adjustments without preg_replace
        if ($difficulty === 'beginner') {
            foreach ($exercises as &$exercise) {
                $exercise['sets'] = max(2, $exercise['sets'] - 1);
                // Simple adjustment for reps - reduce numbers slightly
                if (isset($exercise['reps'])) {
                    $exercise['reps'] = str_replace(
                        ['20-30', '12-15', '20-25', '30-40', '8-12', '8-10', '6-8', '6-10', '15-20'],
                        ['15-25', '8-12', '15-20', '20-30', '5-8', '5-8', '4-6', '4-8', '10-15'],
                        $exercise['reps']
                    );
                }
            }
        } elseif ($difficulty === 'advanced') {
            foreach ($exercises as &$exercise) {
                $exercise['sets'] = $exercise['sets'] + 1;
                // Simple adjustment for reps - increase numbers slightly
                if (isset($exercise['reps'])) {
                    $exercise['reps'] = str_replace(
                        ['20-30', '12-15', '20-25', '30-40', '8-12', '8-10', '6-8', '6-10', '15-20'],
                        ['25-35', '15-20', '25-30', '35-45', '10-15', '10-12', '8-10', '8-12', '18-25'],
                        $exercise['reps']
                    );
                }
            }
        }

        return $exercises;
    }

    private function generateWorkoutSchedule()
    {
        return [
            'monday' => ['Chest', 'Triceps', 'Cardio'],
            'tuesday' => ['Back', 'Biceps', 'Abs'],
            'wednesday' => ['Rest', 'Light Cardio'],
            'thursday' => ['Legs', 'Shoulders'],
            'friday' => ['Full Body', 'Cardio'],
            'saturday' => ['Active Recovery', 'Mobility'],
            'sunday' => ['Rest']
        ];
    }

    private function generateDietPlan($goal)
    {
        $diets = [
            'Weight Loss' => [
                'breakfast' => 'Protein shake with fruits',
                'lunch' => 'Grilled chicken with vegetables',
                'dinner' => 'Salmon with quinoa and greens',
                'snacks' => 'Greek yogurt, almonds'
            ],
            'Muscle Gain' => [
                'breakfast' => 'Oatmeal with protein powder and bananas',
                'lunch' => 'Lean beef with sweet potatoes',
                'dinner' => 'Chicken breast with brown rice',
                'snacks' => 'Protein bars, peanut butter'
            ],
            'General Fitness' => [
                'breakfast' => 'Whole grain toast with eggs',
                'lunch' => 'Turkey sandwich with salad',
                'dinner' => 'Fish with vegetables',
                'snacks' => 'Fruits, nuts'
            ]
        ];

        return $diets[$goal] ?? $diets['General Fitness'];
    }

    private function createTestAccountData($members, $trainers)
    {
        // Enhanced data for test member (member@gym.com)
        $testMember = User::where('email', 'member@gym.com')->first();
        if ($testMember) {
            // Create comprehensive booking history
            foreach (range(1, 8) as $index) {
                $trainer = $trainers[array_rand($trainers)];
                $bookingDate = Carbon::now()->addDays(rand(1, 30));
                $sessionType = ['personal_training', 'group_session', 'consultation'][rand(0, 2)];
                
                Booking::create([
                    'member_id' => $testMember->id,
                    'trainer_id' => $trainer->id,
                    'booking_date' => $bookingDate,
                    'start_time' => $this->generateRandomTime(),
                    'end_time' => $this->generateRandomEndTime(),
                    'session_type' => $sessionType,
                    'status' => ['pending', 'confirmed', 'completed'][rand(0, 2)],
                    'price' => $this->calculateSessionPrice($trainer->hourly_rate, $sessionType),
                    'notes' => 'Test member session - ' . $sessionType,
                ]);
            }

            // Create today's session for test member
            Booking::create([
                'member_id' => $testMember->id,
                'trainer_id' => $trainers[0]->id,
                'booking_date' => today(),
                'start_time' => '18:00:00',
                'end_time' => '19:00:00',
                'session_type' => 'personal_training',
                'status' => 'confirmed',
                'price' => $trainers[0]->hourly_rate,
                'notes' => 'Evening personal training session',
            ]);
        }

        // Enhanced data for test trainer (trainer@gym.com)
        $testTrainer = User::where('email', 'trainer@gym.com')->first();
        if ($testTrainer) {
            // Create multiple workout plans for the test trainer
            foreach (array_slice($members, 0, 5) as $member) {
                WorkoutPlan::create([
                    'trainer_id' => $testTrainer->id,
                    'member_id' => $member->id,
                    'title' => 'Custom Program for ' . $member->name,
                    'description' => 'Personalized training program designed by ' . $testTrainer->name,
                    'goal' => ['Weight Loss', 'Muscle Gain', 'General Fitness'][rand(0, 2)],
                    'duration_weeks' => rand(6, 12),
                    'difficulty_level' => ['beginner', 'intermediate', 'advanced'][rand(0, 2)],
                    'exercises' => $this->generateExercises('General Fitness', 'intermediate'),
                    'schedule' => $this->generateWorkoutSchedule(),
                    'status' => 'active',
                ]);
            }
        }
    }
}