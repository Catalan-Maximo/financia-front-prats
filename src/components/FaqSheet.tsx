import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

/** Preguntas frecuentes de la app. */
const PREGUNTAS = [
  {
    pregunta: '¿Cómo se calcula mi perfil de inversor?',
    respuesta:
      'Completás un test breve de 6 preguntas y, según tus respuestas, te clasificamos como Conservador, Moderado o Agresivo.',
  },
  {
    pregunta: '¿Qué es la TNA?',
    respuesta:
      'La Tasa Nominal Anual es el interés anual que paga un instrumento antes de ajustar por inflación.',
  },
  {
    pregunta: '¿Qué significa "rendimiento real"?',
    respuesta:
      'Es la ganancia descontando la inflación: si el número es positivo, tu plata está ganando poder de compra.',
  },
  {
    pregunta: '¿Cómo uso el simulador?',
    respuesta:
      'Ingresá monto, plazo e inflación estimada: comparamos los instrumentos del mercado y te marcamos la mejor opción.',
  },
  {
    pregunta: '¿Cómo rehago el test del inversor?',
    respuesta: 'Abrí el menú (ícono de tres rayas, arriba a la izquierda) y tocá "Rehacer test del inversor".',
  },
  {
    pregunta: '¿Qué significan BUY, WATCH y AVOID en cripto?',
    respuesta:
      'Es el veredicto de nuestro análisis técnico diario: BUY = la mayoría de las señales dan para comprar, WATCH = esperar y observar, AVOID = mejor mantenerse afuera. Nunca es una garantía: la cripto es muy volátil.',
  },
  {
    pregunta: '¿Qué es el RSI?',
    respuesta:
      'Es un indicador de 0 a 100 que mide si un activo está "sobrecomprado" (por encima de 70, puede venir una corrección) o "sobrevendido" (por debajo de 30, posible rebote). Entre 30 y 70 se considera zona neutral.',
  },
  {
    pregunta: '¿Qué son el soporte y la resistencia?',
    respuesta:
      'El soporte es el precio mínimo de los últimos 20 días (donde suele frenarse una caída) y la resistencia el máximo (donde suele frenarse una suba). Comprar cerca del soporte suele ser un mejor momento de entrada.',
  },
  {
    pregunta: '¿Qué es la tendencia SMA50/SMA200?',
    respuesta:
      'Son promedios móviles del precio: de 50 y de 200 días. Si el promedio corto (50) está por encima del largo (200), la tendencia es alcista; si está por debajo, es bajista.',
  },
  {
    pregunta: '¿Cómo me avisan cuándo comprar o vender cripto?',
    respuesta:
      'Analizamos el mercado todos los días a las 8:15. Si el veredicto de Bitcoin o Ethereum cambia, te mandamos una notificación (por ejemplo: "BTC cambió de WATCH a BUY — señal de compra").',
  },
  {
    pregunta: '¿Es seguro invertir en cripto?',
    respuesta:
      'Las criptomonedas son muy volátiles: pueden bajar 20% o más en pocos días. El análisis técnico es informativo y no garantiza resultados. Invertí solo lo que estés dispuesto a perder.',
  },
];

interface FaqSheetProps {
  /** Si el panel está abierto. */
  visible: boolean;
  /** Cerrar el panel (tap en el scrim o en la X). */
  onClose: () => void;
}

/**
 * Panel deslizante desde la izquierda con las consultas frecuentes,
 * en formato lista agrupada estilo iOS: filas que se expanden al tocarlas.
 */
export default function FaqSheet({ visible, onClose }: FaqSheetProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors, dark), [colors, dark]);

  const ANCHO = Math.min(width * 0.85, 360);

  const scrim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-ANCHO)).current;
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scrim, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
      Animated.spring(slide, {
        toValue: visible ? 0 : -ANCHO,
        tension: 220,
        friction: 26,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, ANCHO, scrim, slide]);

  const toggle = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    // Expansión fluida de la respuesta (easeInEaseOut de iOS)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbierta((a) => (a === index ? null : index));
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[s.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          s.panel,
          {
            width: ANCHO,
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        {/* Cabecera del sheet */}
        <View style={s.cabecera}>
          <Text style={s.titulo}>Consultas Frecuentes</Text>
          <Pressable onPress={onClose} hitSlop={8} style={s.cerrar}>
            <Ionicons name="close" size={24} color={colors.label} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Lista agrupada: un solo grupo con separadores hairline */}
          <View style={s.grupo}>
            {PREGUNTAS.map((item, index) => {
              const esAbierta = abierta === index;
              const esUltima = index === PREGUNTAS.length - 1;
              return (
                <Pressable
                  key={item.pregunta}
                  onPress={() => toggle(index)}
                  style={({ pressed }) => [s.fila, !esUltima && s.filaBorde, pressed && s.filaPressed]}
                >
                  <View style={s.filaContenido}>
                    <View style={s.filaTitulo}>
                      <Text style={s.pregunta}>{item.pregunta}</Text>
                      <Ionicons
                        name={esAbierta ? 'chevron-down' : 'chevron-forward'}
                        size={18}
                        color={colors.tertiaryLabel}
                      />
                    </View>
                    {esAbierta && <Text style={s.respuesta}>{item.respuesta}</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], dark: boolean) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      backgroundColor: colors.secondarySystemBackground,
      borderTopRightRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.separator,
      paddingHorizontal: spacing.lg,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.lg,
    },
    titulo: {
      ...typography.title3,
      fontWeight: '600',
      color: colors.label,
    },
    cerrar: {
      padding: spacing.xs,
    },
    scroll: {
      paddingBottom: spacing.xl,
    },
    grupo: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    fila: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    filaBorde: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    filaPressed: {
      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    filaContenido: {
      gap: spacing.sm,
    },
    filaTitulo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    pregunta: {
      ...typography.headline,
      color: colors.label,
      flex: 1,
    },
    respuesta: {
      ...typography.callout,
      color: colors.secondaryLabel,
    },
  });
