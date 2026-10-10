import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/colors';

/**
 * Spinner uniforme para cargas parciales (dentro de una pantalla).
 */
export default function Cargando({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.base, style]}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    base: { alignItems: 'center', paddingVertical: 24 },
  });
