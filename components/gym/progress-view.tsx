"use client"

import { useMemo } from "react"
import { TrendingUp, Dumbbell, Scale, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import type { WorkoutLog, WeightEntry, Routine } from "@/lib/types"

interface ProgressViewProps {
  workoutLogs: WorkoutLog[]
  weightEntries: WeightEntry[]
  routines: Routine[]
}

export function ProgressView({ workoutLogs, weightEntries, routines }: ProgressViewProps) {
  // Weight chart data
  const weightChartData = useMemo(() => {
    return weightEntries
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        peso: entry.weight,
      }))
  }, [weightEntries])

  // Weekly volume data
  const volumeChartData = useMemo(() => {
    const weeklyVolume: { [week: string]: number } = {}
    workoutLogs.forEach((log) => {
      const date = new Date(log.date)
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const weekKey = startOfWeek.toISOString().split("T")[0]

      let volume = 0
      log.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          volume += set.weight * set.actualReps
        })
      })

      weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + volume
    })

    return Object.entries(weeklyVolume)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-8)
      .map(([week, volume]) => ({
        semana: new Date(week).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        volumen: Math.round(volume),
      }))
  }, [workoutLogs])

  // Exercise progress - track max weight per exercise over time
  const exercisesWithProgress = useMemo(() => {
    const exerciseProgress: {
      [exerciseId: string]: {
        name: string
        muscleGroup: string
        history: { date: string; maxWeight: number }[]
      }
    } = {}

    workoutLogs
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((log) => {
        log.exercises.forEach((ex) => {
          if (!exerciseProgress[ex.exerciseId]) {
            exerciseProgress[ex.exerciseId] = {
              name: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              history: [],
            }
          }
          const maxWeight = Math.max(...ex.sets.map((s) => s.weight))
          if (maxWeight > 0) {
            exerciseProgress[ex.exerciseId].history.push({
              date: log.date,
              maxWeight,
            })
          }
        })
      })

    return Object.values(exerciseProgress)
      .filter((ex) => ex.history.length >= 2)
      .map((ex) => {
        const first = ex.history[0].maxWeight
        const last = ex.history[ex.history.length - 1].maxWeight
        const improvement = last - first
        const improvementPercent = first > 0 ? ((last - first) / first) * 100 : 0
        return {
          ...ex,
          first,
          last,
          improvement,
          improvementPercent,
        }
      })
      .sort((a, b) => b.improvementPercent - a.improvementPercent)
  }, [workoutLogs])

  // Stats
  const stats = useMemo(() => {
    const totalWorkouts = workoutLogs.length
    const totalVolume = workoutLogs.reduce((acc, log) => {
      return (
        acc +
        log.exercises.reduce((exAcc, ex) => {
          return exAcc + ex.sets.reduce((setAcc, set) => setAcc + set.weight * set.actualReps, 0)
        }, 0)
      )
    }, 0)

    const activeRoutines = routines.filter((r) =>
      workoutLogs.some((l) => l.routineId === r.id)
    ).length

    return { totalWorkouts, totalVolume, activeRoutines }
  }, [workoutLogs, routines])

  if (workoutLogs.length === 0 && weightEntries.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sin datos de progreso</h3>
          <p className="text-muted-foreground text-center">
            Comienza a registrar tus entrenamientos y peso para ver tu progreso aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entrenamientos</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Scale className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumen Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {(stats.totalVolume / 1000).toFixed(1)}t
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rutinas Activas</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeRoutines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart */}
      {weightChartData.length > 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Evolucion del Peso</CardTitle>
            <CardDescription>Tu peso corporal a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volume Chart */}
      {volumeChartData.length > 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Volumen Semanal</CardTitle>
            <CardDescription>Peso total levantado por semana (kg x reps)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="semana" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volumen"]}
                  />
                  <Bar dataKey="volumen" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Progress */}
      {exercisesWithProgress.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Progreso por Ejercicio</CardTitle>
            <CardDescription>Mejora en peso maximo por ejercicio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exercisesWithProgress.slice(0, 10).map((ex) => (
                <div
                  key={ex.name}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{ex.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {ex.muscleGroup}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{ex.first}kg</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">{ex.last}kg</span>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        ex.improvement > 0
                          ? "text-primary"
                          : ex.improvement < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {ex.improvement > 0 ? "+" : ""}
                      {ex.improvement.toFixed(1)}kg ({ex.improvementPercent > 0 ? "+" : ""}
                      {ex.improvementPercent.toFixed(0)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
