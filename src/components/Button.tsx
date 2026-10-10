import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

/** Pressable con soporte de transformaciones animadas. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  /** Texto que muestra el botón. */
  title: string;
  /** Callback al presionar. */
  onPress: () => void;
  /** Deshabilita el botón y reduce opacidad. */
  disabled?: boolean;
  /** Muestra un spinner y deshabilita el botón. */
  loading?: boolean;
  /** Ícono Ionicons a la izquierda del texto. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Feedback háptico leve al presionar (para acciones de commit). */
  haptics?: boolean;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
  /** Estilos adicionales para el texto. */
  textStyle?: TextStyle;
}

/**
 * Botón principal de la app: fondo verde de marca con texto blanco.
 */
export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  haptics = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Spring críticamente amortiguado (sin bounce): feedback de presión instantáneo
  const scale = useRef(new Animated.Value(1)).current;
  const spring = { tension: 250, friction: 32, useNativeDriver: true };
  const [presionado, setPresionado] = useState(false);

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <AnimatedPressable
      style={[
        s.base,
        presionado && !isDisabled && s.pressed,
        isDisabled && s.disabled,
        style,
        { transform: [{ scale }] },
      ]}
      onPress={handlePress}
      onPressIn={() => {
        setPresionado(true);
        Animated.spring(scale, { ...spring, toValue: 0.98 }).start();
      }}
      onPressOut={() => {
        setPresionado(false);
        Animated.spring(scale, { ...spring, toValue: 1 }).start();
      }}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.onBrand} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={colors.onBrand} />}
          <Text style={[s.text, textStyle]} maxFontSizeMultiplier={1.3}>{title}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    base: {
      height: 48,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.brand,
    },

    pressed: {
      backgroundColor: colors.brandPressed,
    },
    disabled: {
      opacity: 0.5,
    },

    text: {
      ...typography.headline,
      color: colors.onBrand,
    },
  });
