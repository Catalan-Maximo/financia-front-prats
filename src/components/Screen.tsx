import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ScreenProps {
  /** Contenido de la pantalla. */
  children: ReactNode;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
  /** Si respeta el safe area superior (false cuando ya hay TopBar). */
  safeTop?: boolean;
}

/**
 * Contenedor de pantalla: respeta el safe area superior y aplica
 * fondo y padding horizontal del sistema de diseño.
 */
export default function Screen({ children, style, safeTop = true }: ScreenProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return <SafeAreaView edges={safeTop ? ['top'] : []} style={[s.screen, style]}>{children}</SafeAreaView>;
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.systemBackground,
      paddingHorizontal: spacing.lg,
      // En tablet el contenido no se estira: queda centrado como en el teléfono
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
  });
