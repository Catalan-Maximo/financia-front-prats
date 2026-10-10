import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ExplicarDatosIA from '../components/ExplicarDatosIA';
import BotonVolver from '../components/BotonVolver';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { PackCotizacion } from '../domain/mercados';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TONO_RIESGO: Record<string, 'success' | 'warning' | 'danger'> = {
  Bajo: 'success',
  Moderado: 'warning',
  Agresivo: 'danger',
};

interface PackDetailProps {
  pack: PackCotizacion;
  onVolver: () => void;
}

/**
 * Detalle de un pack: variación ponderada y composición con
 * porcentajes reales de la base de datos.
 */
export default function PackDetailScreen({ pack, onVolver }: PackDetailProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

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

        <View style={s.encabezado}>
          <Header text={pack.nombre} level="title" />
          <Badge label={`Riesgo: ${pack.riesgo}`} tone={TONO_RIESGO[pack.riesgo] ?? 'warning'} />
        </View>
        <Text style={[s.variacion, pack.variacion24h >= 0 ? s.verde : s.rojo]}>
          {pack.variacion24h >= 0 ? '+' : ''}{pack.variacion24h.toFixed(2)}% hoy
        </Text>
        <Text style={s.nota}>
          La variación del pack es el promedio ponderado de la variación real de cada activo que lo compone.
        </Text>

        <Card style={s.card}>
          <Header text="Composición" level="section" style={s.seccionTitulo} />
          {pack.composicion.map((item) => (
            <View key={item.ticker} style={s.fila}>
              <View style={s.filaIzq}>
                <View style={s.miniLogo}>
                  <Text style={s.miniLogoTexto}>{item.ticker.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={s.ticker}>{item.ticker}</Text>
              </View>
              <Text style={s.porcentaje}>{item.porcentaje}%</Text>
            </View>
          ))}
        </Card>

        <ExplicarDatosIA datos={
          `Pack "${pack.nombre}" (riesgo ${pack.riesgo}): hoy rindió ${pack.variacion24h >= 0 ? '+' : ''}${pack.variacion24h.toFixed(2)}%. ` +
          `Composición: ${pack.composicion.map((c) => `${c.ticker} ${c.porcentaje}%`).join(', ')}.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    variacion: { ...typography.title2, fontWeight: '700', marginBottom: spacing.sm },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
    nota: { ...typography.caption1, color: colors.secondaryLabel, marginBottom: spacing.xl },

    card: { padding: spacing.lg, marginBottom: spacing.xl },
    seccionTitulo: { marginBottom: spacing.lg },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    filaIzq: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    miniLogo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniLogoTexto: { ...typography.caption2, fontWeight: '700', color: colors.label },
    ticker: { ...typography.body, fontWeight: '600', color: colors.label },
    porcentaje: { ...typography.body, fontWeight: '700', color: colors.brand },

    boton: { marginTop: spacing.sm },
  });
