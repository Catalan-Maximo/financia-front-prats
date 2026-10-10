import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Screen from '../components/Screen';
import Cargando from '../components/Cargando';
import Entrada from '../components/Entrada';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useAsesorIA from '../hooks/useAsesorIA';
import useCripto from '../hooks/useCripto';
import type { Asignacion } from '../domain/ia';
import { useTheme, type ThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface AsesorVirtualProps {
  perfil: string;
}

/** Tono del badge según nivel de riesgo. */
const RIESGO_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  Bajo: 'success',
  Medio: 'warning',
  Alto: 'danger',
};

/** Tono del chip según veredicto cripto. */
const CRIPTO_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

/** Barra de distribución con ancho animado (stagger por índice). */
function BarraDistribucion({ porcentaje, index }: { porcentaje: number; index: number }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeBarStyles(colors), [colors]);

  const [trackWidth, setTrackWidth] = useState(0);
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trackWidth > 0) {
      width.setValue(0);
      Animated.timing(width, {
        toValue: (porcentaje / 100) * trackWidth,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        delay: index * 80,
        useNativeDriver: false,
      }).start();
    }
  }, [index, porcentaje, trackWidth, width]);

  return (
    <View style={s.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[s.fill, { width }]} />
    </View>
  );
}

const makeBarStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: {
      height: 8,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    fill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 4,
    },
  });

