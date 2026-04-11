export type MuscleGroup =
  | 'Chest' | 'Back' | 'Shoulder' | 'Biceps' | 'Triceps'
  | 'Legs' | 'Core' | 'Cardio';

export interface GymSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: GymSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  type: 'Push' | 'Pull' | 'Leg' | 'Full Body' | 'Custom';
  exercises: Exercise[];
  durationMinutes: number;
  notes?: string;
  completed: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  unit: string;
  caloriesPer: number;
  proteinPer: number;
  carbsPer: number;
  fatPer: number;
  usageCount?: number;   // how many times added to meal log
  isCustom?: boolean;    // true = added via AI analysis
}

export interface MealEntry {
  id: string;
  foodId: string;
  quantity: number;
  date: string;
  mealType: 'Sarapan' | 'Snack Pagi' | 'Makan Siang' | 'Pre-Workout' | 'Post-Workout' | 'Makan Malam' | 'Sebelum Tidur';
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  targetCalories: number;
  targetProtein: number;
  gymDaysPerWeek: number;
  goal: 'Bulking' | 'Cutting' | 'Maintenance';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
