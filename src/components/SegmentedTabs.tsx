import React, { useMemo } from 'react';
import { Pressable, StyleSheet, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface OpcionTab {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  /** Opciones del control (en orden). */
  opciones: OpcionTab[];
  /** Key de la opción activa. */
  activa: string;
  /** Callback con la key elegida. */
  onCambiar: (key: string) => void;
  /** Estilos adicionales (p. ej. margen inferior). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Control segmentado estilo iOS (p. ej. Gastos | Metas | Portafolio).
 * Un solo componente para todas las navegaciones por tabs de la app.
 */
export default function SegmentedTabs({ opciones, activa, onCambiar, style }: SegmentedTabsProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.tabs, style]}>
      {opciones.map((t) => {
        const esActiva = t.key === activa;
        return (
          <Pressable
            key={t.key}
            onPress={() => onCambiar(t.key)}
            style={[s.tab, esActiva && s.tabActiva]}
          >
            <Text
              style={[s.tabTexto, esActiva && s.tabTextoActiva]}
              maxFontSizeMultiplier={1.3}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 10,
      padding: 3,
      marginBottom: spacing.lg,
    },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: 'center' },
    tabActiva: { backgroundColor: colors.secondarySystemBackground },
    tabTexto: { ...typography.subheadline, color: colors.secondaryLabel },
    tabTextoActiva: { color: colors.label, fontWeight: '600' },
  });
