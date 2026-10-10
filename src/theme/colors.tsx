import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { guardarTema, obtenerTema } from '../lib/storage';

/**
 * Paleta semántica estilo iOS (system colors) de FinancIA.
 * Única fuente de verdad para todos los estilos — nunca hardcodees
 * colores en las pantallas; usá `useTheme()` y los tokens de acá.
 *
 * Reglas de uso:
 * - `brand` = tint interactivo (botones, links, elementos táctiles).
 * - `systemGreen`/`systemRed` = datos positivos/negativos.
 * - `label` 1-4 = jerarquía de texto.
 */
export interface ThemeColors {
  // Fondos
  systemBackground: string;
  secondarySystemBackground: string;
  tertiarySystemBackground: string;

  // Bordes y divisores
  separator: string;
  opaqueSeparator: string;

  // Marca
  brand: string;
  brandPressed: string;
  onBrand: string;

  // Textos
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  quaternaryLabel: string;

  // Estados
  systemGreen: string;
  systemRed: string;
  systemOrange: string;
  systemYellow: string;
  systemBlue: string;

  // Superficies de input (iOS usa fills, no bordes)
  fill: string;

  // Fondos de badges
  successBg: string;
  warningBg: string;
  dangerBg: string;
  neutralBg: string;
}

export const themes: Record<'light' | 'dark', ThemeColors> = {
  dark: {
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',

    separator: 'rgba(84,84,88,0.6)',
    opaqueSeparator: '#38383A',

    brand: '#00B37E',
    brandPressed: '#00A271',
    onBrand: '#FFFFFF',

    label: '#FFFFFF',
    secondaryLabel: '#AEAEB2',
    tertiaryLabel: '#8E8E93',
    quaternaryLabel: '#636366',

    systemGreen: '#30D158',
    systemRed: '#FF453A',
    systemOrange: '#FF9F0A',
    systemYellow: '#FFD60A',
    systemBlue: '#0A84FF',

    fill: 'rgba(120,120,128,0.24)',

    successBg: '#1B3A2D',
    warningBg: '#3D3320',
    dangerBg: '#3D1F24',
    neutralBg: '#3A3A3C',
  },

  light: {
    systemBackground: '#FFFFFF',
    secondarySystemBackground: '#F2F2F7',
    tertiarySystemBackground: '#FFFFFF',

    separator: 'rgba(60,60,67,0.29)',
    opaqueSeparator: '#D1D1D6',

    // Verde más profundo para contraste 4.5:1 sobre blanco
    brand: '#00875F',
    brandPressed: '#00734F',
    onBrand: '#FFFFFF',

    label: '#000000',
    secondaryLabel: '#6D6D72',
    tertiaryLabel: '#C7C7CC',
    quaternaryLabel: '#D6D6DB',

    systemGreen: '#34C759',
    systemRed: '#FF3B30',
    systemOrange: '#FF9500',
    systemYellow: '#FFCC00',
    systemBlue: '#007AFF',

    fill: 'rgba(120,120,128,0.12)',

    successBg: '#E3F6ED',
    warningBg: '#FDF0DE',
    dangerBg: '#FDE9E8',
    neutralBg: '#E9E9EB',
  },
};

/** Modo de apariencia: sigue al sistema o fuerza claro/oscuro. */
export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  /** Paleta del tema efectivo. */
  colors: ThemeColors;
  /** true si el tema efectivo es oscuro. */
  dark: boolean;
  /** Modo elegido por el usuario. */
  mode: ThemeMode;
  /** Cambia el modo y lo persiste. */
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Proveedor de tema: arranca siguiendo al sistema, permite override
 * del usuario y persiste la elección en AsyncStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    obtenerTema().then((tema) => {
      if (tema === 'light' || tema === 'dark' || tema === 'system') {
        setModeState(tema);
      }
    });
  }, []);

  const setMode = (nuevo: ThemeMode) => {
    setModeState(nuevo);
    guardarTema(nuevo);
  };

  const efectivo = mode === 'system' ? scheme : mode;
  const dark = efectivo !== 'light';

  return (
    <ThemeContext.Provider
      value={{ colors: themes[dark ? 'dark' : 'light'], dark, mode, setMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Tema activo: paleta + flag dark + control de modo.
 * Cada componente y pantalla obtiene sus colores desde acá.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return ctx;
}
