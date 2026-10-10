import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface AssetListItemProps {
  /** Símbolo (ticker) o nombre corto. */
  simbolo: string;
  /** Nombre descriptivo. */
  nombre?: string;
  /** Precio formateado (string, ya viene listo). */
  precio: string;
  /** Variación en % (negativa = rojo, positiva = verde). */
  variacion: number;
  /** Detalle opcional (ej. "Compra/Venta" del dólar). */
  detalle?: string;
  /** Badge de veredicto opcional (ej. "BUY" verde, "Cara" rojo). */
  badge?: { texto: string; tono: 'success' | 'warning' | 'danger' | 'brand' };
  onPress?: () => void;
}

/** Paleta de colores para el avatar según el símbolo (estilo Lemon). */
const COLORES_AVATAR = ['#F7931A', '#627EEA', '#26A17A', '#F0B90B', '#3C3C3D'];

function colorAvatar(simbolo: string): string {
  let hash = 0;
  for (let i = 0; i < simbolo.length; i++) hash += simbolo.charCodeAt(i);
  return COLORES_AVATAR[hash % COLORES_AVATAR.length];
}

/**
 * Fila de activo estilo Lemon: avatar circular con iniciales a la
 * izquierda, nombre+ticker al centro, precio y variación a la derecha.
 */
export default function AssetListItem({ simbolo, nombre, precio, variacion, detalle, badge, onPress }: AssetListItemProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const avatarColor = useMemo(() => colorAvatar(simbolo), [simbolo]);

  return (
    <Pressable
      style={({ pressed }) => [s.fila, pressed && s.filaPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[s.avatar, { backgroundColor: avatarColor }]}>
        <Text style={s.avatarTexto} maxFontSizeMultiplier={1.3}>{simbolo.substring(0, 2).toUpperCase()}</Text>
      </View>

      <View style={s.centro}>
        <Text style={s.simbolo} numberOfLines={1} maxFontSizeMultiplier={1.3}>{simbolo}</Text>
        {nombre && <Text style={s.nombre} numberOfLines={1} maxFontSizeMultiplier={1.3}>{nombre}</Text>}
        {detalle && <Text style={s.nombre} numberOfLines={1} maxFontSizeMultiplier={1.3}>{detalle}</Text>}
      </View>

      <View style={s.derecha}>
        <Text style={s.precio} numberOfLines={1} maxFontSizeMultiplier={1.3}>{precio}</Text>
        <Text style={[s.variacion, variacion >= 0 ? s.verde : s.rojo]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {variacion >= 0 ? '+' : ''}{variacion.toFixed(2)}%
        </Text>
        {badge && <Badge label={badge.texto} tone={badge.tono} style={s.badge} />}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
    },
    filaPressed: { backgroundColor: colors.fill },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTexto: { ...typography.subheadline, fontWeight: '700', color: '#FFFFFF' },
    centro: { flex: 1, minWidth: 0 },
    simbolo: { ...typography.headline, fontWeight: '600', color: colors.label },
    nombre: { ...typography.caption1, color: colors.secondaryLabel },
    derecha: { alignItems: 'flex-end', gap: spacing.xs },
    badge: { alignSelf: 'flex-end' },
    precio: { ...typography.headline, fontWeight: '600', color: colors.label },
    variacion: { ...typography.footnote, fontWeight: '600' },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
  });
