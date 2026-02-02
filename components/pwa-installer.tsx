"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }

    // Check if iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone;

    if (isStandalone) {
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS instructions after delay if not installed
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-ios-dismissed");
        if (!dismissed) {
          setShowIOSInstructions(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa-ios-dismissed", "true");
  };

  if (!showInstallBanner && !showIOSInstructions) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Instalar GymTrack</h3>
            {isIOS ? (
              <p className="text-sm text-muted-foreground mt-1">
                Toca el boton compartir{" "}
                <span className="inline-block w-5 h-5 align-middle">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                </span>{" "}
                y luego {'"Agregar a inicio"'}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Instala la app para acceso rapido y uso sin conexion
              </p>
            )}
          </div>
          <button
            onClick={dismissBanner}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1"
            >
              Instalar
            </Button>
            <Button
              onClick={dismissBanner}
              variant="outline"
              size="sm"
            >
              Ahora no
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
