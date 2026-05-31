import { Exercise, MuscleGroup } from '@/types/data';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const getDefaultExercises = (): Exercise[] => {
  const exercises: Exercise[] = [];

  const createExercise = (
    name: string,
    muscleGroup: MuscleGroup,
    sets: number,
    reps: number,
    restSeconds: number = 90,
    notes?: string
  ): Exercise => ({
    id: generateId(),
    name,
    muscleGroup,
    sets,
    reps,
    restSeconds,
    notes,
    isCustom: false,
  });

  // Chest exercises
  exercises.push(
    createExercise('Bench Press', 'Chest', 4, 10, 120, 'Keep shoulders back'),
    createExercise('Incline Dumbbell Press', 'Chest', 4, 12, 90),
    createExercise('Cable Fly', 'Chest', 3, 15, 60, 'Squeeze at top'),
    createExercise('Push-ups', 'Chest', 3, 20, 60),
    createExercise('Dips', 'Chest', 3, 12, 90, 'Lean forward for chest'),
    createExercise('Chest Press Machine', 'Chest', 4, 12, 90),
    createExercise('Pec Deck', 'Chest', 3, 15, 60),
    createExercise('Decline Press', 'Chest', 4, 10, 90)
  );

  // Back exercises
  exercises.push(
    createExercise('Deadlift', 'Back', 4, 8, 180, 'Maintain neutral spine'),
    createExercise('Pull-ups', 'Back', 4, 10, 90),
    createExercise('Barbell Row', 'Back', 4, 10, 90, 'Squeeze shoulder blades'),
    createExercise('Lat Pulldown', 'Back', 4, 12, 90),
    createExercise('Seated Cable Row', 'Back', 4, 12, 90),
    createExercise('Single-arm Dumbbell Row', 'Back', 3, 12, 60, 'Support with bench'),
    createExercise('Face Pulls', 'Back', 3, 15, 60),
    createExercise('T-Bar Row', 'Back', 4, 10, 90)
  );

  // Biceps exercises
  exercises.push(
    createExercise('Barbell Curl', 'Biceps', 4, 12, 60, 'No swinging'),
    createExercise('Dumbbell Hammer Curl', 'Biceps', 3, 12, 60),
    createExercise('Preacher Curl', 'Biceps', 3, 12, 60),
    createExercise('Concentration Curl', 'Biceps', 3, 15, 60),
    createExercise('Cable Curl', 'Biceps', 3, 15, 60),
    createExercise('Incline Dumbbell Curl', 'Biceps', 3, 12, 60),
    createExercise('Reverse Curl', 'Biceps', 3, 12, 60),
    createExercise('Spider Curl', 'Biceps', 3, 12, 60)
  );

  // Triceps exercises
  exercises.push(
    createExercise('Tricep Pushdown', 'Triceps', 4, 15, 60),
    createExercise('Skull Crushers', 'Triceps', 3, 12, 60, 'Keep elbows tucked'),
    createExercise('Overhead Dumbbell Extension', 'Triceps', 3, 12, 60),
    createExercise('Close-grip Bench Press', 'Triceps', 4, 10, 90),
    createExercise('Tricep Dips', 'Triceps', 3, 12, 60),
    createExercise('Rope Pushdown', 'Triceps', 3, 15, 60),
    createExercise('Diamond Push-ups', 'Triceps', 3, 12, 60),
    createExercise('Kickbacks', 'Triceps', 3, 15, 60)
  );

  // Quads exercises
  exercises.push(
    createExercise('Squat', 'Quads', 4, 10, 180, 'Knees track over toes'),
    createExercise('Leg Press', 'Quads', 4, 12, 120),
    createExercise('Leg Extension', 'Quads', 4, 15, 60),
    createExercise('Walking Lunges', 'Quads', 3, 12, 90),
    createExercise('Hack Squat', 'Quads', 4, 12, 120),
    createExercise('Goblet Squat', 'Quads', 4, 12, 90),
    createExercise('Bulgarian Split Squat', 'Quads', 3, 10, 90),
    createExercise('Front Squat', 'Quads', 4, 8, 120)
  );

  // Hamstrings exercises
  exercises.push(
    createExercise('Romanian Deadlift', 'Hamstrings', 4, 10, 120, 'Slight knee bend'),
    createExercise('Leg Curl', 'Hamstrings', 4, 15, 60),
    createExercise('Good Morning', 'Hamstrings', 3, 12, 90),
    createExercise('Nordic Curl', 'Hamstrings', 3, 8, 90),
    createExercise('Swiss Ball Hamstring Curl', 'Hamstrings', 3, 15, 60),
    createExercise('Single-leg RDL', 'Hamstrings', 3, 10, 60),
    createExercise('Glute Ham Raise', 'Hamstrings', 3, 12, 90),
    createExercise('Stiff-leg Deadlift', 'Hamstrings', 4, 10, 120)
  );

  // Calves exercises
  exercises.push(
    createExercise('Standing Calf Raise', 'Calves', 4, 20, 60),
    createExercise('Seated Calf Raise', 'Calves', 4, 20, 60),
    createExercise('Donkey Calf Raise', 'Calves', 3, 20, 60),
    createExercise('Leg Press Calf Raise', 'Calves', 3, 20, 60),
    createExercise('Single-leg Calf Raise', 'Calves', 3, 15, 45),
    createExercise('Tibialis Raise', 'Calves', 3, 15, 45)
  );

  // Shoulders exercises
  exercises.push(
    createExercise('Overhead Press', 'Shoulders', 4, 10, 120, 'Core engaged'),
    createExercise('Lateral Raise', 'Shoulders', 4, 15, 60, 'Lead with elbows'),
    createExercise('Front Raise', 'Shoulders', 3, 15, 60),
    createExercise('Reverse Fly', 'Shoulders', 3, 15, 60),
    createExercise('Arnold Press', 'Shoulders', 3, 12, 90),
    createExercise('Upright Row', 'Shoulders', 3, 12, 60),
    createExercise('Shrugs', 'Shoulders', 4, 15, 60),
    createExercise('Cable Lateral Raise', 'Shoulders', 3, 15, 60)
  );

  // Abs exercises
  exercises.push(
    createExercise('Crunch', 'Abs', 3, 25, 45),
    createExercise('Plank', 'Abs', 3, 60, 60, 'Hold for time'),
    createExercise('Leg Raise', 'Abs', 3, 15, 60),
    createExercise('Bicycle Crunch', 'Abs', 3, 20, 45),
    createExercise('Russian Twist', 'Abs', 3, 20, 60),
    createExercise('Mountain Climbers', 'Abs', 3, 20, 45),
    createExercise('Dead Bug', 'Abs', 3, 15, 60),
    createExercise('Ab Wheel Rollout', 'Abs', 3, 10, 60)
  );

  // Glutes exercises
  exercises.push(
    createExercise('Hip Thrust', 'Glutes', 4, 12, 90, 'Squeeze at top'),
    createExercise('Glute Bridge', 'Glutes', 3, 15, 60),
    createExercise('Cable Kickback', 'Glutes', 3, 15, 60),
    createExercise('Sumo Squat', 'Glutes', 4, 12, 90),
    createExercise('Step-ups', 'Glutes', 3, 12, 60),
    createExercise('Clam Shell', 'Glutes', 3, 20, 45),
    createExercise('Monster Walk', 'Glutes', 3, 20, 45),
    createExercise('Curtsy Lunge', 'Glutes', 3, 12, 60)
  );

  // Cardio exercises
  exercises.push(
    createExercise('Treadmill Run', 'Cardio', 1, 1, 0, '20-30 minutes'),
    createExercise('Jump Rope', 'Cardio', 1, 1, 0, '10-15 minutes'),
    createExercise('Cycling', 'Cardio', 1, 1, 0, '30 minutes'),
    createExercise('Rowing Machine', 'Cardio', 1, 1, 0, '15-20 minutes'),
    createExercise('Stair Climber', 'Cardio', 1, 1, 0, '15-20 minutes'),
    createExercise('Burpees', 'Cardio', 3, 15, 60),
    createExercise('Box Jumps', 'Cardio', 3, 12, 90),
    createExercise('Battle Ropes', 'Cardio', 3, 30, 60)
  );

  return exercises;
};
