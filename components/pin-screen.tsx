"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface PinScreenProps {
  mode: "create" | "login";
  onCreatePin: (pin: string) => void;
  onVerifyPin: (pin: string) => boolean;
}

export function PinScreen({ mode, onCreatePin, onVerifyPin }: PinScreenProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    
    setError("");

    if (value && index < 3) {
      const refs = isConfirm ? confirmRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 3) {
      const fullPin = newPin.join("");
      
      if (mode === "login") {
        setTimeout(() => {
          const isValid = onVerifyPin(fullPin);
          if (!isValid) {
            setError("PIN incorrecto");
            setPin(["", "", "", ""]);
            inputRefs.current[0]?.focus();
          }
        }, 100);
      } else if (mode === "create") {
        if (step === "enter") {
          setTimeout(() => {
            setStep("confirm");
            setTimeout(() => confirmRefs.current[0]?.focus(), 100);
          }, 100);
        } else if (isConfirm) {
          setTimeout(() => {
            if (pin.join("") === fullPin) {
              onCreatePin(fullPin);
            } else {
              setError("Los PINs no coinciden");
              setConfirmPin(["", "", "", ""]);
              confirmRefs.current[0]?.focus();
            }
          }, 100);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === "Backspace") {
      const currentPin = isConfirm ? confirmPin : pin;
      const refs = isConfirm ? confirmRefs : inputRefs;
      
      if (!currentPin[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const renderPinInputs = (
    values: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    isConfirm = false
  ) => (
    <div className="flex gap-3 justify-center">
      {values.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className="w-14 h-14 text-center text-2xl font-bold bg-secondary border-border focus:border-primary focus:ring-primary"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            {mode === "create" ? (
              <Dumbbell className="w-8 h-8 text-primary" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl text-foreground">
              {mode === "create" ? "Crear PIN" : "GymTrack"}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {mode === "create"
                ? step === "enter"
                  ? "Crea un PIN de 4 dígitos para proteger tu app"
                  : "Confirma tu PIN"
                : "Ingresa tu PIN para continuar"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "create" && step === "confirm" ? (
            renderPinInputs(confirmPin, confirmRefs, true)
          ) : (
            renderPinInputs(pin, inputRefs)
          )}

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPin(!showPin)}
              className="text-muted-foreground"
            >
              {showPin ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {mode === "create" && step === "confirm" && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                setStep("enter");
                setPin(["", "", "", ""]);
                setConfirmPin(["", "", "", ""]);
                setError("");
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
              }}
            >
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
