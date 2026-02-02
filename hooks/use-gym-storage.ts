"use client"

import { useState, useEffect, useCallback } from "react"
import type { Routine, WorkoutLog, WeightEntry, Exercise } from "@/lib/types"
import { DEFAULT_EXERCISES } from "@/lib/types"

const ROUTINES_KEY = "gymtrack_routines"
const WORKOUT_LOGS_KEY = "gymtrack_workout_logs"
const WEIGHT_KEY = "gymtrack_weight"
const EXERCISES_KEY = "gymtrack_exercises"
const ACTIVE_ROUTINE_KEY = "gymtrack_active_routine"

export function useGymStorage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoutines = localStorage.getItem(ROUTINES_KEY)
      const storedLogs = localStorage.getItem(WORKOUT_LOGS_KEY)
      const storedWeight = localStorage.getItem(WEIGHT_KEY)
      const storedExercises = localStorage.getItem(EXERCISES_KEY)
      const storedActiveRoutine = localStorage.getItem(ACTIVE_ROUTINE_KEY)

      setRoutines(storedRoutines ? JSON.parse(storedRoutines) : [])
      setWorkoutLogs(storedLogs ? JSON.parse(storedLogs) : [])
      setWeightEntries(storedWeight ? JSON.parse(storedWeight) : [])
      setExercises(storedExercises ? JSON.parse(storedExercises) : DEFAULT_EXERCISES)
      setActiveRoutineId(storedActiveRoutine || null)
      setIsLoaded(true)
    }
  }, [])

  // Routines
  const saveRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === routine.id)
      let newRoutines: Routine[]
      if (existingIndex >= 0) {
        newRoutines = [...prev]
        newRoutines[existingIndex] = routine
      } else {
        newRoutines = [...prev, routine]
      }
      localStorage.setItem(ROUTINES_KEY, JSON.stringify(newRoutines))
      return newRoutines
    })
  }, [])

  const deleteRoutine = useCallback((id: string) => {
    setRoutines((prev) => {
      const newRoutines = prev.filter((r) => r.id !== id)
      localStorage.setItem(ROUTINES_KEY, JSON.stringify(newRoutines))
      return newRoutines
    })
    if (activeRoutineId === id) {
      setActiveRoutineId(null)
      localStorage.removeItem(ACTIVE_ROUTINE_KEY)
    }
  }, [activeRoutineId])

  const setActiveRoutine = useCallback((id: string | null) => {
    setActiveRoutineId(id)
    if (id) {
      localStorage.setItem(ACTIVE_ROUTINE_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_ROUTINE_KEY)
    }
  }, [])

  // Workout Logs
  const saveWorkoutLog = useCallback((log: WorkoutLog) => {
    setWorkoutLogs((prev) => {
      const existingIndex = prev.findIndex((l) => l.id === log.id)
      let newLogs: WorkoutLog[]
      if (existingIndex >= 0) {
        newLogs = [...prev]
        newLogs[existingIndex] = log
      } else {
        newLogs = [...prev, log]
      }
      localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(newLogs))
      return newLogs
    })
  }, [])

  const deleteWorkoutLog = useCallback((id: string) => {
    setWorkoutLogs((prev) => {
      const newLogs = prev.filter((l) => l.id !== id)
      localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(newLogs))
      return newLogs
    })
  }, [])

  const getLogsForRoutine = useCallback((routineId: string) => {
    return workoutLogs.filter((log) => log.routineId === routineId)
  }, [workoutLogs])

  // Obtener los últimos pesos para un ejercicio en una semana/día específico
  const getLastWeightsForExercise = useCallback((routineId: string, exerciseId: string, weekNumber: number, dayNumber: number) => {
    const logs = workoutLogs
      .filter(
        (log) =>
          log.routineId === routineId &&
          log.weekNumber === weekNumber &&
          log.dayNumber === dayNumber
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (logs.length === 0) return null

    const lastLog = logs[0]
    const exercise = lastLog.exercises.find((e) => e.exerciseId === exerciseId)
    return exercise?.sets.map((s) => s.weight) || null
  }, [workoutLogs])

  // Obtener historial completo de pesos para un ejercicio específico
  const getExerciseWeightHistory = useCallback((routineId: string, exerciseId: string) => {
    const relevantLogs = workoutLogs
      .filter((log) => log.routineId === routineId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const history: {
      date: string
      weekNumber: number
      dayNumber: number
      dayName: string
      sets: { weight: number; reps: number }[]
      maxWeight: number
      totalVolume: number
    }[] = []

    for (const log of relevantLogs) {
      const exercise = log.exercises.find((e) => e.exerciseId === exerciseId)
      if (exercise) {
        const sets = exercise.sets.map((s) => ({ weight: s.weight, reps: s.actualReps }))
        const maxWeight = Math.max(...sets.map((s) => s.weight))
        const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0)
        
        history.push({
          date: log.date,
          weekNumber: log.weekNumber,
          dayNumber: log.dayNumber,
          dayName: log.dayName,
          sets,
          maxWeight,
          totalVolume,
        })
      }
    }

    return history
  }, [workoutLogs])

  // Obtener todos los ejercicios únicos de una rutina
  const getUniqueExercisesFromRoutine = useCallback((routine: Routine) => {
    const exerciseMap = new Map<string, { id: string; name: string; muscleGroup: string }>()
    
    for (const week of routine.weeks) {
      for (const day of week.days) {
        for (const exercise of day.exercises) {
          if (!exerciseMap.has(exercise.exerciseId)) {
            exerciseMap.set(exercise.exerciseId, {
              id: exercise.exerciseId,
              name: exercise.exerciseName,
              muscleGroup: exercise.muscleGroup,
            })
          }
        }
      }
    }
    
    return Array.from(exerciseMap.values())
  }, [])

  // Weight Entries
  const saveWeightEntry = useCallback((entry: WeightEntry) => {
    setWeightEntries((prev) => {
      const existingIndex = prev.findIndex((e) => e.date === entry.date)
      let newEntries: WeightEntry[]
      if (existingIndex >= 0) {
        newEntries = [...prev]
        newEntries[existingIndex] = entry
      } else {
        newEntries = [...prev, entry].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      }
      localStorage.setItem(WEIGHT_KEY, JSON.stringify(newEntries))
      return newEntries
    })
  }, [])

  const deleteWeightEntry = useCallback((id: string) => {
    setWeightEntries((prev) => {
      const newEntries = prev.filter((e) => e.id !== id)
      localStorage.setItem(WEIGHT_KEY, JSON.stringify(newEntries))
      return newEntries
    })
  }, [])

  // Exercises
  const addExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => {
      const newExercises = [...prev, exercise]
      localStorage.setItem(EXERCISES_KEY, JSON.stringify(newExercises))
      return newExercises
    })
  }, [])

  return {
    routines,
    workoutLogs,
    weightEntries,
    exercises,
    activeRoutineId,
    isLoaded,
    saveRoutine,
    deleteRoutine,
    setActiveRoutine,
    saveWorkoutLog,
    deleteWorkoutLog,
    getLogsForRoutine,
    getLastWeightsForExercise,
    getExerciseWeightHistory,
    getUniqueExercisesFromRoutine,
    saveWeightEntry,
    deleteWeightEntry,
    addExercise,
  }
}
