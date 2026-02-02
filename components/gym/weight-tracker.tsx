"use client"

import React from "react"

import { useState } from "react"
import { Plus, Scale, Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeightEntry } from "@/lib/types"

interface WeightTrackerProps {
  entries: WeightEntry[]
  onSave: (entry: WeightEntry) => void
  onDelete: (id: string) => void
}

export function WeightTracker({ entries, onSave, onDelete }: WeightTrackerProps) {
  const [weight, setWeight] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return

    const entry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date,
      weight: Number(weight),
    }
    onSave(entry)
    setWeight("")
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const latestWeight = sortedEntries[0]?.weight
  const previousWeight = sortedEntries[1]?.weight
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : null

  const firstWeight = sortedEntries[sortedEntries.length - 1]?.weight
  const totalChange = latestWeight && firstWeight ? latestWeight - firstWeight : null

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Registrar Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="weight" className="text-foreground">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.5"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="date" className="text-foreground">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button type="submit" disabled={!weight}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Peso Actual</p>
                <p className="text-3xl font-bold text-foreground">{latestWeight?.toFixed(1)} kg</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Cambio Reciente</p>
                <div className="flex items-center justify-center gap-1">
                  {weightChange !== null ? (
                    <>
                      {weightChange > 0 ? (
                        <TrendingUp className="h-5 w-5 text-destructive" />
                      ) : weightChange < 0 ? (
                        <TrendingDown className="h-5 w-5 text-primary" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p
                        className={`text-3xl font-bold ${
                          weightChange > 0
                            ? "text-destructive"
                            : weightChange < 0
                              ? "text-primary"
                              : "text-foreground"
                        }`}
                      >
                        {weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)} kg
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground">--</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Cambio Total</p>
                <div className="flex items-center justify-center gap-1">
                  {totalChange !== null ? (
                    <>
                      {totalChange > 0 ? (
                        <TrendingUp className="h-5 w-5 text-destructive" />
                      ) : totalChange < 0 ? (
                        <TrendingDown className="h-5 w-5 text-primary" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p
                        className={`text-3xl font-bold ${
                          totalChange > 0
                            ? "text-destructive"
                            : totalChange < 0
                              ? "text-primary"
                              : "text-foreground"
                        }`}
                      >
                        {totalChange > 0 ? "+" : ""}
                        {totalChange.toFixed(1)} kg
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground">--</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Peso</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay registros de peso. Agrega tu primer registro arriba.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedEntries.map((entry, index) => {
                const prevEntry = sortedEntries[index + 1]
                const change = prevEntry ? entry.weight - prevEntry.weight : null

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-medium text-foreground">{entry.weight.toFixed(1)} kg</span>
                      {change !== null && (
                        <span
                          className={`text-sm ${
                            change > 0
                              ? "text-destructive"
                              : change < 0
                                ? "text-primary"
                                : "text-muted-foreground"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(entry.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
