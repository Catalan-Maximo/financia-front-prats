import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface EstadoVacioProps {
  /** Ícono Ionicons que acompaña el mensaje. */
  icono: keyof typeof Ionicons.glyphMap;
  /** Frase principal. */
  titulo: string;
  /** Texto secundario (qué hacer para salir de este estado). */
  detalle?: string;
}

/**
 * Estado vacío uniforme: ícono en círculo, mensaje y detalle opcional.
 * Mismo look en todas las secciones, aunque falte distinta información.
 */
export default function EstadoVacio({ icono, titulo, detalle }: EstadoVacioProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.contenedor}>
      <View style={s.circulo}>
        <Ionicons name={icono} size={26} color={colors.tertiaryLabel} />
      </View>
      <Text style={s.titulo}>{titulo}</Text>
      {detalle && <Text style={s.detalle}>{detalle}</Text>}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    contenedor: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
    circulo: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.tertiarySystemBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    titulo: { ...typography.subheadline, fontWeight: '600', color: colors.secondaryLabel, textAlign: 'center' },
    detalle: { ...typography.caption1, color: colors.tertiaryLabel, textAlign: 'center' },
  });
