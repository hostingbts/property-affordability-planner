"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GlobalSettings, PropertyInput } from "@/types";

interface AppContextType {
  settings: GlobalSettings;
  properties: PropertyInput[];
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  addProperty: (property: Omit<PropertyInput, "id" | "createdAt">) => void;
  updateProperty: (id: string, property: Partial<PropertyInput>) => void;
  deleteProperty: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: "property-planner-settings",
  PROPERTIES: "property-planner-properties",
};

const DEFAULT_SETTINGS: GlobalSettings = {
  availableCash: 50000,
  interestRate: 8.5,
  loanTermYears: 30,
  mode: "loan",
  currency: "USD",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [properties, setProperties] = useState<PropertyInput[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedProperties = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (savedProperties) {
        setProperties(JSON.parse(savedProperties));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isHydrated]);

  // Save properties to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
      } catch (error) {
        console.error("Error saving properties to localStorage:", error);
      }
    }
  }, [properties, isHydrated]);

  const updateSettings = useCallback((newSettings: Partial<GlobalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const addProperty = useCallback((propertyData: Omit<PropertyInput, "id" | "createdAt">) => {
    const newProperty: PropertyInput = {
      ...propertyData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => [...prev, newProperty]);
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<PropertyInput>) => {
    setProperties((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, ...updates } : prop))
    );
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((prop) => prop.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        properties,
        updateSettings,
        addProperty,
        updateProperty,
        deleteProperty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

