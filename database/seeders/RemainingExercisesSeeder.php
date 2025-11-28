<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RemainingExercisesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder adds the 21 remaining exercises that are missing from the database
     */
    public function run(): void
    {
        $exercises = [
            // CHEST
            [
                'name' => 'Barbell Bench Press',
                'category' => 'chest',
                'description' => 'The king of chest exercises. The barbell bench press is a compound movement that builds overall chest mass and strength.',
                'steps' => [
                    'Lie flat on bench with feet planted on ground',
                    'Grip barbell slightly wider than shoulder-width',
                    'Unrack the bar and position it above your chest',
                    'Lower the bar to mid-chest with control',
                    'Press the bar back up to full extension',
                    'Keep shoulder blades retracted throughout'
                ],
                'equipment' => ['Barbell', 'Flat Bench', 'Weight Plates'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/bench-press.gif',
                'muscle_groups' => [
                    'primary' => ['Pectoralis Major'],
                    'secondary' => ['Triceps', 'Anterior Deltoids']
                ],
                'tips' => [
                    'Keep your shoulder blades squeezed together',
                    'Don\'t bounce the bar off your chest',
                    'Maintain a natural arch in your lower back'
                ]
            ],
            [
                'name' => 'Incline Barbell Bench Press',
                'category' => 'chest',
                'description' => 'Targets the upper portion of the chest. The incline angle shifts emphasis to the clavicular head of the pectoralis major.',
                'steps' => [
                    'Set bench to 30-45 degree incline',
                    'Lie back and grip barbell slightly wider than shoulders',
                    'Unrack and position bar above upper chest',
                    'Lower bar to upper chest area',
                    'Press back up to full extension',
                    'Keep elbows at 45-degree angle'
                ],
                'equipment' => ['Barbell', 'Incline Bench', 'Weight Plates'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/incline-barbell-bench-press.gif',
                'muscle_groups' => [
                    'primary' => ['Upper Pectoralis Major'],
                    'secondary' => ['Anterior Deltoids', 'Triceps']
                ],
                'tips' => [
                    'Don\'t set incline too steep (max 45 degrees)',
                    'Focus on upper chest contraction',
                    'Use slightly less weight than flat bench'
                ]
            ],
            [
                'name' => 'Dumbbell Bench Press',
                'category' => 'chest',
                'description' => 'Allows for greater range of motion and independent arm movement compared to barbell bench press.',
                'steps' => [
                    'Sit on bench with dumbbells on thighs',
                    'Lie back and position dumbbells at chest level',
                    'Press dumbbells up and slightly together',
                    'Lower dumbbells until elbows are at 90 degrees',
                    'Press back up to starting position',
                    'Maintain control throughout movement'
                ],
                'equipment' => ['Dumbbells', 'Flat Bench'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/dumbbell-bench-press.gif',
                'muscle_groups' => [
                    'primary' => ['Pectoralis Major'],
                    'secondary' => ['Triceps', 'Anterior Deltoids']
                ],
                'tips' => [
                    'Greater range of motion than barbell',
                    'Helps correct muscle imbalances',
                    'Keep dumbbells level with each other'
                ]
            ],
            [
                'name' => 'Push-Ups',
                'category' => 'chest',
                'description' => 'A fundamental bodyweight exercise that builds chest, shoulders, and triceps strength.',
                'steps' => [
                    'Start in plank position with hands shoulder-width apart',
                    'Keep body in straight line from head to heels',
                    'Lower chest toward ground by bending elbows',
                    'Go down until chest nearly touches floor',
                    'Push back up to starting position',
                    'Maintain core engagement throughout'
                ],
                'equipment' => ['None (Bodyweight)'],
                'difficulty_level' => 'beginner',
                'gif_path' => null,
                'muscle_groups' => [
                    'primary' => ['Pectoralis Major'],
                    'secondary' => ['Triceps', 'Anterior Deltoids', 'Core']
                ],
                'tips' => [
                    'Don\'t let hips sag',
                    'Keep elbows at 45-degree angle',
                    'Modify on knees if needed'
                ]
            ],

            // SHOULDERS
            [
                'name' => 'Barbell Overhead Press',
                'category' => 'shoulders',
                'description' => 'The foundational shoulder exercise for building overall deltoid mass and strength.',
                'steps' => [
                    'Stand with feet shoulder-width apart',
                    'Hold barbell at shoulder level, hands just outside shoulders',
                    'Press bar straight overhead',
                    'Lock out arms at top',
                    'Lower back to shoulders with control',
                    'Keep core tight throughout'
                ],
                'equipment' => ['Barbell', 'Weight Plates'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/barbell-overhead-press.gif',
                'muscle_groups' => [
                    'primary' => ['Anterior Deltoids', 'Medial Deltoids'],
                    'secondary' => ['Triceps', 'Upper Chest', 'Core']
                ],
                'tips' => [
                    'Don\'t lean back excessively',
                    'Press in straight line overhead',
                    'Engage glutes to protect lower back'
                ]
            ],
            [
                'name' => 'Lateral Raises',
                'category' => 'shoulders',
                'description' => 'Isolation exercise targeting the medial deltoids for shoulder width.',
                'steps' => [
                    'Stand with dumbbells at sides',
                    'Keep slight bend in elbows',
                    'Raise dumbbells out to sides to shoulder height',
                    'Lead with elbows, not hands',
                    'Lower back down with control',
                    'Avoid swinging or using momentum'
                ],
                'equipment' => ['Dumbbells'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/lateral-raises.gif',
                'muscle_groups' => [
                    'primary' => ['Medial Deltoids'],
                    'secondary' => ['Trapezius']
                ],
                'tips' => [
                    'Use lighter weight for strict form',
                    'Don\'t raise above shoulder height',
                    'Focus on mind-muscle connection'
                ]
            ],
            [
                'name' => 'Rear Delt Flyes',
                'category' => 'shoulders',
                'description' => 'Targets the often-neglected posterior deltoids, important for shoulder balance and posture.',
                'steps' => [
                    'Bend forward at hips with slight knee bend',
                    'Hold dumbbells hanging down',
                    'Raise dumbbells out to sides in wide arc',
                    'Squeeze shoulder blades together',
                    'Lower back down with control',
                    'Keep back flat throughout'
                ],
                'equipment' => ['Dumbbells'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/rear-delt-flyes.gif',
                'muscle_groups' => [
                    'primary' => ['Posterior Deltoids'],
                    'secondary' => ['Rhomboids', 'Middle Trapezius']
                ],
                'tips' => [
                    'Essential for shoulder health',
                    'Use light weight',
                    'Focus on rear delt contraction'
                ]
            ],
            [
                'name' => 'Upright Rows',
                'category' => 'shoulders',
                'description' => 'Compound movement targeting shoulders and traps.',
                'steps' => [
                    'Hold barbell with hands close together',
                    'Pull bar straight up along body',
                    'Lead with elbows, keep them high',
                    'Raise to upper chest level',
                    'Lower back down with control',
                    'Keep bar close to body'
                ],
                'equipment' => ['Barbell or Dumbbells'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/upright-rows.gif',
                'muscle_groups' => [
                    'primary' => ['Medial Deltoids', 'Upper Trapezius'],
                    'secondary' => ['Anterior Deltoids']
                ],
                'tips' => [
                    'Don\'t pull too high if you have shoulder issues',
                    'Keep elbows above hands',
                    'Use EZ bar for wrist comfort'
                ]
            ],
            [
                'name' => 'Shrugs',
                'category' => 'shoulders',
                'description' => 'Primary exercise for building the trapezius muscles.',
                'steps' => [
                    'Hold barbell or dumbbells at sides',
                    'Keep arms straight',
                    'Shrug shoulders straight up toward ears',
                    'Hold peak contraction briefly',
                    'Lower shoulders back down',
                    'Don\'t roll shoulders'
                ],
                'equipment' => ['Barbell or Dumbbells'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/shrugs.gif',
                'muscle_groups' => [
                    'primary' => ['Upper Trapezius'],
                    'secondary' => ['Levator Scapulae']
                ],
                'tips' => [
                    'Straight up and down motion only',
                    'Don\'t roll shoulders in circles',
                    'Heavy weight can be used'
                ]
            ],
            [
                'name' => 'Reverse Pec Deck',
                'category' => 'shoulders',
                'description' => 'Machine exercise for isolating the posterior deltoids.',
                'steps' => [
                    'Sit facing the pec deck machine',
                    'Grip handles with arms extended',
                    'Pull handles back in wide arc',
                    'Squeeze shoulder blades together',
                    'Return to starting position with control',
                    'Keep chest against pad'
                ],
                'equipment' => ['Pec Deck Machine'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/reverse-pec-deck.gif',
                'muscle_groups' => [
                    'primary' => ['Posterior Deltoids'],
                    'secondary' => ['Rhomboids', 'Trapezius']
                ],
                'tips' => [
                    'Great for rear delt isolation',
                    'Keep movement controlled',
                    'Don\'t use momentum'
                ]
            ],
            [
                'name' => 'Plate Front Raises',
                'category' => 'shoulders',
                'description' => 'Front deltoid isolation using a weight plate.',
                'steps' => [
                    'Hold weight plate at bottom with both hands',
                    'Stand with feet shoulder-width apart',
                    'Raise plate forward to shoulder height',
                    'Keep arms slightly bent',
                    'Lower back down with control',
                    'Maintain core engagement'
                ],
                'equipment' => ['Weight Plate'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/plate-front-raise.gif',
                'muscle_groups' => [
                    'primary' => ['Anterior Deltoids'],
                    'secondary' => ['Upper Chest', 'Core']
                ],
                'tips' => [
                    'Don\'t swing the plate',
                    'Control the movement',
                    'Stop at shoulder height'
                ]
            ],

            // BACK
            [
                'name' => 'Pull-Ups',
                'category' => 'back',
                'description' => 'The ultimate bodyweight back exercise for building lat width and overall upper body strength.',
                'steps' => [
                    'Hang from bar with overhand grip, hands wider than shoulders',
                    'Pull yourself up until chin is over bar',
                    'Keep core engaged',
                    'Lower yourself with control to full extension',
                    'Avoid swinging or kipping',
                    'Full range of motion for best results'
                ],
                'equipment' => ['Pull-up Bar'],
                'difficulty_level' => 'intermediate',
                'gif_path' => null,
                'muscle_groups' => [
                    'primary' => ['Latissimus Dorsi'],
                    'secondary' => ['Biceps', 'Rhomboids', 'Rear Deltoids']
                ],
                'tips' => [
                    'Use assistance band if needed',
                    'Pull with elbows, not hands',
                    'Squeeze lats at top'
                ]
            ],
            [
                'name' => 'Wide Grip Lat Pulldown',
                'category' => 'back',
                'description' => 'Wide grip variation emphasizing lat width.',
                'steps' => [
                    'Sit at lat pulldown machine',
                    'Grip bar with wide overhand grip',
                    'Pull bar down to upper chest',
                    'Squeeze lats at bottom',
                    'Control the return to starting position',
                    'Keep chest up throughout'
                ],
                'equipment' => ['Lat Pulldown Machine'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/wide-grip-lat-pulldown.gif',
                'muscle_groups' => [
                    'primary' => ['Latissimus Dorsi'],
                    'secondary' => ['Biceps', 'Rhomboids']
                ],
                'tips' => [
                    'Wider grip emphasizes lats',
                    'Don\'t lean back too much',
                    'Focus on lat contraction'
                ]
            ],
            [
                'name' => 'Barbell Rows',
                'category' => 'back',
                'description' => 'Fundamental rowing exercise for building back thickness.',
                'steps' => [
                    'Bend forward at hips with slight knee bend',
                    'Grip barbell with hands shoulder-width apart',
                    'Pull bar to lower chest/upper abs',
                    'Keep elbows close to body',
                    'Squeeze back at top',
                    'Lower with control'
                ],
                'equipment' => ['Barbell', 'Weight Plates'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/barbell rows.gif',
                'muscle_groups' => [
                    'primary' => ['Latissimus Dorsi', 'Rhomboids'],
                    'secondary' => ['Biceps', 'Erector Spinae']
                ],
                'tips' => [
                    'Keep back flat, don\'t round',
                    'Pull to lower chest, not neck',
                    'Great for overall back mass'
                ]
            ],
            [
                'name' => 'T-Bar Rows',
                'category' => 'back',
                'description' => 'Rowing variation using a landmine or T-bar machine for back thickness.',
                'steps' => [
                    'Straddle T-bar with feet shoulder-width apart',
                    'Bend forward at hips',
                    'Grip handles and pull to chest',
                    'Keep elbows close to body',
                    'Squeeze back at top',
                    'Lower with control'
                ],
                'equipment' => ['T-Bar Row Machine or Landmine'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/t-bar-rows.gif',
                'muscle_groups' => [
                    'primary' => ['Latissimus Dorsi', 'Rhomboids'],
                    'secondary' => ['Biceps', 'Erector Spinae']
                ],
                'tips' => [
                    'Keep chest up',
                    'Don\'t round lower back',
                    'Great for mid-back thickness'
                ]
            ],
            [
                'name' => 'Seated Cable Rows',
                'category' => 'back',
                'description' => 'Cable rowing exercise providing constant tension on the back muscles.',
                'steps' => [
                    'Sit at cable row station',
                    'Grip handle with both hands',
                    'Pull handle to lower chest',
                    'Keep back straight',
                    'Squeeze shoulder blades together',
                    'Return to starting position with control'
                ],
                'equipment' => ['Cable Machine', 'Row Attachment'],
                'difficulty_level' => 'beginner',
                'gif_path' => null,
                'muscle_groups' => [
                    'primary' => ['Latissimus Dorsi', 'Rhomboids'],
                    'secondary' => ['Biceps', 'Rear Deltoids']
                ],
                'tips' => [
                    'Don\'t lean back too far',
                    'Keep torso relatively upright',
                    'Focus on squeezing back'
                ]
            ],
            [
                'name' => 'Romanian Deadlifts',
                'category' => 'back',
                'description' => 'Targets the posterior chain with emphasis on hamstrings and lower back.',
                'steps' => [
                    'Hold barbell with overhand grip',
                    'Stand with feet hip-width apart',
                    'Hinge at hips, lowering bar down legs',
                    'Keep back straight and knees slightly bent',
                    'Feel stretch in hamstrings',
                    'Drive hips forward to return to standing'
                ],
                'equipment' => ['Barbell', 'Weight Plates'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/romanian-deadlifts.gif',
                'muscle_groups' => [
                    'primary' => ['Hamstrings', 'Glutes', 'Erector Spinae'],
                    'secondary' => ['Forearms', 'Trapezius']
                ],
                'tips' => [
                    'Keep bar close to legs',
                    'Don\'t round your back',
                    'Great for hamstring development'
                ]
            ],
            [
                'name' => 'Sumo Deadlifts',
                'category' => 'back',
                'description' => 'Wide stance deadlift variation emphasizing glutes and inner thighs.',
                'steps' => [
                    'Stand with feet wider than shoulders, toes pointed out',
                    'Grip barbell with hands inside legs',
                    'Keep back straight, chest up',
                    'Drive through heels to stand up',
                    'Squeeze glutes at top',
                    'Lower back down with control'
                ],
                'equipment' => ['Barbell', 'Weight Plates'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/sumo-deadlifts.gif',
                'muscle_groups' => [
                    'primary' => ['Glutes', 'Quadriceps', 'Erector Spinae'],
                    'secondary' => ['Hamstrings', 'Adductors']
                ],
                'tips' => [
                    'Wider stance than conventional deadlift',
                    'Keep knees tracking over toes',
                    'Good for those with long legs'
                ]
            ],
            [
                'name' => 'Rack Pulls',
                'category' => 'back',
                'description' => 'Partial deadlift from elevated position, allowing for heavier loads on the upper back.',
                'steps' => [
                    'Set barbell on rack at knee height',
                    'Grip barbell with overhand or mixed grip',
                    'Pull bar up by extending hips and back',
                    'Squeeze shoulder blades at top',
                    'Lower back to rack with control',
                    'Keep back straight throughout'
                ],
                'equipment' => ['Barbell', 'Power Rack', 'Weight Plates'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/rack-pulls.gif',
                'muscle_groups' => [
                    'primary' => ['Erector Spinae', 'Trapezius'],
                    'secondary' => ['Glutes', 'Hamstrings', 'Forearms']
                ],
                'tips' => [
                    'Can use heavier weight than full deadlift',
                    'Great for upper back and traps',
                    'Don\'t round your back'
                ]
            ],

            // ARMS
            [
                'name' => 'Concentration Curls',
                'category' => 'arms',
                'description' => 'Isolated bicep exercise performed seated for maximum focus on the bicep peak.',
                'steps' => [
                    'Sit on bench with legs spread',
                    'Rest elbow on inner thigh',
                    'Curl dumbbell up to shoulder',
                    'Squeeze bicep at top',
                    'Lower with control',
                    'Keep upper arm stationary'
                ],
                'equipment' => ['Dumbbell', 'Bench'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/Concentration-Curl.gif',
                'muscle_groups' => [
                    'primary' => ['Biceps Brachii'],
                    'secondary' => ['Brachialis']
                ],
                'tips' => [
                    'Perfect isolation exercise',
                    'Focus on peak contraction',
                    'Great for bicep peak development'
                ]
            ],
            [
                'name' => 'Preacher Curls',
                'category' => 'arms',
                'description' => 'Isolated bicep exercise using a preacher bench to prevent cheating.',
                'steps' => [
                    'Sit at preacher bench',
                    'Rest arms on pad',
                    'Curl weight up',
                    'Squeeze biceps at top',
                    'Lower to full extension',
                    'Keep arms on pad throughout'
                ],
                'equipment' => ['Preacher Bench', 'EZ Bar or Dumbbells'],
                'difficulty_level' => 'beginner',
                'gif_path' => '/lottie/exercises/preacher-curl.gif',
                'muscle_groups' => [
                    'primary' => ['Biceps Brachii (especially lower portion)'],
                    'secondary' => ['Brachialis']
                ],
                'tips' => [
                    'Can\'t cheat with this exercise',
                    'Great for bicep peak',
                    'Don\'t hyperextend at bottom'
                ]
            ],

            // LEGS
            [
                'name' => 'Bulgarian Split Squats',
                'category' => 'legs',
                'description' => 'Unilateral leg exercise that builds strength and balance.',
                'steps' => [
                    'Stand in front of bench with one foot elevated behind you',
                    'Lower down into lunge position',
                    'Keep front knee tracking over toes',
                    'Push through front heel to return to start',
                    'Complete all reps then switch legs',
                    'Maintain upright torso'
                ],
                'equipment' => ['Bench', 'Optional: Dumbbells'],
                'difficulty_level' => 'intermediate',
                'gif_path' => '/lottie/exercises/Bulgarian-Split-Squat.gif',
                'muscle_groups' => [
                    'primary' => ['Quadriceps', 'Glutes'],
                    'secondary' => ['Hamstrings', 'Core']
                ],
                'tips' => [
                    'Great for correcting imbalances',
                    'Keep front knee stable',
                    'Excellent for single-leg strength'
                ]
            ],
        ];

        foreach ($exercises as $exerciseData) {
            $slug = Str::slug($exerciseData['name']);
            
            // Check if exercise already exists
            if (Exercise::where('slug', $slug)->exists()) {
                continue;
            }

            Exercise::create([
                'name' => $exerciseData['name'],
                'slug' => $slug,
                'category' => $exerciseData['category'],
                'description' => $exerciseData['description'],
                'steps' => json_encode($exerciseData['steps']),
                'equipment' => json_encode($exerciseData['equipment']),
                'difficulty_level' => $exerciseData['difficulty_level'],
                'gif_path' => $exerciseData['gif_path'],
                'muscle_groups' => json_encode($exerciseData['muscle_groups']),
                'tips' => json_encode($exerciseData['tips']),
            ]);
        }

        $this->command->info('✅ Added 21 remaining exercises successfully!');
    }
}
