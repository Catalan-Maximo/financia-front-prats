import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Card de advertencia: ícono de alerta + texto informativo.
 * Mismo look para todas las notas de riesgo de la app.
 */
export default function Advertencia({ texto }: { texto: string }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Card style={s.card}>
      <View style={s.fila}>
        <Ionicons name="warning" size={18} color={colors.systemYellow} />
        <Text style={s.texto}>{texto}</Text>
      </View>
    </Card>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: { padding: spacing.lg, marginBottom: spacing.lg },
    fila: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    texto: { ...typography.footnote, color: colors.label, lineHeight: 20, flex: 1 },
  });
