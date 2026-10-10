import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/** Altura de la barra (sin contar el safe area inferior). */
export const TAB_BAR_HEIGHT = 50;

/** Pestañas disponibles en la navegación inferior. */
export type TabKey = 'dashboard' | 'mercados' | 'midinero' | 'chat' | 'simulador';

interface BottomNavProps {
  /** Pestaña activa en este momento. */
  activeTab: TabKey;
  /** Callback al tocar una pestaña distinta. */
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; icono: keyof typeof Ionicons.glyphMap; iconoActivo: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'dashboard', icono: 'home-outline', iconoActivo: 'home', label: 'Inicio' },
  { key: 'mercados', icono: 'stats-chart-outline', iconoActivo: 'stats-chart', label: 'Mercados' },
  { key: 'midinero', icono: 'wallet-outline', iconoActivo: 'wallet', label: 'Mi Dinero' },
  { key: 'chat', icono: 'chatbubbles-outline', iconoActivo: 'chatbubbles', label: 'Chat' },
  { key: 'simulador', icono: 'calculator-outline', iconoActivo: 'calculator', label: 'Simular' },
];

const spring = { tension: 250, friction: 32, useNativeDriver: true };

/** Ícono de pestaña con spring de escala cuando pasa a activa. */
function TabIcon({
  name,
  active,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  active: boolean;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { ...spring, toValue: active ? 1.05 : 1 }).start();
  }, [active, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

/**
 * Barra de navegación inferior flotante: material translúcido (blur real),
 * íconos SF-Symbols-like y tint de marca para la pestaña activa.
 */
export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Aparición de la barra al completar el test (fade + slide desde abajo)
  const aparicion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(aparicion, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [aparicion]);

  const handlePress = (tab: TabKey) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onChange(tab);
  };

  const fondo = { backgroundColor: colors.secondarySystemBackground };

  return (
    <Animated.View
      style={[
        s.bar,
        { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        {
          opacity: aparicion,
          transform: [{ translateY: aparicion.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }],
        },
      ]}
    >
      {/* expo-blur no soporta web: fallback a fondo sólido */}
      {Platform.OS === 'web' ? (
        <View style={[StyleSheet.absoluteFill, fondo]} />
      ) : (
        <BlurView intensity={80} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}

      {TABS.map((tab) => {
        const esActiva = tab.key === activeTab;
        return (
          <Pressable key={tab.key} style={s.tab} onPress={() => handlePress(tab.key)}>
            <TabIcon
              name={esActiva ? tab.iconoActivo : tab.icono}
              active={esActiva}
              color={esActiva ? colors.brand : colors.secondaryLabel}
            />
            <Text style={[s.label, esActiva && s.labelActiva]} maxFontSizeMultiplier={1.3}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    bar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
      overflow: 'hidden',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    label: {
      ...typography.caption2,
      fontWeight: '600',
      color: colors.secondaryLabel,
    },
    labelActiva: {
      color: colors.brand,
    },
  });
