import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import Cargando from '../components/Cargando';
import Entrada from '../components/Entrada';
import useTestPerfil from '../hooks/useTestPerfil';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface TestPerfilProps {
  onTestComplete: (perfil: string) => void;
}

export default function TestPerfilScreen({ onTestComplete }: TestPerfilProps) {
  const {
    preguntaActual,
    indice,
    totalPreguntas,
    loading,
    aviso,
    limpiarAviso,
    responder,
  } = useTestPerfil(onTestComplete);

  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // El aviso (éxito u offline) se muestra como alert cuando el hook lo emite
  useEffect(() => {
    if (aviso) {
      Alert.alert(aviso.titulo, aviso.mensaje, [{ text: 'OK', onPress: limpiarAviso }]);
    }
  }, [aviso, limpiarAviso]);

  // Barra de progreso animada (ancho real medido del track)
  const [trackWidth, setTrackWidth] = useState(0);
  const progreso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trackWidth > 0) {
      Animated.timing(progreso, {
        toValue: ((indice + 1) / totalPreguntas) * trackWidth,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [indice, progreso, totalPreguntas, trackWidth]);

  const elegir = (puntos: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    responder(puntos);
  };

  if (loading) {
    return (
      <Screen>
        <Cargando style={s.loading} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        text={`Paso ${indice + 1} de ${totalPreguntas}`}
        level="label"
        style={s.stepLabel}
      />
      <View
        style={s.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[s.fill, { width: progreso }]} />
      </View>

      <ScrollView contentContainerStyle={s.optionsContainer} showsVerticalScrollIndicator={false}>
        <Entrada key={indice}>
          <Header text={preguntaActual.texto} level="subtitle" style={s.question} />

          {preguntaActual.opciones.map((opcion) => (
            <Card key={opcion.letra} onPress={() => elegir(opcion.puntos)} style={s.optionCard}>
              <Text style={s.optionText}>{opcion.letra}) {opcion.texto}</Text>
            </Card>
          ))}
        </Entrada>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { marginBottom: spacing.sm },
    track: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.tertiarySystemBackground,
      marginBottom: spacing.xl,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 2,
    },
    question: { marginBottom: spacing.xxxl },
    optionsContainer: { gap: spacing.lg, paddingBottom: 40 },
    optionCard: { padding: spacing.lg },
    optionText: {
      ...typography.body,
      color: colors.label,
      textAlign: 'left',
    },
  });
