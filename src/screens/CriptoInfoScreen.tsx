import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import BotonVolver from '../components/BotonVolver';
import Advertencia from '../components/Advertencia';
import Screen from '../components/Screen';
import GraficoBarras, { type PuntoGrafico } from '../components/GraficoBarras';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { CriptoInfo } from '../domain/cripto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface CriptoInfoProps {
  info: CriptoInfo;
  onVolver: () => void;
}

/**
 * Detalle informativo de una cripto extra: precio, variación 24h y
 * gráfico de 3 meses. Sin análisis técnico (eso es solo para BTC/ETH).
 */
export default function CriptoInfoScreen({ info, onVolver }: CriptoInfoProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [velas, setVelas] = useState<PuntoGrafico[]>([]);

  useEffect(() => {
    api.get<PuntoGrafico[]>(`/cripto/velas/${info.simbolo}?dias=90`)
      .then((r) => setVelas(r.data))
      .catch(() => {});
  }, [info.simbolo]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BotonVolver onPress={onVolver} />

        <Header text={info.nombre} level="title" style={s.titulo} />
        <Text style={s.precio} numberOfLines={1}>${info.precio.toLocaleString('es-AR', { maximumFractionDigits: 4 })}</Text>
        <Text style={[s.variacion, info.variacion24h >= 0 ? s.verde : s.rojo]}>
          {info.variacion24h >= 0 ? '+' : ''}{info.variacion24h.toFixed(2)}% últimas 24h
        </Text>

        {velas.length > 1 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 3 meses" level="section" style={s.seccion} />
            <GraficoBarras puntos={velas} prefijo="$" />
          </Card>
        )}

        <Advertencia texto={
          'Esta cripto es solo informativa: no tiene el análisis técnico ni los ' +
          'veredictos de compra que damos para Bitcoin y Ethereum. Las cripto son ' +
          'muy volátiles y pueden bajar 20% o más en pocos días.'
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    titulo: { marginBottom: spacing.sm },
    precio: { ...typography.title1, fontWeight: '700', color: colors.label },
    variacion: { ...typography.footnote, fontWeight: '600', marginBottom: spacing.lg },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
  });
