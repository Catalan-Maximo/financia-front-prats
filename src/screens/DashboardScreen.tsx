import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import CryptoCard from '../components/CryptoCard';
import PackCard from '../components/PackCard';
import Cargando from '../components/Cargando';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMercado from '../hooks/useMercado';
import useCripto from '../hooks/useCripto';
import usePacks from '../hooks/usePacks';
import type { Activo } from '../domain/activo';
import type { CriptoEstado } from '../domain/cripto';
import type { PackCotizacion } from '../domain/mercados';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { grid } from '../theme/grid';
import { INFLACION_ESTIMADA_DASHBOARD } from '../constants';

interface DashboardProps {
  perfil: string;
  onIrAlSimulador: () => void;
  onAbrirDetalleCripto: (estado: CriptoEstado) => void;
  onAbrirPack: (pack: PackCotizacion) => void;
  onAbrirDetalleActivo: (activo: Activo) => void;
}

export default function DashboardScreen({ perfil, onIrAlSimulador, onAbrirDetalleCripto, onAbrirPack, onAbrirDetalleActivo }: DashboardProps) {
  const { activos, loading, error, limpiarError } = useMercado();
  const { cripto, alertas } = useCripto();
  const { packs } = usePacks();
  const [verTodas, setVerTodas] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error de carga',
        'No se pudieron sincronizar las tasas del mercado.',
        [{ text: 'OK', onPress: limpiarError }],
      );
    }
  }, [error, limpiarError]);

  // Señales cripto: avisamos una sola vez por sesión (no en cada remount)
  const senalesAvisadas = useRef(false);
  useEffect(() => {
    if (alertas.length > 0 && !senalesAvisadas.current) {
      senalesAvisadas.current = true;
      Alert.alert('Señales cripto', alertas.map((a) => a.mensaje).join('\n\n'));
    }
  }, [alertas]);

  // Ordenamos por rendimiento real (de mayor a menor)
  const ordenados = useMemo(
    () =>
      [...activos].sort((a, b) => {
        const real = (item: Activo) => item.tna / 12 - INFLACION_ESTIMADA_DASHBOARD;
        return real(b) - real(a);
      }),
    [activos],
  );

  const tasaReal = (item: Activo) => item.tna / 12 - INFLACION_ESTIMADA_DASHBOARD;
  const mejor = ordenados[0];
  const top5 = ordenados.slice(0, 5);
  const resto = ordenados.slice(5);

  const renderFila = (item: Activo, index: number) => {
    const real = tasaReal(item);
    return (
      <Pressable
        key={`${item.entidad}-${index}`}
        style={({ pressed }) => [s.fila, index > 0 && s.filaBorde, pressed && s.filaPressed]}
        onPress={() => onAbrirDetalleActivo(item)}
      >
        <View style={s.filaIzq}>
          {index === 0 ? (
            <Ionicons name="trophy" size={20} color={colors.systemYellow} style={s.rankIcono} />
          ) : (
            <Text style={s.rank}>{index + 1}.</Text>
          )}
          <View style={s.filaInfo}>
            <Text style={s.entidad} numberOfLines={1} maxFontSizeMultiplier={1.3}>{item.entidad}</Text>
            <Text style={s.tipo} numberOfLines={1} maxFontSizeMultiplier={1.3}>{item.tipo}</Text>
          </View>
        </View>
        <View style={s.filaDer}>
          <Text style={[s.real, real > 0 ? s.verde : s.rojo]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {real > 0 ? '+' : ''}{real.toFixed(2)}% real
          </Text>
          <Text style={s.tna} numberOfLines={1} maxFontSizeMultiplier={1.3}>TNA {item.tna}%</Text>
          <Text style={[s.veredictoFila, real > 0 ? s.verde : s.rojo]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {real > 0 ? 'Le gana a la inflación' : 'Pierde con la inflación'}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <Screen>
        <Cargando style={s.loading} />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        {/* ── Hero: la mejor oportunidad del día ─── */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <Text style={s.heroSaludo}>Hola</Text>
            <View style={s.heroChip}>
              <Text style={s.heroChipTexto}>{perfil}</Text>
            </View>
          </View>
          {mejor && (
            <>
              <Text style={s.heroTitulo}>Hoy te conviene</Text>
              <Text style={s.heroEntidad}>{mejor.entidad}</Text>
              <Text style={s.heroDetalle}>
                {mejor.tipo} · TNA {mejor.tna}% ·{' '}
                {tasaReal(mejor) > 0 ? '+' : ''}{tasaReal(mejor).toFixed(2)}% real mensual
              </Text>
            </>
          )}
          {!mejor && <Text style={s.heroDetalle}>Todavía no hay datos de mercado cargados.</Text>}
          <Pressable
            style={({ pressed }) => [s.heroBoton, pressed && s.heroBotonPressed]}
            onPress={onIrAlSimulador}
          >
            <Text style={s.heroBotonTexto}>Simular inversión</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.brand} />
          </Pressable>
        </View>

        {/* ── Cripto: lado a lado ─── */}
        {cripto.length > 0 && (
          <>
            <Header text="Cripto" level="section" style={s.seccion} />
            <View style={s.filaCripto}>
              {cripto.map((estado) => (
                <View key={estado.simbolo} style={s.celdaCripto}>
                  <CryptoCard
                    estado={estado}
                    onPress={() => onAbrirDetalleCripto(estado)}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Packs: carrusel horizontal ─── */}
        {packs.length > 0 && (
          <>
            <Header text="Packs de Inversión" level="section" style={s.seccion} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.lg }}
            >
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} onPress={() => onAbrirPack(pack)} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Top rendimientos ─── */}
        <Header text="Rendimientos del Mercado" level="section" style={s.seccion} />
        <Card style={s.lista}>
          {top5.map((item, i) => renderFila(item, i))}
          {verTodas && resto.map((item, i) => renderFila(item, i + 5))}
        </Card>

        {resto.length > 0 && (
          <Pressable style={s.verTodas} onPress={() => setVerTodas((v) => !v)}>
            <Text style={s.verTodasTexto}>
              {verTodas ? 'Mostrar menos' : `Ver todas las opciones (${activos.length})`}
            </Text>
            <Ionicons
              name={verTodas ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.brand}
            />
          </Pressable>
        )}

        {/* ── Acciones ─── */}
        <View style={s.footer}>
          <Button
            title="Simular Inversión"
            icon="calculator-outline"
            onPress={onIrAlSimulador}
            style={s.footerBtn}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    /* ── Hero ─── */
    hero: {
      backgroundColor: colors.brand,
      borderRadius: radius.lg,
      padding: spacing.xl,
      marginBottom: spacing.xl,
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    heroSaludo: { ...typography.title3, fontWeight: '700', color: colors.onBrand },
    heroChip: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: 20,
    },
    heroChipTexto: { ...typography.caption1, fontWeight: '600', color: colors.onBrand },
    heroTitulo: { ...typography.caption1, color: 'rgba(255,255,255,0.85)', marginBottom: spacing.xs },
    heroEntidad: { ...typography.title1, fontWeight: '800', color: colors.onBrand, marginBottom: spacing.xs },
    heroDetalle: { ...typography.footnote, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.lg },
    heroBoton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.onBrand,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
    },
    heroBotonPressed: { opacity: 0.85 },
    heroBotonTexto: { ...typography.subheadline, fontWeight: '700', color: colors.brand },

    /* ── Secciones ─── */
    seccion: { marginBottom: spacing.md },
    // grid.fila con stretch: las dos cripto tarjetas miden lo mismo
    filaCripto: { ...grid.fila },
    celdaCripto: { ...grid.col },

    /* ── Lista de rendimientos ─── */
    lista: { padding: 0, marginBottom: spacing.md },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    filaBorde: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },
    filaPressed: { backgroundColor: 'rgba(128,128,128,0.15)' },
    filaIzq: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0 },
    filaInfo: { flex: 1, minWidth: 0 },
    rank: { ...typography.title3, width: 34, textAlign: 'center' },
    rankIcono: { width: 34, textAlign: 'center' },
    entidad: { ...typography.headline, fontWeight: '600', color: colors.label },
    tipo: { ...typography.caption1, color: colors.tertiaryLabel },
    filaDer: { alignItems: 'flex-end', gap: 2, flexShrink: 1 },
    veredictoFila: { ...typography.caption2, fontWeight: '600' },
    real: { ...typography.subheadline, fontWeight: '700' },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
    tna: { ...typography.caption2, color: colors.tertiaryLabel },

    verTodas: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    verTodasTexto: { ...typography.footnote, fontWeight: '600', color: colors.brand },

    /* ── Footer ─── */
    footer: { gap: spacing.md, marginTop: spacing.md },
    footerBtn: { width: '100%' },
  });
