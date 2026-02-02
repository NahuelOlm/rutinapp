"use client"

import { useState } from "react"
import { Header } from "@/components/gym/header"
import { RoutineBuilder } from "@/components/gym/routine-builder"
import { RoutineSelector } from "@/components/gym/routine-selector"
import { WorkoutExecutor } from "@/components/gym/workout-executor"
import { ExerciseHistory } from "@/components/gym/exercise-history"
import { WeightTracker } from "@/components/gym/weight-tracker"
import { ProgressView } from "@/components/gym/progress-view"
import { PinScreen } from "@/components/pin-screen"
import { useGymStorage } from "@/hooks/use-gym-storage"
import { usePinAuth } from "@/hooks/use-pin-auth"
import type { Routine } from "@/lib/types"

type TabType = "rutina" | "entrenar" | "historial" | "peso" | "progreso"
type ViewMode = "list" | "create" | "edit" | "workout"

export default function GymTrackerApp() {
  const [activeTab, setActiveTab] = useState<TabType>("rutina")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [workoutContext, setWorkoutContext] = useState<{
    routine: Routine
    weekNumber: number
    dayNumber: number
  } | null>(null)

  const {
    isAuthenticated,
    hasPin,
    isLoading: isPinLoading,
    createPin,
    verifyPin,
    logout,
  } = usePinAuth()

  const {
    routines,
    workoutLogs,
    weightEntries,
    exercises,
    isLoaded,
    saveRoutine,
    deleteRoutine,
    saveWorkoutLog,
    getLastWeightsForExercise,
    getExerciseWeightHistory,
    getUniqueExercisesFromRoutine,
    saveWeightEntry,
    deleteWeightEntry,
  } = useGymStorage()

  if (!isLoaded || isPinLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <PinScreen
        mode={hasPin ? "login" : "create"}
        onCreatePin={createPin}
        onVerifyPin={verifyPin}
      />
    )
  }

  const handleCreateRoutine = () => {
    setEditingRoutine(null)
    setViewMode("create")
  }

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine)
    setViewMode("edit")
  }

  const handleSaveRoutine = (routine: Routine) => {
    saveRoutine(routine)
    setViewMode("list")
    setEditingRoutine(null)
  }

  const handleCancelRoutine = () => {
    setViewMode("list")
    setEditingRoutine(null)
  }

  const handleStartWorkout = (routine: Routine, weekNumber: number, dayNumber: number) => {
    setWorkoutContext({ routine, weekNumber, dayNumber })
    setActiveTab("entrenar")
    setViewMode("workout")
  }

  const handleFinishWorkout = (log: typeof workoutLogs[0]) => {
    saveWorkoutLog(log)
    setWorkoutContext(null)
    setViewMode("list")
  }

  const handleCancelWorkout = () => {
    setWorkoutContext(null)
    setViewMode("list")
  }

  // Reset view mode when changing tabs
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab !== "entrenar") {
      setViewMode("list")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {activeTab === "rutina" && (
          <>
            {viewMode === "list" && (
              <RoutineSelector
                routines={routines}
                workoutLogs={workoutLogs}
                onCreateNew={handleCreateRoutine}
                onEdit={handleEditRoutine}
                onDelete={deleteRoutine}
                onStartWorkout={handleStartWorkout}
              />
            )}
            {(viewMode === "create" || viewMode === "edit") && (
              <RoutineBuilder
                exercises={exercises}
                onSave={handleSaveRoutine}
                onCancel={handleCancelRoutine}
                existingRoutine={editingRoutine || undefined}
              />
            )}
          </>
        )}

        {activeTab === "entrenar" && (
          <>
            {workoutContext ? (
              <WorkoutExecutor
                routine={workoutContext.routine}
                weekNumber={workoutContext.weekNumber}
                dayNumber={workoutContext.dayNumber}
                getLastWeights={(exerciseId) =>
                  getLastWeightsForExercise(
                    workoutContext.routine.id,
                    exerciseId,
                    workoutContext.weekNumber,
                    workoutContext.dayNumber
                  )
                }
                onSave={handleFinishWorkout}
                onCancel={handleCancelWorkout}
              />
            ) : (
              <RoutineSelector
                routines={routines}
                workoutLogs={workoutLogs}
                onCreateNew={handleCreateRoutine}
                onEdit={handleEditRoutine}
                onDelete={deleteRoutine}
                onStartWorkout={handleStartWorkout}
              />
            )}
          </>
        )}

        {activeTab === "historial" && (
          <ExerciseHistory
            routines={routines}
            workoutLogs={workoutLogs}
            getExerciseWeightHistory={getExerciseWeightHistory}
            getUniqueExercisesFromRoutine={getUniqueExercisesFromRoutine}
          />
        )}

        {activeTab === "peso" && (
          <WeightTracker
            entries={weightEntries}
            onSave={saveWeightEntry}
            onDelete={deleteWeightEntry}
          />
        )}

        {activeTab === "progreso" && (
          <ProgressView
            workoutLogs={workoutLogs}
            weightEntries={weightEntries}
            routines={routines}
          />
        )}
      </main>
    </div>
  )
}
