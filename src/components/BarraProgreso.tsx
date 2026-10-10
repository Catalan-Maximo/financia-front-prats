import React, { useMemo } from 'react';
import { StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/colors';

interface BarraProgresoProps {
  /** Avance de 0 a 100 (se recorta si se pasa). */
  progreso: number;
  /** Alto de la barra en px (default 8). */
  alto?: number;
  /** Estilos adicionales (p. ej. flex o margen). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Barra de progreso plana: track gris + relleno de marca.
 * Misma barra para metas, categorías de gasto y probabilidades.
 */
export default function BarraProgreso({ progreso, alto = 8, style }: BarraProgresoProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const ancho = `${Math.min(100, Math.max(0, progreso))}%` as `${number}%`;

  return (
    <View style={[s.track, { height: alto }, style]}>
      <View style={[s.fill, { width: ancho }]} />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    track: {
      borderRadius: 4,
      backgroundColor: colors.tertiarySystemBackground,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 4,
    },
  });
