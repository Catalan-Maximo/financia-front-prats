import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, View, Animated } from 'react-native';
import { useTheme } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

/** Pressable con soporte de transformaciones animadas. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  /** Contenido interno de la tarjeta. */
  children: ReactNode;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
  /** Si se pasa, la tarjeta es presionable (spring + tinte). */
  onPress?: () => void;
}

/**
 * Tarjeta contenedor reutilizable, estilo iOS: superficie secundaria,
 * sombra suave en light y sin borde (la separación es por contraste).
 */
export default function Card({ children, style, onPress }: CardProps) {
  const { colors, dark } = useTheme();
  const s = useMemo(() => makeStyles(colors, dark), [colors, dark]);

  // Spring críticamente amortiguado al presionar
  const scale = useRef(new Animated.Value(1)).current;
  const spring = { tension: 250, friction: 32, useNativeDriver: true };
  const [presionado, setPresionado] = useState(false);

  if (!onPress) {
    return <View style={[s.card, style]}>{children}</View>;
  }

  return (
    <AnimatedPressable
      style={[s.card, presionado && s.pressed, style, { transform: [{ scale }] }]}
      onPress={onPress}
      onPressIn={() => {
        setPresionado(true);
        Animated.spring(scale, { ...spring, toValue: 0.98 }).start();
      }}
      onPressOut={() => {
        setPresionado(false);
        Animated.spring(scale, { ...spring, toValue: 1 }).start();
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], dark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.secondarySystemBackground,
      padding: spacing.lg,
      borderRadius: radius.lg,
      ...shadows.card,
    },
    pressed: {
      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
  });
