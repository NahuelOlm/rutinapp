"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import type { Routine, RoutineWeek, RoutineDay, RoutineExercise, Exercise } from "@/lib/types"
import { MUSCLE_GROUPS } from "@/lib/types"

interface RoutineBuilderProps {
  exercises: Exercise[]
  onSave: (routine: Routine) => void
  onCancel: () => void
  existingRoutine?: Routine
}

export function RoutineBuilder({ exercises, onSave, onCancel, existingRoutine }: RoutineBuilderProps) {
  const [routineName, setRoutineName] = useState(existingRoutine?.name || "Mi Rutina")
  const [totalWeeks, setTotalWeeks] = useState(existingRoutine?.totalWeeks || 6)
  const [daysPerWeek, setDaysPerWeek] = useState(existingRoutine?.daysPerWeek || 3)
  
  // Solo guardamos los días base (semana 1), las demás semanas son copias automáticas
  const [baseDays, setBaseDays] = useState<RoutineDay[]>(() => {
    if (existingRoutine?.weeks?.[0]?.days) {
      return existingRoutine.weeks[0].days
    }
    return []
  })
  
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(["day-1"]))
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all")

  const initializeDays = () => {
    const newDays: RoutineDay[] = []
    for (let d = 1; d <= daysPerWeek; d++) {
      newDays.push({
        id: `day-${d}`,
        name: `Día ${d}`,
        exercises: [],
      })
    }
    setBaseDays(newDays)
    setExpandedDays(new Set(["day-1"]))
  }

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dayId)) {
        newSet.delete(dayId)
      } else {
        newSet.add(dayId)
      }
      return newSet
    })
  }

  const addExerciseToDay = (dayId: string, exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const newExercise: RoutineExercise = {
      id: `${dayId}-ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: [{ id: `set-${Date.now()}`, targetReps: 12 }],
    }

    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: [...day.exercises, newExercise],
        }
      })
    )
  }

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.filter((e) => e.id !== exerciseId),
        }
      })
    )
  }

  const addSetToExercise = (dayId: string, exerciseId: string) => {
    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex
            return {
              ...ex,
              sets: [...ex.sets, { id: `set-${Date.now()}`, targetReps: 12 }],
            }
          }),
        }
      })
    )
  }

  const removeSetFromExercise = (dayId: string, exerciseId: string, setId: string) => {
    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex
            return {
              ...ex,
              sets: ex.sets.filter((s) => s.id !== setId),
            }
          }),
        }
      })
    )
  }

  const updateSetReps = (dayId: string, exerciseId: string, setId: string, reps: number) => {
    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          exercises: day.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, targetReps: reps } : s)),
            }
          }),
        }
      })
    )
  }

  const updateDayName = (dayId: string, name: string) => {
    setBaseDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day
        return { ...day, name }
      })
    )
  }

  // Genera la estructura completa de semanas replicando los días base
  const generateWeeks = (): RoutineWeek[] => {
    const weeks: RoutineWeek[] = []
    for (let w = 1; w <= totalWeeks; w++) {
      weeks.push({
        id: `week-${w}`,
        weekNumber: w,
        days: baseDays.map((day, index) => ({
          ...day,
          id: `week-${w}-day-${index + 1}`,
          exercises: day.exercises.map((ex) => ({
            ...ex,
            id: `week-${w}-${ex.id}`,
            sets: ex.sets.map((s) => ({
              ...s,
              id: `week-${w}-${s.id}`,
            })),
          })),
        })),
      })
    }
    return weeks
  }

  const handleSave = () => {
    const routine: Routine = {
      id: existingRoutine?.id || `routine-${Date.now()}`,
      name: routineName,
      totalWeeks,
      daysPerWeek,
      weeks: generateWeeks(),
      createdAt: existingRoutine?.createdAt || new Date().toISOString(),
    }
    onSave(routine)
  }

  const filteredExercises =
    selectedMuscleGroup === "all"
      ? exercises
      : exercises.filter((e) => e.muscleGroup === selectedMuscleGroup)

  const totalExercises = baseDays.reduce((acc, day) => acc + day.exercises.length, 0)

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Configuración de Rutina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="routineName" className="text-foreground">Nombre de la rutina</Label>
              <Input
                id="routineName"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Mi Rutina"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalWeeks" className="text-foreground">Semanas totales</Label>
              <Select
                value={totalWeeks.toString()}
                onValueChange={(v) => setTotalWeeks(Number(v))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} semanas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysPerWeek" className="text-foreground">Días por semana</Label>
              <Select
                value={daysPerWeek.toString()}
                onValueChange={(v) => setDaysPerWeek(Number(v))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} días
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {baseDays.length === 0 ? (
            <Button onClick={initializeDays} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Crear Estructura de {daysPerWeek} Días
            </Button>
          ) : (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <p className="text-sm text-foreground">
                Los ejercicios que agregues se repetirán automáticamente en las <strong>{totalWeeks} semanas</strong>.
                Solo necesitas configurar los {daysPerWeek} días una vez.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {baseDays.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <Label className="w-full text-muted-foreground text-sm">Filtrar ejercicios por grupo muscular:</Label>
            <Button
              variant={selectedMuscleGroup === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMuscleGroup("all")}
            >
              Todos
            </Button>
            {MUSCLE_GROUPS.map((group) => (
              <Button
                key={group}
                variant={selectedMuscleGroup === group ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMuscleGroup(group)}
              >
                {group}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {baseDays.map((day, dayIndex) => (
              <Card key={day.id} className="border-border bg-card">
                <Collapsible open={expandedDays.has(day.id)}>
                  <CollapsibleTrigger
                    onClick={() => toggleDay(day.id)}
                    className="w-full"
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        {expandedDays.has(day.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg text-foreground">{day.name}</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                          {day.exercises.length} ejercicios
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Nombre del día (opcional)</Label>
                        <Input
                          value={day.name}
                          onChange={(e) => updateDayName(day.id, e.target.value)}
                          placeholder={`Día ${dayIndex + 1}`}
                          className="bg-input border-border text-foreground max-w-xs"
                        />
                      </div>
                      
                      {day.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{exercise.exerciseName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {exercise.muscleGroup}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExerciseFromDay(day.id, exercise.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={set.id}
                                className="flex items-center gap-1 rounded-md border border-border bg-input px-2 py-1"
                              >
                                <span className="text-xs text-muted-foreground">S{setIndex + 1}:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={set.targetReps}
                                  onChange={(e) =>
                                    updateSetReps(day.id, exercise.id, set.id, Number(e.target.value))
                                  }
                                  className="h-6 w-14 bg-transparent border-0 p-0 text-center text-sm text-foreground"
                                />
                                <span className="text-xs text-muted-foreground">reps</span>
                                {exercise.sets.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSetFromExercise(day.id, exercise.id, set.id)}
                                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSetToExercise(day.id, exercise.id)}
                              className="h-7"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Serie
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Select onValueChange={(v) => addExerciseToDay(day.id, v)}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Agregar ejercicio..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredExercises.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                              {ex.name} ({ex.muscleGroup})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={totalExercises === 0}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Rutina ({totalExercises} ejercicios x {totalWeeks} semanas)
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
