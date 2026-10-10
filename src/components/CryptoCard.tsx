import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { CriptoEstado } from '../domain/cripto';

/** Tono del badge según veredicto: BUY verde, WATCH amarillo, AVOID rojo. */
const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface CryptoCardProps {
  estado: CriptoEstado;
  /** Abre la pantalla de detalle con el análisis completo. */
  onPress?: () => void;
}

/**
 * Tarjeta de un par cripto: precio actual, RSI, variación de 3 días
 * y veredicto del análisis técnico (BUY/WATCH/AVOID).
 * Tocable para ver el detalle completo.
 */
export default function CryptoCard({ estado, onPress }: CryptoCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const nombre = estado.simbolo.startsWith('BTC') ? 'Bitcoin' : 'Ethereum';
  const cambio = estado.cambio3d;

  return (
    <Card style={s.card} onPress={onPress}>
      <View style={s.header}>
        <Text style={s.nombre} numberOfLines={1} maxFontSizeMultiplier={1.3}>{nombre}</Text>
        <Badge label={estado.veredicto} tone={TONO_VEREDICTO[estado.veredicto] ?? 'warning'} />
      </View>

      <Text style={s.precio} numberOfLines={1} maxFontSizeMultiplier={1.3}>${estado.precio.toLocaleString('es-AR')}</Text>

      <View style={s.fila}>
        <Text style={s.label}>RSI (14)</Text>
        <Text style={s.valor}>{estado.rsi14 != null ? estado.rsi14.toFixed(1) : 'n/d'}</Text>
      </View>
      <View style={s.fila}>
        <Text style={s.label}>Var. 3 días</Text>
        <Text
          style={[
            s.valor,
            cambio != null && (cambio >= 0 ? s.verde : s.rojo),
          ]}
        >
          {cambio != null ? `${cambio >= 0 ? '+' : ''}${cambio.toFixed(1)}%` : 'n/d'}
        </Text>
      </View>
    </Card>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    // flex: 1 estira la tarjeta al alto de la celda: las dos quedan simétricas
    card: { padding: spacing.lg, marginBottom: spacing.md, flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    nombre: { ...typography.callout, fontWeight: '600', color: colors.label },
    precio: { ...typography.title3, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
    fila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    valor: { ...typography.footnote, fontWeight: '600', color: colors.label },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
  });
