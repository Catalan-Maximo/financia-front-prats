import React, { useMemo } from 'react';
import { Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  /** Texto corto de la insignia. */
  label: string;
  /** Tono semántico (default: 'neutral'). */
  tone?: BadgeTone;
  /** Máximo de líneas del texto (default: sin límite). */
  numberOfLines?: number;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Insignia pill estilo iOS (p. ej. "Perfil: Moderado", "Riesgo: Bajo").
 */
export default function Badge({ label, tone = 'neutral', numberOfLines, style }: BadgeProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Text
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={1.3}
      style={[s.badge, s[tone], style]}
    >
      {label}
    </Text>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    badge: {
      borderRadius: radius.pill,
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      overflow: 'hidden',
    },
    neutral: {
      backgroundColor: colors.neutralBg,
      color: colors.secondaryLabel,
    },
    brand: {
      backgroundColor: colors.successBg,
      color: colors.brand,
    },
    success: {
      backgroundColor: colors.successBg,
      color: colors.systemGreen,
    },
    warning: {
      backgroundColor: colors.warningBg,
      color: colors.systemOrange,
    },
    danger: {
      backgroundColor: colors.dangerBg,
      color: colors.systemRed,
    },
  });
