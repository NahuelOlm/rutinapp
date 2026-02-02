"use client"

import { useState } from "react"
import { Calendar, ChevronRight, Dumbbell, Edit, Play, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Routine, WorkoutLog } from "@/lib/types"

interface RoutineSelectorProps {
  routines: Routine[]
  workoutLogs: WorkoutLog[]
  onCreateNew: () => void
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
  onStartWorkout: (routine: Routine, weekNumber: number, dayNumber: number) => void
}

export function RoutineSelector({
  routines,
  workoutLogs,
  onCreateNew,
  onEdit,
  onDelete,
  onStartWorkout,
}: RoutineSelectorProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const getRoutineProgress = (routine: Routine) => {
    const logs = workoutLogs.filter((log) => log.routineId === routine.id)
    const totalWorkouts = routine.totalWeeks * routine.daysPerWeek
    return {
      completed: logs.length,
      total: totalWorkouts,
      percentage: totalWorkouts > 0 ? (logs.length / totalWorkouts) * 100 : 0,
    }
  }

  const getCompletedDays = (routine: Routine) => {
    const logs = workoutLogs.filter((log) => log.routineId === routine.id)
    const completedMap: { [key: string]: boolean } = {}
    logs.forEach((log) => {
      completedMap[`${log.weekNumber}-${log.dayNumber}`] = true
    })
    return completedMap
  }

  if (selectedRoutine) {
    const completedDays = getCompletedDays(selectedRoutine)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedRoutine(null)}
            className="text-muted-foreground"
          >
            <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
            Volver a rutinas
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">{selectedRoutine.name}</CardTitle>
                <CardDescription>
                  {selectedRoutine.totalWeeks} semanas - {selectedRoutine.daysPerWeek} días por
                  semana
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(selectedRoutine)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {selectedRoutine.weeks.map((week) => (
            <Card key={week.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Semana {week.weekNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {week.days.map((day, dayIndex) => {
                    const dayNumber = dayIndex + 1
                    const isCompleted = completedDays[`${week.weekNumber}-${dayNumber}`]
                    const exerciseCount = day.exercises.length

                    return (
                      <Card
                        key={day.id}
                        className={`border transition-colors ${
                          isCompleted
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-secondary/20 hover:border-primary/30"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-foreground">{day.name}</span>
                            {isCompleted && (
                              <Badge variant="default" className="text-xs">
                                Completado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {exerciseCount} ejercicios
                          </p>
                          <div className="text-xs text-muted-foreground mb-3 max-h-20 overflow-y-auto">
                            {day.exercises.slice(0, 4).map((ex) => (
                              <div key={ex.id} className="truncate">
                                • {ex.exerciseName}
                              </div>
                            ))}
                            {day.exercises.length > 4 && (
                              <div className="text-muted-foreground/70">
                                +{day.exercises.length - 4} más
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full"
                            variant={isCompleted ? "secondary" : "default"}
                            size="sm"
                            onClick={() =>
                              onStartWorkout(selectedRoutine, week.weekNumber, dayNumber)
                            }
                          >
                            <Play className="mr-1 h-4 w-4" />
                            {isCompleted ? "Repetir" : "Comenzar"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Mis Rutinas</h2>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Rutina
        </Button>
      </div>

      {routines.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tienes rutinas</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primera rutina de entrenamiento para comenzar
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Rutina
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routines.map((routine) => {
            const progress = getRoutineProgress(routine)
            return (
              <Card
                key={routine.id}
                className="border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedRoutine(routine)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{routine.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {routine.totalWeeks} semanas - {routine.daysPerWeek} días/semana
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(routine)
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(routine.id)
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="text-foreground font-medium">
                      {progress.completed} / {progress.total} entrenamientos
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Creada:{" "}
                      {new Date(routine.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar rutina</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la rutina y todo su historial de
              entrenamientos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId)
                setDeleteId(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
