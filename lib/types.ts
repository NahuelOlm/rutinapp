export interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

// Definición de series en la rutina (template)
export interface RoutineSet {
  id: string
  targetReps: number
}

// Ejercicio dentro de una rutina (template)
export interface RoutineExercise {
  id: string
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  sets: RoutineSet[]
}

// Un día de entrenamiento en la rutina (template)
export interface RoutineDay {
  id: string
  name: string // "Día 1", "Día 2", "Día 3"
  exercises: RoutineExercise[]
}

// Una semana en la rutina (template)
export interface RoutineWeek {
  id: string
  weekNumber: number // 1-6
  days: RoutineDay[]
}

// La rutina completa (template)
export interface Routine {
  id: string
  name: string
  totalWeeks: number
  daysPerWeek: number
  weeks: RoutineWeek[]
  createdAt: string
}

// Set completado con peso registrado
export interface CompletedSet {
  id: string
  targetReps: number
  actualReps: number
  weight: number
}

// Ejercicio completado en un entrenamiento
export interface CompletedExercise {
  id: string
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  sets: CompletedSet[]
}

// Entrenamiento registrado (log)
export interface WorkoutLog {
  id: string
  routineId: string
  weekNumber: number
  dayNumber: number
  dayName: string
  date: string
  exercises: CompletedExercise[]
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
}

export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Abdominales",
  "Glúteos",
  "Cardio",
  "Estiramiento",
  "Correr",
] as const

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: "1", name: "Press de banca", muscleGroup: "Pecho" },
  { id: "2", name: "Press inclinado", muscleGroup: "Pecho" },
  { id: "3", name: "Aperturas con mancuernas", muscleGroup: "Pecho" },
  { id: "4", name: "Fondos en paralelas", muscleGroup: "Pecho" },
  { id: "5", name: "Dominadas", muscleGroup: "Espalda" },
  { id: "6", name: "Remo con barra", muscleGroup: "Espalda" },
  { id: "7", name: "Peso muerto", muscleGroup: "Espalda" },
  { id: "8", name: "Jalón al pecho", muscleGroup: "Espalda" },
  { id: "9", name: "Remo en polea baja", muscleGroup: "Espalda" },
  { id: "10", name: "Press militar", muscleGroup: "Hombros" },
  { id: "11", name: "Elevaciones laterales", muscleGroup: "Hombros" },
  { id: "12", name: "Elevaciones frontales", muscleGroup: "Hombros" },
  { id: "13", name: "Pájaros", muscleGroup: "Hombros" },
  { id: "14", name: "Curl de bíceps", muscleGroup: "Bíceps" },
  { id: "15", name: "Curl martillo", muscleGroup: "Bíceps" },
  { id: "16", name: "Curl concentrado", muscleGroup: "Bíceps" },
  { id: "17", name: "Curl en banco inclinado", muscleGroup: "Bíceps" },
  { id: "18", name: "Extensiones de tríceps", muscleGroup: "Tríceps" },
  { id: "19", name: "Press francés", muscleGroup: "Tríceps" },
  { id: "20", name: "Fondos para tríceps", muscleGroup: "Tríceps" },
  { id: "21", name: "Patada de tríceps", muscleGroup: "Tríceps" },
  { id: "22", name: "Sentadillas", muscleGroup: "Piernas" },
  { id: "23", name: "Prensa de piernas", muscleGroup: "Piernas" },
  { id: "24", name: "Extensiones de cuádriceps", muscleGroup: "Piernas" },
  { id: "25", name: "Curl de piernas", muscleGroup: "Piernas" },
  { id: "26", name: "Estocadas con mancuernas", muscleGroup: "Piernas" },
  { id: "27", name: "Elevación de gemelos", muscleGroup: "Piernas" },
  { id: "28", name: "Peso muerto rumano", muscleGroup: "Piernas" },
  { id: "29", name: "Crunch abdominal", muscleGroup: "Abdominales" },
  { id: "30", name: "Plancha", muscleGroup: "Abdominales" },
  { id: "31", name: "Elevación de piernas", muscleGroup: "Abdominales" },
  { id: "32", name: "Hip thrust", muscleGroup: "Glúteos" },
  { id: "33", name: "Patada de glúteo", muscleGroup: "Glúteos" },
  { id: "34", name: "Cruce de poleas", muscleGroup: "Pecho" },
  { id: "35", name: "Doble dead bug", muscleGroup: "Abdominales" },
  { id: "36", name: "Plancha lateral", muscleGroup: "Abdominales" },
  { id: "37", name: "Bíceps W", muscleGroup: "Bíceps" },
  { id: "38", name: "Isquios maquina", muscleGroup: "Piernas" },
  { id: "39", name: "Face pull", muscleGroup: "Espalda" },
  { id: "41", name: "Estiramiento cervical y dorsal", muscleGroup: "Estiramiento" },
  { id: "42", name: "Movilidad torácica + estiramientos", muscleGroup: "Estiramiento" },
  { id: "43", name: "Flexiones de brazos", muscleGroup: "Bíceps" },
  { id: "44", name: "Trotar", muscleGroup: "Correr" },
]
