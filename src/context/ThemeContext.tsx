"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import defaultTokens from "@/styles/design-tokens.json";
import { DesignTokens } from "@/services/tokenService";

interface ThemeContextType {
    tokens: DesignTokens;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [tokens, setTokens] = useState<DesignTokens>(defaultTokens as DesignTokens);
    const [isLoading, setIsLoading] = useState(true);

    const applyTheme = (themeTokens: DesignTokens) => {
        const root = document.documentElement;

        // Apply colors
        Object.entries(themeTokens.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // Apply spacing (this might need more complex logic for object traversal if nested)
        root.style.setProperty("--spacing-base", themeTokens.spacing.base);
        root.style.setProperty("--spacing-scale", themeTokens.spacing.scale.toString());

        // Apply typography
        Object.entries(themeTokens.typography).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        setIsLoading(true);
        // Real-time listener
        const docRef = doc(db, "themes", "active_theme");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const newTokens = docSnap.data() as DesignTokens;
                setTokens(newTokens);
                applyTheme(newTokens);
                console.log("Theme updated from Firestore:", newTokens.themeName);
            } else {
                console.warn("No active theme found in Firestore, using default.");
                setTokens(defaultTokens as DesignTokens);
                applyTheme(defaultTokens as DesignTokens);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to theme updates:", error);
            // Fallback to default on error (e.g., missing permissions)
            setTokens(defaultTokens as DesignTokens);
            applyTheme(defaultTokens as DesignTokens);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ThemeContext.Provider value={{ tokens, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
