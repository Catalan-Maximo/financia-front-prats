import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface PuntoGrafico {
  fecha: string;
  valor: number;
}

interface GraficoBarrasProps {
  /** Puntos ordenados cronológicamente. */
  puntos: PuntoGrafico[];
  /** Alto del gráfico en px. */
  alto?: number;
  /** Formato de los valores en las etiquetas (ej. "$" para precios). */
  prefijo?: string;
}

/**
 * Gráfico de barras sin dependencias: normaliza los valores al alto
 * disponible, verde si la serie subió, rojo si bajó.
 */
export default function GraficoBarras({ puntos, alto = 110, prefijo = '' }: GraficoBarrasProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  if (puntos.length < 2) return null;

  const valores = puntos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = Math.max(max - min, 0.0001);
  const alza = valores[valores.length - 1] >= valores[0];

  const formato = (v: number) => `${prefijo}${v.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;

  return (
    <View>
      <View style={[s.grafico, { height: alto }]}>
        {puntos.map((p) => (
          <View
            key={p.fecha}
            style={[
              s.barra,
              {
                height: Math.max(((p.valor - min) / rango) * alto, 4),
                backgroundColor: alza ? colors.systemGreen : colors.systemRed,
              },
            ]}
          />
        ))}
      </View>
      <View style={s.etiquetas}>
        <Text style={s.etiqueta}>{formato(min)}</Text>
        <Text style={s.etiqueta}>{formato(max)}</Text>
      </View>
      <View style={s.fechas}>
        <Text style={s.etiqueta}>{puntos[0].fecha}</Text>
        <Text style={s.etiqueta}>{puntos[puntos.length - 1].fecha}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    grafico: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
      marginBottom: spacing.sm,
    },
    barra: { flex: 1, borderRadius: 2, opacity: 0.85 },
    etiquetas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fechas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    etiqueta: { ...typography.caption2, color: colors.tertiaryLabel },
  });
