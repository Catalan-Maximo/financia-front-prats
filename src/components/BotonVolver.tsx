import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { spacing } from '../theme/spacing';

/**
 * Botón circular para volver atrás: un solo gesto, misma posición
 * y mismo tamaño en todas las pantallas de detalle de la app.
 */
export default function BotonVolver({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [s.volver, pressed && s.pressed]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.label} />
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    volver: {
      alignSelf: 'flex-start',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    pressed: { opacity: 0.6 },
  });
