import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import type { TabKey } from './BottomNav';

interface PanelPerfilProps {
  /** Si el panel está abierto. */
  visible: boolean;
  /** Perfil de inversor actual. */
  perfil: string;
  /** Email del usuario logueado. */
  email: string;
  /** Cerrar el panel (tap en el scrim). */
  onClose: () => void;
  /** Navegar a una pestaña de la app. */
  onNavegar: (tab: TabKey) => void;
  /** Abrir el panel de consultas frecuentes. */
  onAbrirFaq: () => void;
  /** Abrir la pantalla VERSUS. */
  onAbrirVersus: () => void;
  /** Abrir las noticias financieras. */
  onAbrirNoticias: () => void;
  /** Rehacer el test del inversor. */
  onRehacerTest: () => void;
  /** Cerrar sesión (borra token y vuelve al login). */
  onLogout: () => void;
}

/** Fila de menú con ícono, título y acción. */
function FilaMenu({
  icono,
  titulo,
  color,
  onPress,
  ultima = false,
  children,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  color: string;
  onPress: () => void;
  ultima?: boolean;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [s.fila, !ultima && s.filaBorde, pressed && s.filaPressed]}
      onPress={onPress}
    >
      <View style={s.filaIzq}>
        <Ionicons name={icono} size={22} color={color} />
        <Text style={s.filaTexto}>{titulo}</Text>
      </View>
      {children}
    </Pressable>
  );
}

/**
 * Panel deslizante desde la derecha (estilo iOS) con la cuenta del
 * usuario organizada en grupos: navegación, preferencias, ayuda y cuenta.
 */
export default function PanelPerfil({
  visible, perfil, email, onClose, onNavegar, onAbrirFaq, onAbrirVersus, onAbrirNoticias, onRehacerTest, onLogout,
}: PanelPerfilProps) {
  const { colors, dark, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const ANCHO = Math.min(width * 0.85, 340);

  const scrim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-ANCHO)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scrim, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
      Animated.spring(slide, {
        toValue: visible ? 0 : -ANCHO,
        tension: 220,
        friction: 26,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, ANCHO, scrim, slide]);

  const cambiarTema = (oscuro: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setMode(oscuro ? 'dark' : 'light');
  };

  const navegar = (tab: TabKey) => {
    onClose();
    onNavegar(tab);
  };

  const inicial = (email.trim().charAt(0) || 'F').toUpperCase();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[s.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          s.panel,
          {
            width: ANCHO,
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Cabecera de cuenta ─── */}
          <View style={s.cabecera}>
            <View style={s.avatar}>
              <Text style={s.avatarTexto}>{inicial}</Text>
            </View>
            <View style={s.cabeceraTexto}>
              <Text style={s.email} numberOfLines={1}>{email || 'usuario@financia.com'}</Text>
              <Badge label={`Perfil: ${perfil}`} tone="brand" style={s.badge} />
            </View>
          </View>

          {/* ── Navegación ─── */}
          <Text style={s.seccionTitulo}>IR A</Text>
          <View style={s.grupo}>
            <FilaMenu icono="home-outline" titulo="Inicio" color={colors.brand} onPress={() => navegar('dashboard')} />
            <FilaMenu icono="stats-chart-outline" titulo="Mercados" color={colors.brand} onPress={() => navegar('mercados')} />
            <FilaMenu icono="wallet-outline" titulo="Mi Dinero" color={colors.brand} onPress={() => navegar('midinero')} />
            <FilaMenu icono="git-compare-outline" titulo="Versus" color={colors.brand} onPress={() => { onClose(); onAbrirVersus(); }} />
            <FilaMenu icono="chatbubbles-outline" titulo="Chat de dudas" color={colors.brand} onPress={() => navegar('chat')} />
            <FilaMenu icono="calculator-outline" titulo="Simulador" color={colors.brand} onPress={() => navegar('simulador')} ultima />
          </View>

          {/* ── Preferencias ─── */}
          <Text style={s.seccionTitulo}>PREFERENCIAS</Text>
          <View style={s.grupo}>
            <FilaMenu icono={dark ? 'moon' : 'sunny'} titulo="Modo oscuro" color={colors.brand} onPress={() => cambiarTema(!dark)} ultima>
              <Switch
                value={dark}
                onValueChange={cambiarTema}
                trackColor={{ false: colors.fill, true: colors.brand }}
                thumbColor="#FFFFFF"
              />
            </FilaMenu>
          </View>

          {/* ── Mercados y noticias ─── */}
          <Text style={s.seccionTitulo}>INFORMACIÓN</Text>
          <View style={s.grupo}>
            <FilaMenu icono="newspaper-outline" titulo="Noticias financieras" color={colors.brand} onPress={() => { onClose(); onAbrirNoticias(); }} />
            <FilaMenu icono="help-circle-outline" titulo="Consultas frecuentes" color={colors.systemBlue} onPress={() => { onClose(); onAbrirFaq(); }} ultima />
          </View>

          {/* ── Cuenta ─── */}
          <Text style={s.seccionTitulo}>CUENTA</Text>
          <View style={s.grupo}>
            <FilaMenu icono="refresh" titulo="Rehacer test del inversor" color={colors.systemRed} onPress={onRehacerTest} />
            <FilaMenu icono="log-out-outline" titulo="Cerrar sesión" color={colors.systemRed} onPress={onLogout} ultima />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      backgroundColor: colors.secondarySystemBackground,
      borderTopRightRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.separator,
      paddingHorizontal: spacing.lg,
    },

    /* ── Cabecera ─── */
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTexto: { ...typography.title2, fontWeight: '700', color: colors.onBrand },
    cabeceraTexto: { flex: 1, gap: spacing.xs },
    email: { ...typography.headline, fontWeight: '600', color: colors.label },
    badge: { alignSelf: 'flex-start' },

    /* ── Grupos ─── */
    seccionTitulo: {
      ...typography.caption2,
      fontWeight: '600',
      color: colors.tertiaryLabel,
      marginBottom: spacing.xs,
      marginLeft: spacing.sm,
      letterSpacing: 0.5,
    },
    grupo: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    filaBorde: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    filaPressed: {
      backgroundColor: 'rgba(128,128,128,0.15)',
    },
    filaIzq: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    filaTexto: {
      ...typography.body,
      color: colors.label,
    },
  });
