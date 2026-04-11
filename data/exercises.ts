import { MuscleGroup } from '@/types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulder', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio',
];

export const EXERCISE_PRESETS: Record<MuscleGroup, string[]> = {
  Chest:    ['Incline Dumbbell Bench Press','Peck Deck Fly','Low to High Cable Fly','Flat Bench Press','Push Up','Cable Crossover'],
  Back:     ['Lat Pull Down Wide Grip','Lat Pull Down Close Grip','Seated Cable Row','Pull Up','Rear Delt Fly','Deadlift','T-Bar Row'],
  Shoulder: ['Dumbbell Shoulder Press','Lateral Raises','Front Raises','Dumbbell Shrugs','Face Pull','Arnold Press'],
  Biceps:   ['Dumbbell Biceps Curl','Preacher Curl','Hammer Curl','Cable Curl','Concentration Curl','Incline Curl'],
  Triceps:  ['Rope Triceps Push Down','Bar Triceps Push Down','Skull Crusher','Diamond Push Up','Overhead Triceps Extension','Dips'],
  Legs:     ['Leg Press','Squat','Goblet Squat','Leg Extension','Lying Hamstring Curl','Calf Raises','Hip Abduction','Romanian Deadlift'],
  Core:     ['Plank','Crunches','Leg Raise','Russian Twist','Cable Crunch','Ab Wheel','Mountain Climber'],
  Cardio:   ['Treadmill','Cycling','Rowing Machine','Jump Rope','HIIT','Elliptical'],
};

export const WORKOUT_PRESETS: Record<string, { name: string; mg: MuscleGroup }[]> = {
  Push: [
    { name: 'Incline Dumbbell Bench Press', mg: 'Chest' },
    { name: 'Peck Deck Fly', mg: 'Chest' },
    { name: 'Dumbbell Shoulder Press', mg: 'Shoulder' },
    { name: 'Lateral Raises', mg: 'Shoulder' },
    { name: 'Rope Triceps Push Down', mg: 'Triceps' },
  ],
  Pull: [
    { name: 'Lat Pull Down Wide Grip', mg: 'Back' },
    { name: 'Seated Cable Row', mg: 'Back' },
    { name: 'Rear Delt Fly', mg: 'Back' },
    { name: 'Dumbbell Biceps Curl', mg: 'Biceps' },
    { name: 'Preacher Curl', mg: 'Biceps' },
  ],
  Leg: [
    { name: 'Leg Press', mg: 'Legs' },
    { name: 'Goblet Squat', mg: 'Legs' },
    { name: 'Leg Extension', mg: 'Legs' },
    { name: 'Lying Hamstring Curl', mg: 'Legs' },
    { name: 'Calf Raises', mg: 'Legs' },
  ],
  'Full Body': [
    { name: 'Leg Press', mg: 'Legs' },
    { name: 'Incline Dumbbell Bench Press', mg: 'Chest' },
    { name: 'Lat Pull Down Wide Grip', mg: 'Back' },
    { name: 'Dumbbell Shoulder Press', mg: 'Shoulder' },
    { name: 'Dumbbell Biceps Curl', mg: 'Biceps' },
  ],
};
