import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/** Alto del contenido de la barra (sin el safe area superior). */
export const TOPBAR_CONTENT_HEIGHT = 44;

interface TopBarProps {
  /** Abre el panel lateral de perfil. */
  onAbrirPanel: () => void;
  /** Abre el panel de consultas frecuentes. */
  onAbrirFaq: () => void;
}

/**
 * Barra de navegación superior: menú (abre el panel de perfil),
 * logo de la app centrado y ayuda (?) a la derecha.
 * Los slots laterales flex:1 iguales mantienen el logo centrado.
 */
export default function TopBar({ onAbrirPanel, onAbrirFaq }: TopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.bar, { paddingTop: insets.top, height: insets.top + TOPBAR_CONTENT_HEIGHT }]}>
      <View style={s.slot}>
        <Pressable onPress={onAbrirPanel} hitSlop={8} style={s.menuBtn}>
          <Ionicons name="menu-outline" size={26} color={colors.label} />
        </Pressable>
      </View>

      <View style={s.logo}>
        <Ionicons name="trending-up" size={22} color={colors.label} />
        <Text style={s.nombre}>FinancIA</Text>
        {/* Espejo invisible: compensa el ancho del ícono para que el texto quede centrado exacto */}
        <Ionicons name="trending-up" size={22} color="transparent" />
      </View>

      <View style={[s.slot, s.slotDer]}>
        <Pressable onPress={onAbrirFaq} hitSlop={8} style={s.menuBtn}>
          <Ionicons name="help-circle-outline" size={28} color={colors.label} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.systemBackground,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    slot: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    slotDer: {
      justifyContent: 'flex-end',
    },
    menuBtn: {
      height: TOPBAR_CONTENT_HEIGHT,
      justifyContent: 'center',
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    nombre: {
      ...typography.title3,
      fontWeight: '700',
      color: colors.label,
    },
  });
