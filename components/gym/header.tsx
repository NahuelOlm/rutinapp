"use client"

import { Dumbbell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type TabType = "rutina" | "entrenar" | "historial" | "peso" | "progreso"

interface HeaderProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  onLogout?: () => void
}

export function Header({ activeTab, setActiveTab, onLogout }: HeaderProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "rutina", label: "Rutina" },
    { id: "entrenar", label: "Entrenar" },
    { id: "historial", label: "Historial" },
    { id: "peso", label: "Peso" },
    { id: "progreso", label: "Progreso" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">GymTrack</span>
          </div>
          {onLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="flex gap-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
