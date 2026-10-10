import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useChat from '../hooks/useChat';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

/** Sugerencias iniciales: desaparecen con el primer mensaje del usuario. */
const SUGERENCIAS = [
  '¿Qué es el dólar MEP?',
  '¿Cuánto rinde Mercado Pago hoy?',
  '¿Cómo me protejo de la inflación?',
];

/**
 * Chat de dudas: el usuario pregunta lo que sea y el asistente
 * responde con los datos reales de la app (tasas, dólar, cripto, packs).
 */
export default function ChatScreen() {
  const { mensajes, enviando, enviar, limpiar } = useChat();
  const [texto, setTexto] = useState('');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [mensajes, enviando]);

  const hayMensajes = mensajes.length > 0;

  const mandar = () => {
    const t = texto;
    setTexto('');
    enviar(t);
  };

  return (
    <Screen safeTop={false}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <Header text="Chat de Dudas" level="title" style={s.titulo} />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.md,
          }}
        >
          {/* Sugerencias (solo antes del primer mensaje) */}
          {!hayMensajes && (
            <>
              <Text style={s.subtitulo}>
                Preguntame lo que quieras sobre la app, tasas, dólar, cripto o inflación:
              </Text>
              {SUGERENCIAS.map((pregunta) => (
                <Pressable
                  key={pregunta}
                  style={({ pressed }) => [s.chip, pressed && s.chipPressed]}
                  onPress={() => enviar(pregunta)}
                >
                  <Text style={s.chipTexto}>{pregunta}</Text>
                </Pressable>
              ))}
            </>
          )}

          {/* Burbujas */}
          {mensajes.map((m, i) => (
            <View
              key={i}
              style={[s.burbuja, m.rol === 'user' ? s.burbujaUser : s.burbujaBot]}
            >
              <Text style={m.rol === 'user' ? s.textoUser : s.textoBot}>{m.contenido}</Text>
            </View>
          ))}

          {enviando && (
            <View style={[s.burbuja, s.burbujaBot]}>
              <Text style={s.textoBot}>Escribiendo…</Text>
            </View>
          )}
        </ScrollView>

        {/* Barra de entrada (reserva espacio para la tab bar inferior) */}
        <View style={[s.barra, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.sm }]}>
          {hayMensajes && (
            <Pressable onPress={limpiar} hitSlop={8} style={s.limpiarBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.tertiaryLabel} />
            </Pressable>
          )}
          <TextInput
            style={s.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribí tu duda…"
            placeholderTextColor={colors.tertiaryLabel}
            onSubmitEditing={mandar}
            returnKeyType="send"
            editable={!enviando}
          />
          <Pressable
            onPress={mandar}
            disabled={enviando || !texto.trim()}
            style={[s.enviarBtn, (enviando || !texto.trim()) && s.enviarBtnOff]}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: { flex: 1 },
    titulo: { marginTop: spacing.lg, marginBottom: spacing.lg },
    subtitulo: { ...typography.callout, color: colors.secondaryLabel, marginBottom: spacing.md },

    chip: {
      alignSelf: 'flex-start',
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 18,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    chipPressed: { opacity: 0.7 },
    chipTexto: { ...typography.subheadline, color: colors.label },

    burbuja: {
      maxWidth: '82%',
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    burbujaUser: {
      alignSelf: 'flex-end',
      backgroundColor: colors.brand,
    },
    burbujaBot: {
      alignSelf: 'flex-start',
      backgroundColor: colors.secondarySystemBackground,
    },
    textoUser: { ...typography.body, color: colors.onBrand },
    textoBot: { ...typography.body, color: colors.label },

    barra: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    limpiarBtn: { padding: spacing.xs },
    input: {
      flex: 1,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
    },
    enviarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    enviarBtnOff: { opacity: 0.4 },
  });
