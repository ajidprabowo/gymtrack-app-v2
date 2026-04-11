import { WorkoutSession } from '@/types';
import { genId } from '@/lib/utils';

const today = new Date().toISOString().split('T')[0];
const d1 = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const d2 = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const seedSessions: WorkoutSession[] = [
  {
    id: genId(), date: today, type: 'Push', durationMinutes: 65, completed: true,
    exercises: [
      { id: genId(), name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', sets: [
        { id: genId(), reps: 12, weight: 14, completed: true },
        { id: genId(), reps: 10, weight: 14, completed: true },
        { id: genId(), reps: 10, weight: 16, completed: true },
      ]},
      { id: genId(), name: 'Peck Deck Fly', muscleGroup: 'Chest', sets: [
        { id: genId(), reps: 15, weight: 30, completed: true },
        { id: genId(), reps: 12, weight: 32, completed: true },
      ]},
      { id: genId(), name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulder', sets: [
        { id: genId(), reps: 12, weight: 10, completed: true },
        { id: genId(), reps: 10, weight: 12, completed: true },
        { id: genId(), reps: 10, weight: 12, completed: true },
      ]},
      { id: genId(), name: 'Rope Triceps Push Down', muscleGroup: 'Triceps', sets: [
        { id: genId(), reps: 15, weight: 20, completed: true },
        { id: genId(), reps: 12, weight: 22, completed: true },
      ]},
    ],
  },
  {
    id: genId(), date: d1, type: 'Pull', durationMinutes: 58, completed: true,
    exercises: [
      { id: genId(), name: 'Lat Pull Down Wide Grip', muscleGroup: 'Back', sets: [
        { id: genId(), reps: 12, weight: 40, completed: true },
        { id: genId(), reps: 10, weight: 45, completed: true },
        { id: genId(), reps: 10, weight: 45, completed: true },
      ]},
      { id: genId(), name: 'Seated Cable Row', muscleGroup: 'Back', sets: [
        { id: genId(), reps: 12, weight: 35, completed: true },
        { id: genId(), reps: 10, weight: 40, completed: true },
      ]},
      { id: genId(), name: 'Dumbbell Biceps Curl', muscleGroup: 'Biceps', sets: [
        { id: genId(), reps: 12, weight: 10, completed: true },
        { id: genId(), reps: 10, weight: 12, completed: true },
        { id: genId(), reps: 10, weight: 12, completed: true },
      ]},
    ],
  },
  {
    id: genId(), date: d2, type: 'Leg', durationMinutes: 72, completed: true,
    exercises: [
      { id: genId(), name: 'Leg Press', muscleGroup: 'Legs', sets: [
        { id: genId(), reps: 12, weight: 80, completed: true },
        { id: genId(), reps: 12, weight: 90, completed: true },
        { id: genId(), reps: 10, weight: 100, completed: true },
        { id: genId(), reps: 10, weight: 100, completed: true },
      ]},
      { id: genId(), name: 'Leg Extension', muscleGroup: 'Legs', sets: [
        { id: genId(), reps: 15, weight: 30, completed: true },
        { id: genId(), reps: 12, weight: 35, completed: true },
        { id: genId(), reps: 12, weight: 35, completed: true },
      ]},
      { id: genId(), name: 'Lying Hamstring Curl', muscleGroup: 'Legs', sets: [
        { id: genId(), reps: 12, weight: 25, completed: true },
        { id: genId(), reps: 12, weight: 30, completed: true },
      ]},
      { id: genId(), name: 'Calf Raises', muscleGroup: 'Legs', sets: [
        { id: genId(), reps: 15, weight: 0, completed: true },
        { id: genId(), reps: 15, weight: 0, completed: true },
        { id: genId(), reps: 15, weight: 0, completed: true },
      ]},
    ],
  },
];
