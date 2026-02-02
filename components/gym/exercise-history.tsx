"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, Calendar, Dumbbell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { Routine, WorkoutLog } from "@/lib/types"

interface ExerciseHistoryProps {
  routines: Routine[]
  workoutLogs: WorkoutLog[]
  getExerciseWeightHistory: (routineId: string, exerciseId: string) => {
    date: string
    weekNumber: number
    dayNumber: number
    dayName: string
    sets: { weight: number; reps: number }[]
    maxWeight: number
    totalVolume: number
  }[]
  getUniqueExercisesFromRoutine: (routine: Routine) => {
    id: string
    name: string
    muscleGroup: string
  }[]
}

export function ExerciseHistory({
  routines,
  workoutLogs,
  getExerciseWeightHistory,
  getUniqueExercisesFromRoutine,
}: ExerciseHistoryProps) {
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(routines[0]?.id || "")
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId)
  const exerciseList = selectedRoutine ? getUniqueExercisesFromRoutine(selectedRoutine) : []

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  if (routines.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Crea una rutina primero para ver el historial de ejercicios
          </p>
        </CardContent>
      </Card>
    )
  }

  // Agrupar ejercicios por grupo muscular
  const exercisesByMuscle = exerciseList.reduce((acc, ex) => {
    if (!acc[ex.muscleGroup]) {
      acc[ex.muscleGroup] = []
    }
    acc[ex.muscleGroup].push(ex)
    return acc
  }, {} as Record<string, typeof exerciseList>)

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Pesos por Ejercicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Seleccionar Rutina</Label>
            <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Seleccionar rutina..." />
              </SelectTrigger>
              <SelectContent>
                {routines.map((routine) => (
                  <SelectItem key={routine.id} value={routine.id}>
                    {routine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {Object.entries(exercisesByMuscle).map(([muscleGroup, exercises]) => (
        <div key={muscleGroup} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Badge variant="secondary">{muscleGroup}</Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""}
            </span>
          </h3>
          
          {exercises.map((exercise) => {
            const history = getExerciseWeightHistory(selectedRoutineId, exercise.id)
            const hasData = history.length > 0
            const isExpanded = expandedExercises.has(exercise.id)
            
            // Calcular progreso
            let progressIcon = <Minus className="h-4 w-4 text-muted-foreground" />
            let progressText = "Sin datos"
            let progressColor = "text-muted-foreground"
            
            if (history.length >= 2) {
              const firstMax = history[0].maxWeight
              const lastMax = history[history.length - 1].maxWeight
              const diff = lastMax - firstMax
              const percentChange = firstMax > 0 ? ((diff / firstMax) * 100).toFixed(1) : 0
              
              if (diff > 0) {
                progressIcon = <TrendingUp className="h-4 w-4 text-primary" />
                progressText = `+${diff}kg (+${percentChange}%)`
                progressColor = "text-primary"
              } else if (diff < 0) {
                progressIcon = <TrendingDown className="h-4 w-4 text-destructive" />
                progressText = `${diff}kg (${percentChange}%)`
                progressColor = "text-destructive"
              } else {
                progressText = "Sin cambio"
              }
            } else if (history.length === 1) {
              progressText = `Peso máx: ${history[0].maxWeight}kg`
            }

            return (
              <Card key={exercise.id} className="border-border bg-card">
                <Collapsible open={isExpanded}>
                  <CollapsibleTrigger
                    onClick={() => toggleExercise(exercise.id)}
                    className="w-full"
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">{exercise.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {history.length} registro{history.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className={`flex items-center gap-1 ${progressColor}`}>
                        {progressIcon}
                        <span className="text-sm">{progressText}</span>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {!hasData ? (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          Aún no hay registros para este ejercicio
                        </p>
                      ) : (
                        <>
                          {/* Gráfico de progreso */}
                          <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={formatDate}
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                />
                                <YAxis
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                  tickFormatter={(v) => `${v}kg`}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                  }}
                                  labelFormatter={(value) =>
                                    new Date(value).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "long",
                                    })
                                  }
                                  formatter={(value: number) => [`${value} kg`, "Peso máx"]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="maxWeight"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={2}
                                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Tabla de historial */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">Detalle por sesión</h4>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {[...history].reverse().map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/30 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">
                                        {new Date(entry.date).toLocaleDateString("es-ES", {
                                          weekday: "short",
                                          day: "numeric",
                                          month: "short",
                                        })}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        Sem {entry.weekNumber} - {entry.dayName}
                                      </Badge>
                                    </div>
                                    <span className="text-sm font-medium text-primary">
                                      Máx: {entry.maxWeight}kg
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {entry.sets.map((set, setIdx) => (
                                      <span
                                        key={setIdx}
                                        className="text-xs px-2 py-1 rounded bg-input text-foreground"
                                      >
                                        S{setIdx + 1}: {set.weight}kg x {set.reps}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Volumen total: {entry.totalVolume.toLocaleString()}kg
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      ))}

      {exerciseList.length === 0 && selectedRoutine && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Esta rutina no tiene ejercicios configurados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
