import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface EntradaProps {
  /** Contenido animado. */
  children: ReactNode;
  /** Retraso inicial en ms. */
  delay?: number;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrada sutil estilo iOS: fade + slide de 25px con spring
 * (equivalente al FadeInDown de reanimated, con Animated nativo).
 * Cambiar la `key` del padre remonta el bloque y repite la animación.
 */
export default function Entrada({ children, delay = 0, style }: EntradaProps) {
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progreso, {
      toValue: 1,
      tension: 220,
      friction: 24,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progreso, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progreso,
          transform: [
            {
              translateY: progreso.interpolate({
                inputRange: [0, 1],
                outputRange: [25, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
