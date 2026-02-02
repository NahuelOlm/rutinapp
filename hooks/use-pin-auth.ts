"use client";

import { useState, useEffect, useCallback } from "react";

const PIN_STORAGE_KEY = "gymtrack-pin";
const SESSION_KEY = "gymtrack-session";

export function usePinAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const session = sessionStorage.getItem(SESSION_KEY);
    
    setHasPin(!!storedPin);
    setIsAuthenticated(session === "true");
    setIsLoading(false);
  }, []);

  const createPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    sessionStorage.setItem(SESSION_KEY, "true");
    setHasPin(true);
    setIsAuthenticated(true);
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const isValid = storedPin === pin;
    
    if (isValid) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
    }
    
    return isValid;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const changePin = useCallback((currentPin: string, newPin: string): boolean => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (storedPin === currentPin) {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
      return true;
    }
    
    return false;
  }, []);

  const resetPin = useCallback(() => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setHasPin(false);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    hasPin,
    isLoading,
    createPin,
    verifyPin,
    logout,
    changePin,
    resetPin,
  };
}
