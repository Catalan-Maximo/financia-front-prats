import React, { useMemo } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';

/**
 * Nivel jerárquico del encabezado.
 * - title:    Título principal de pantalla (title1).
 * - subtitle: Subtítulo / pregunta destacada (title2).
 * - section:  Encabezado de sección, uppercase con tracking (estilo iOS).
 * - label:    Label pequeño y resaltado (ej. "Paso 1 de 10").
 */
type HeaderLevel = 'title' | 'subtitle' | 'section' | 'label';

interface HeaderProps {
  /** Texto a mostrar. */
  text: string;
  /** Nivel jerárquico (default: 'title'). */
  level?: HeaderLevel;
  /** Estilos adicionales. */
  style?: TextStyle;
}

export default function Header({ text, level = 'title', style }: HeaderProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return <Text style={[s[level], style]} maxFontSizeMultiplier={1.3}>{text}</Text>;
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    title: {
      ...typography.title1,
      color: colors.label,
    },
    subtitle: {
      ...typography.title2,
      color: colors.label,
    },
    section: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.secondaryLabel,
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      color: colors.brand,
    },
  });
