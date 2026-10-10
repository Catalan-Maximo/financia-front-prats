import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import ExplicarDatosIA from '../components/ExplicarDatosIA';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BotonVolver from '../components/BotonVolver';
import Advertencia from '../components/Advertencia';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { CriptoEstado, VelaDiaria } from '../domain/cripto';
import { analizarChecks } from '../domain/cripto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface CriptoDetalleProps {
  estado: CriptoEstado;
  onVolver: () => void;
}

/**
 * Detalle de un par cripto: por qué el veredicto (checklist con ✓/✗),
 * rango de 20 días, resumen de RSI/tendencia y advertencia de volatilidad.
 */
export default function CriptoDetalleScreen({ estado, onVolver }: CriptoDetalleProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const nombre = estado.simbolo.startsWith('BTC') ? 'Bitcoin' : 'Ethereum';
  const checks = analizarChecks(estado);

  // Cierres diarios para el gráfico
  const [velas, setVelas] = useState<VelaDiaria[]>([]);
  useEffect(() => {
    api.get<VelaDiaria[]>(`/cripto/velas/${estado.simbolo}?dias=30`)
      .then((response) => setVelas(response.data))
      .catch((e) => console.warn('No se pudieron cargar las velas', e));
  }, [estado.simbolo]);

  // Normalización del gráfico de barras
  const cierres = velas.map((v) => v.cierre);
  const minCierre = cierres.length > 0 ? Math.min(...cierres) : 0;
  const maxCierre = cierres.length > 0 ? Math.max(...cierres) : 1;
  const rangoCierres = Math.max(maxCierre - minCierre, 1);
  const tendenciaAlza = cierres.length > 1 && cierres[cierres.length - 1] >= cierres[0];

  // Posición del precio dentro del rango de 20 días (0 = soporte, 1 = resistencia)
  const rango = estado.resistencia20 - estado.soporte20;
  const posicion = rango > 0
    ? Math.min(1, Math.max(0, (estado.precio - estado.soporte20) / rango))
    : 0.5;

  const interpretarRsi = (rsi: number) =>
    rsi < 30 ? 'sobrevendido — posible rebote' : rsi > 70 ? 'sobrecomprado — cuidado con correcciones' : 'zona neutral';

  const tendencia = estado.sma50 != null && estado.sma200 != null
    ? (estado.sma50 > estado.sma200 ? 'alcista (SMA50 por encima de SMA200)' : 'bajista (SMA50 por debajo de SMA200)')
    : 'sin datos suficientes';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <BotonVolver onPress={onVolver} />

        {/* Encabezado */}
        <View style={s.encabezado}>
          <Header text={nombre} level="title" />
          <Badge label={estado.veredicto} tone={TONO_VEREDICTO[estado.veredicto] ?? 'warning'} />
        </View>
        <Text style={s.precio} numberOfLines={1}>${estado.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        {estado.cambio3d != null && (
          <Text style={[s.cambio, estado.cambio3d >= 0 ? s.verde : s.rojo]}>
            {estado.cambio3d >= 0 ? '+' : ''}{estado.cambio3d.toFixed(1)}% últimos 3 días
          </Text>
        )}

        {/* Gráfico de cierres (30 días) */}
        {velas.length > 0 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 30 días" level="section" style={s.tituloSeccion} />
            <View style={s.grafico}>
              {cierres.map((cierre, i) => (
                <View
                  key={i}
                  style={[
                    s.barra,
                    {
                      height: Math.max(((cierre - minCierre) / rangoCierres) * 100, 6),
                      backgroundColor: tendenciaAlza ? colors.systemGreen : colors.systemRed,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={s.fila}>
              <Text style={s.label}>Mín ${minCierre.toLocaleString('es-AR')}</Text>
              <Text style={s.label}>Máx ${maxCierre.toLocaleString('es-AR')}</Text>
            </View>
          </Card>
        )}

        {/* Rango de 20 días */}
        <Card style={s.card}>
          <Header text="Rango de 20 días" level="section" style={s.tituloSeccion} />
          <View style={s.track}>
            <View style={[s.marcador, { left: `${posicion * 100}%` }]} />
          </View>
          <View style={s.fila}>
            <Text style={s.label}>Soporte ${estado.soporte20.toLocaleString('es-AR')}</Text>
            <Text style={s.label}>Resistencia ${estado.resistencia20.toLocaleString('es-AR')}</Text>
          </View>
          <Text style={s.nota}>
            El punto verde es el precio actual. Más cerca del soporte = mejor momento de entrada.
          </Text>
        </Card>

        {/* Por qué este veredicto */}
        <Card style={s.card}>
          <Header text="¿Por qué este veredicto?" level="section" style={s.tituloSeccion} />
          {checks.map((check) => (
            <View key={check.label} style={s.checkFila}>
              <Ionicons
                name={check.pasado ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={check.pasado ? colors.systemGreen : colors.systemRed}
              />
              <View style={s.checkTexto}>
                <Text style={s.checkLabel}>{check.label}</Text>
                <Text style={s.checkDetalle}>{check.detalle}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Resumen del mercado */}
        <Card style={s.card}>
          <Header text="Resumen del mercado" level="section" style={s.tituloSeccion} />
          <View style={s.fila}>
            <Text style={s.label}>RSI (14)</Text>
            <Text style={s.valor}>
              {estado.rsi14 != null ? `${estado.rsi14.toFixed(1)} — ${interpretarRsi(estado.rsi14)}` : 'n/d'}
            </Text>
          </View>
          <View style={s.fila}>
            <Text style={s.label}>Tendencia</Text>
            <Text style={s.valor}>{tendencia}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.label}>SMA 50 / SMA 200</Text>
            <Text style={s.valor}>
              {estado.sma50 != null ? `$${estado.sma50.toLocaleString('es-AR')}` : 'n/d'}
              {' / '}
              {estado.sma200 != null ? `$${estado.sma200.toLocaleString('es-AR')}` : 'n/d'}
            </Text>
          </View>
        </Card>

        {/* Advertencia de volatilidad */}
        <Advertencia texto={
          'Las criptomonedas son muy volátiles: pueden bajar 20% o más en pocos días. ' +
          'Este análisis técnico es informativo y no garantiza resultados. Invertí solo ' +
          'lo que estés dispuesto a perder.'
        } />

        <ExplicarDatosIA datos={
          `${nombre}: precio $${estado.precio.toLocaleString('es-AR')}, ` +
          `RSI(14) ${estado.rsi14 != null ? estado.rsi14.toFixed(1) : 'n/d'}, ` +
          `soporte $${estado.soporte20.toLocaleString('es-AR')}, resistencia $${estado.resistencia20.toLocaleString('es-AR')}, ` +
          `veredicto ${estado.veredicto} (${estado.checksPasados}/4 checks), ` +
          `variación 3 días ${estado.cambio3d != null ? estado.cambio3d.toFixed(1) + '%' : 'n/d'}.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    precio: { ...typography.title1, fontWeight: '700', color: colors.label, marginBottom: spacing.xs },
    cambio: { ...typography.footnote, marginBottom: spacing.xl },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    tituloSeccion: { marginBottom: spacing.lg },

    grafico: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
      height: 110,
      marginBottom: spacing.md,
    },
    barra: { flex: 1, borderRadius: 2, opacity: 0.85 },

    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.tertiarySystemBackground,
      marginBottom: spacing.md,
    },
    marcador: {
      position: 'absolute',
      top: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.systemGreen,
      borderWidth: 2,
      borderColor: colors.systemBackground,
      marginLeft: -8,
    },
    fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.md },
    label: { ...typography.footnote, color: colors.secondaryLabel, flexShrink: 1 },
    valor: { ...typography.footnote, fontWeight: '600', color: colors.label, textAlign: 'right', flexShrink: 1 },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.sm },

    checkFila: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    checkTexto: { flex: 1 },
    checkLabel: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    checkDetalle: { ...typography.caption1, color: colors.secondaryLabel, marginTop: 2 },
  });
