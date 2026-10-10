import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface ExplicarDatosIAProps {
  /** Texto con los datos a explicar (ej. "P/E 33.1, margen 5.3%..."). */
  datos: string;
}

/**
 * Botón "explicámelo con IA": manda los datos al backend y muestra
 * la explicación en palabras simples, para usuarios sin formación financiera.
 */
export default function ExplicarDatosIA({ datos }: ExplicarDatosIAProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);

  const explicar = async () => {
    if (cargando) return;
    setCargando(true);
    setRespuesta(null);
    try {
      const res = await api.post('/ia/explicar', { datos }, { timeout: 30000 });
      setRespuesta(res.data.respuesta);
    } catch (e) {
      console.error(e);
      setRespuesta('No pude explicarlo ahora. Intentá de nuevo en unos segundos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={s.contenedor}>
      <Pressable
        style={({ pressed }) => [s.boton, pressed && s.botonPressed]}
        onPress={explicar}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator size="small" color={colors.brand} />
        ) : (
          <Ionicons name="sparkles-outline" size={16} color={colors.brand} />
        )}
        <Text style={s.botonTexto}>Que me lo explique la IA</Text>
      </Pressable>

      {respuesta != null && (
        <View style={s.respuesta}>
          <Text style={s.respuestaTexto}>{respuesta}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    contenedor: { marginTop: spacing.md },
    boton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    botonPressed: { opacity: 0.7 },
    botonTexto: { ...typography.subheadline, fontWeight: '600', color: colors.brand },

    respuesta: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    respuestaTexto: { ...typography.footnote, color: colors.label, lineHeight: 18 },
  });
