"use client"

import { useState, useEffect } from "react"
import { Check, ChevronLeft, Dumbbell, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Routine, RoutineDay, WorkoutLog, CompletedExercise, CompletedSet } from "@/lib/types"

interface WorkoutExecutorProps {
  routine: Routine
  weekNumber: number
  dayNumber: number
  getLastWeights: (exerciseId: string) => number[] | null
  onSave: (log: WorkoutLog) => void
  onCancel: () => void
}

export function WorkoutExecutor({
  routine,
  weekNumber,
  dayNumber,
  getLastWeights,
  onSave,
  onCancel,
}: WorkoutExecutorProps) {
  const week = routine.weeks.find((w) => w.weekNumber === weekNumber)
  const day = week?.days[dayNumber - 1]

  const [exerciseWeights, setExerciseWeights] = useState<{
    [exerciseId: string]: { [setIndex: number]: { weight: number; reps: number } }
  }>({})
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())
  const [startTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  useEffect(() => {
    if (!day) return
    const initialWeights: typeof exerciseWeights = {}
    day.exercises.forEach((exercise) => {
      const lastWeights = getLastWeights(exercise.exerciseId)
      initialWeights[exercise.id] = {}
      exercise.sets.forEach((set, index) => {
        initialWeights[exercise.id][index] = {
          weight: lastWeights?.[index] || 0,
          reps: set.targetReps,
        }
      })
    })
    setExerciseWeights(initialWeights)
  }, [day, getLastWeights])

  if (!week || !day) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No se encontró el día de entrenamiento</p>
          <Button onClick={onCancel} className="mt-4">
            Volver
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const updateWeight = (exerciseId: string, setIndex: number, weight: number) => {
    setExerciseWeights((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setIndex]: { ...prev[exerciseId][setIndex], weight },
      },
    }))
  }

  const updateReps = (exerciseId: string, setIndex: number, reps: number) => {
    setExerciseWeights((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setIndex]: { ...prev[exerciseId][setIndex], reps },
      },
    }))
  }

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`
    setCompletedSets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const totalSets = day.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedCount = completedSets.size
  const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0

  const handleFinish = () => {
    const completedExercises: CompletedExercise[] = day.exercises.map((exercise) => {
      const sets: CompletedSet[] = exercise.sets.map((set, index) => ({
        id: `completed-${Date.now()}-${index}`,
        targetReps: set.targetReps,
        actualReps: exerciseWeights[exercise.id]?.[index]?.reps || set.targetReps,
        weight: exerciseWeights[exercise.id]?.[index]?.weight || 0,
      }))
      return {
        id: `completed-ex-${Date.now()}-${exercise.id}`,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup,
        sets,
      }
    })

    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      routineId: routine.id,
      weekNumber,
      dayNumber,
      dayName: day.name,
      date: new Date().toISOString(),
      exercises: completedExercises,
    }

    onSave(log)
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <div className="mt-2">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Semana {weekNumber} - {day.name}
            </CardTitle>
            <CardDescription>{routine.name}</CardDescription>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="text-foreground font-medium">
                {completedCount} / {totalSets} series
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {day.exercises.map((exercise) => (
          <Card key={exercise.id} className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{exercise.exerciseName}</CardTitle>
                <Badge variant="secondary">{exercise.muscleGroup}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-sm text-muted-foreground px-2">
                  <span>Serie</span>
                  <span className="text-center">Peso (kg)</span>
                  <span className="text-center">Reps</span>
                  <span></span>
                </div>
                {exercise.sets.map((set, setIndex) => {
                  const isComplete = completedSets.has(`${exercise.id}-${setIndex}`)
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center rounded-lg p-2 transition-colors ${
                        isComplete ? "bg-primary/10" : "bg-secondary/30"
                      }`}
                    >
                      <Badge
                        variant={isComplete ? "default" : "outline"}
                        className="w-8 justify-center"
                      >
                        {setIndex + 1}
                      </Badge>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={exerciseWeights[exercise.id]?.[setIndex]?.weight || ""}
                        onChange={(e) =>
                          updateWeight(exercise.id, setIndex, Number(e.target.value))
                        }
                        placeholder="0"
                        className="h-10 text-center bg-input border-border text-foreground"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={exerciseWeights[exercise.id]?.[setIndex]?.reps || set.targetReps}
                        onChange={(e) =>
                          updateReps(exercise.id, setIndex, Number(e.target.value))
                        }
                        className="h-10 text-center bg-input border-border text-foreground"
                      />
                      <Button
                        variant={isComplete ? "default" : "outline"}
                        size="icon"
                        onClick={() => toggleSetComplete(exercise.id, setIndex)}
                        className={isComplete ? "" : ""}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleFinish} className="min-w-32">
          <Check className="mr-2 h-4 w-4" />
          Finalizar Entrenamiento
        </Button>
      </div>
    </div>
  )
}