export default function AsesorVirtualScreen({ perfil }: AsesorVirtualProps) {
  const {
    monto, setMonto,
    plazo, setPlazo,
    inflacion, setInflacion,
    loading,
    respuesta,
    error, limpiarError,
    consultar,
  } = useAsesorIA(perfil);

  const { cripto } = useCripto();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Key de resultados: remonta el bloque y dispara la animación de entrada
  const [respuestaKey, setRespuestaKey] = useState(0);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  // Haptic de éxito cuando llega la respuesta del asesor
  useEffect(() => {
    if (respuesta) {
      setRespuestaKey((k) => k + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [respuesta]);

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ejecutarConsulta = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    consultar();
  };

  const renderAsignacion = (asignacion: Asignacion, index: number) => (
    <Card
      key={index}
      style={s.asignacionCard}
    >
      <View style={s.asignacionHeader}>
        <Text style={s.asignacionTipo}>{asignacion.tipoActivo}</Text>
        <Text style={s.asignacionPorcentaje}>{asignacion.porcentaje}%</Text>
      </View>
      <BarraDistribucion porcentaje={asignacion.porcentaje} index={index} />
      <Text style={s.asignacionMotivo}>{asignacion.motivo}</Text>
    </Card>
  );

  return (
    <Screen safeTop={false}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <Header text="Simulador con Asesor" level="title" style={s.titleSpacing} />
        <Text style={s.subtitle}>Compará todos los activos y recibí una estrategia personalizada</Text>

        {/* ── Formulario ─── */}
        <Card style={s.formCard}>
          <Input
            label="Monto a invertir ($)"
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
            placeholder="100000"
          />
          <Input
            label="Plazo (meses)"
            value={plazo}
            onChangeText={setPlazo}
            keyboardType="numeric"
            placeholder="6"
          />
          <Input
            label="Inflación mensual estimada (%)"
            value={inflacion}
            onChangeText={setInflacion}
            keyboardType="numeric"
            placeholder="4.0"
          />

          <Button
            title="Consultar Asesor"
            icon="sparkles-outline"
            onPress={ejecutarConsulta}
            haptics
            loading={loading}
            style={s.consultarBtn}
          />
        </Card>

        {/* ── Resultados ─── */}
        {loading && <Cargando style={s.loadingContainer} />}

        {respuesta && !loading && (
          <Entrada key={respuestaKey} style={s.resultados}>
            {/* Insignia de riesgo y recomendación */}
            <Card style={s.riesgoCard}>
              <Badge
                label={`Riesgo: ${respuesta.nivelRiesgo}`}
                tone={RIESGO_TONE[respuesta.nivelRiesgo] ?? 'warning'}
                style={s.riesgoBadge}
              />

              <Text style={s.recomendacionTexto}>{respuesta.recomendacion}</Text>

              {/* Veredicto cripto del día (análisis técnico) */}
              {cripto.length > 0 && (
                <View style={s.criptoFila}>
                  {cripto.map((c) => (
                    <Badge
                      key={c.simbolo}
                      label={`${c.simbolo.replace('USDT', '')}: ${c.veredicto}`}
                      tone={CRIPTO_TONE[c.veredicto] ?? 'warning'}
                    />
                  ))}
                </View>
              )}

              <View style={s.separator} />
              <View style={s.row}>
                <Text style={s.label}>Ganancia real estimada</Text>
                <Text
                  style={[
                    s.gananciaTexto,
                    respuesta.gananciaRealEstimada > 0 ? s.green : s.red,
                  ]}
                >
                  {formatPesos(respuesta.gananciaRealEstimada)}
                </Text>
              </View>
            </Card>

            {/* Distribución sugerida */}
            <Header text="Distribución Sugerida" level="section" style={s.resultHeader} />
            {respuesta.distribucionSugerida.map(renderAsignacion)}

            {/* Rendimientos por activo (la lista completa del simulador) */}
            <Header text="Rendimientos por Activo" level="section" style={s.resultHeader} />
            <Card style={s.rendimientosCard}>
              {respuesta.rendimientos.map((r, i) => (
                <View key={`${r.entidad}-${i}`} style={[s.rendFila, i > 0 && s.rendBorde]}>
                  <View style={s.rendIzq}>
                    <Text style={s.rendEntidad} numberOfLines={1}>{r.entidad}</Text>
                    <Text style={s.rendTipo}>{r.tipo} · Riesgo {r.riesgo}</Text>
                  </View>
                  <View style={s.rendDer}>
                    <Text style={[s.rendReal, r.leGanaALaInflacion ? s.green : s.red]} numberOfLines={1}>
                      {r.tasaRealMensual > 0 ? '+' : ''}{r.tasaRealMensual}% real
                    </Text>
                    {/* Línea fija siempre (— en renta fija): todas las filas miden lo mismo */}
                    <Text style={s.rendRango}>
                      {r.peorEscenario != null && r.mejorEscenario != null
                        ? `${r.peorEscenario.toFixed(0)}% a +${r.mejorEscenario.toFixed(0)}%`
                        : '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Resumen de estrategia */}
            <Card style={s.resumenCard}>
              <Header text="Resumen de Estrategia" level="section" style={s.resumenTitulo} />
              <Text style={s.resumenTexto}>{respuesta.resumenEstrategia}</Text>
            </Card>
          </Entrada>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scroll: { flex: 1 },

    /* ── Títulos ─── */
    titleSpacing: { marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.xl },

    /* ── Formulario ─── */
    formCard: { marginBottom: spacing.xl },
    consultarBtn: { marginTop: spacing.xl },

    /* ── Resultados ─── */
    loadingContainer: { marginTop: spacing.xxxl, alignItems: 'center' },
    resultados: { marginTop: spacing.md },

    riesgoCard: { marginBottom: spacing.xl },
    riesgoBadge: { alignSelf: 'flex-start', marginBottom: spacing.lg },
    recomendacionTexto: { ...typography.callout, color: colors.label },
    criptoFila: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginVertical: spacing.lg,
    },

    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    gananciaTexto: { ...typography.callout, fontWeight: '700' },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    /* ── Distribución ─── */
    resultHeader: { marginBottom: spacing.lg },
    asignacionCard: { marginBottom: spacing.md },

    rendimientosCard: { padding: 0, marginBottom: spacing.lg },
    rendFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    rendBorde: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },
    rendIzq: { flex: 1 },
    rendEntidad: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    rendTipo: { ...typography.caption2, color: colors.tertiaryLabel },
    rendDer: { alignItems: 'flex-end' },
    rendReal: { ...typography.subheadline, fontWeight: '700' },
    rendRango: { ...typography.caption2, color: colors.tertiaryLabel },
    asignacionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
    asignacionTipo: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    asignacionPorcentaje: { ...typography.callout, fontWeight: '700', color: colors.brand },
    asignacionMotivo: { ...typography.footnote, color: colors.secondaryLabel },

    /* ── Resumen ─── */
    resumenCard: { marginTop: spacing.sm },
    resumenTitulo: { marginBottom: spacing.md },
    resumenTexto: { ...typography.footnote, color: colors.secondaryLabel },
  });
