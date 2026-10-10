import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BotonVolver from '../components/BotonVolver';
import Advertencia from '../components/Advertencia';
import Screen from '../components/Screen';
import GraficoBarras, { type PuntoGrafico } from '../components/GraficoBarras';
import ExplicarDatosIA from '../components/ExplicarDatosIA';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { AccionCotizacion, Fundamentales } from '../domain/mercados';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

const TONO_VALORACION: Record<string, 'success' | 'warning' | 'danger' | 'brand'> = {
  Barata: 'success',
  Razonable: 'warning',
  Cara: 'danger',
  'n/d': 'brand',
};

interface AccionDetalleProps {
  cotizacion: AccionCotizacion;
  onVolver: () => void;
}

const formatMiles = (v: number | null) =>
  v == null ? 'n/d' : `$${(v / 1_000_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}B`;

/**
 * Detalle de una acción: precio, gráfico de 3 meses y fundamentales
 * (P/E con valoración, ingresos, margen neto, deuda vs caja).
 */
export default function AccionDetalleScreen({ cotizacion, onVolver }: AccionDetalleProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [fundamentales, setFundamentales] = useState<Fundamentales | null>(null);
  const [velas, setVelas] = useState<PuntoGrafico[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Fundamentales>(`/mercados/fundamentales/${cotizacion.ticker}`),
      api.get<PuntoGrafico[]>(`/mercados/acciones/${cotizacion.ticker}/velas`),
    ])
      .then(([f, v]) => {
        setFundamentales(f.data);
        setVelas(v.data);
      })
      .catch((e) => console.warn('Sin datos de detalle', e));
  }, [cotizacion.ticker]);

  const f = fundamentales;
  const crecimiento = f?.crecimientoIngresosPct;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BotonVolver onPress={onVolver} />

        <View style={s.cabecera}>
          <View style={s.cabeceraIzq}>
            <Header text={cotizacion.ticker} level="title" />
            <Text style={[s.variacion, cotizacion.variacion24h >= 0 ? s.verde : s.rojo]}>
              {cotizacion.variacion24h >= 0 ? '+' : ''}{cotizacion.variacion24h.toFixed(2)}% hoy
            </Text>
          </View>
          <Text style={s.precio} numberOfLines={1}>${cotizacion.precio.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</Text>
        </View>

        {/* Gráfico */}
        {velas.length > 1 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 3 meses" level="section" style={s.seccion} />
            <GraficoBarras puntos={velas} prefijo="$" />
          </Card>
        )}

        {/* Fundamentales */}
        {f && (
          <>
            <Card style={s.card}>
              <View style={s.fundHeader}>
                <Header text="Fundamentales" level="section" />
                <Badge label={f.valoracionPrecio} tone={TONO_VALORACION[f.valoracionPrecio] ?? 'brand'} />
              </View>

              <View style={s.fila}>
                <Text style={s.label}>P/E (precio / ganancia)</Text>
                <Text style={s.valor}>{f.pe != null ? f.pe.toFixed(1) : 'n/d'}</Text>
              </View>
              <Text style={s.nota}>
                Un P/E bajo de 20 suele indicar acción "barata"; muy por encima de 30, "cara".
              </Text>

              <View style={s.fila}>
                <Text style={s.label}>Crecimiento de ingresos (año a año)</Text>
                <Text style={[s.valor, crecimiento != null && (crecimiento >= 0 ? s.verde : s.rojo)]}>
                  {crecimiento != null ? `${crecimiento >= 0 ? '+' : ''}${crecimiento.toFixed(1)}%` : 'n/d'}
                </Text>
              </View>

              <View style={s.fila}>
                <Text style={s.label}>Margen neto</Text>
                <Text style={s.valor}>
                  {f.margenNetoPct != null ? `${f.margenNetoPct.toFixed(1)}%` : 'n/d'}
                </Text>
              </View>
              <Text style={s.nota}>
                El margen neto es lo que le queda a la empresa después de pagar todos sus gastos.
              </Text>

              <View style={s.fila}>
                <Text style={s.label}>Deuda / Caja</Text>
                <Text style={s.valor}>{formatMiles(f.deuda)} / {formatMiles(f.caja)}</Text>
              </View>
              <Text style={[s.nota, f.deudaMayorQueCaja ? s.rojo : s.verde]}>
                {f.deudaMayorQueCaja
                  ? 'Tiene más deuda que caja: a largo plazo conviene que el capital supere las deudas.'
                  : 'Tiene más caja que deuda: situación financiera sólida.'}
              </Text>
            </Card>

            {/* Ingresos anuales */}
            {f.ingresosAnuales.length > 1 && (
              <Card style={s.card}>
                <Header text="Ingresos anuales" level="section" style={s.seccion} />
                <GraficoBarras
                  puntos={f.ingresosAnuales.map((a) => ({ fecha: a.anio, valor: a.ingresos }))}
                  alto={90}
                  prefijo=""
                />
                <Text style={s.nota}>
                  Lo ideal: ingresos que crecen año tras año, como muestra el gráfico.
                </Text>
              </Card>
            )}
          </>
        )}

        <Advertencia texto={
          'Este análisis fundamental es informativo y no garantiza resultados. Las acciones ' +
          'pueden bajar por factores ajenos a la empresa.'
        } />

        {f && (
          <ExplicarDatosIA datos={
            `${cotizacion.ticker}: P/E ${f.pe != null ? f.pe.toFixed(1) : 'n/d'} (${f.valoracionPrecio}), ` +
            `ingresos ${crecimiento != null ? (crecimiento >= 0 ? '+' : '') + crecimiento.toFixed(1) + '%' : 'n/d'} año a año, ` +
            `margen neto ${f.margenNetoPct != null ? f.margenNetoPct.toFixed(1) + '%' : 'n/d'}, ` +
            `deuda ${formatMiles(f.deuda)} contra caja ${formatMiles(f.caja)}. ` +
            `Ingresos anuales: ${f.ingresosAnuales.map((a) => a.anio + ' ' + formatMiles(a.ingresos)).join(', ')}.`
          } />
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    cabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    cabeceraIzq: { gap: spacing.xs, flexShrink: 1 },
    variacion: { ...typography.footnote, fontWeight: '600' },
    precio: { ...typography.title1, fontWeight: '700', color: colors.label },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
    fundHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    fila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    label: { ...typography.footnote, color: colors.secondaryLabel, flex: 1 },
    valor: { ...typography.footnote, fontWeight: '700', color: colors.label },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 16 },

    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
  });
