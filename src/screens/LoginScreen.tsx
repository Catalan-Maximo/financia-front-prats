import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/AuthContext';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface LoginScreenProps {
  /** Cambia a la pantalla de registro. */
  onIrARegistro: () => void;
}

export default function LoginScreen({ onIrARegistro }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const enviar = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Completá email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Éxito: App reacciona al token y pasa al flujo principal
    } catch (error) {
      const mensaje = axios.isAxiosError(error)
        ? error.response?.data?.message ?? 'Credenciales inválidas.'
        : 'No se pudo conectar con el backend.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={s.screen}>
      <Header text="Financ.IA" level="title" style={s.titulo} />
      <Text style={s.subtitulo}>Iniciá sesión para continuar</Text>

      <Card style={s.card}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Button
          title="Iniciar Sesión"
          icon="log-in-outline"
          haptics
          onPress={enviar}
          loading={loading}
          style={s.boton}
        />
      </Card>

      <View style={s.footer}>
        <Text style={s.footerTexto}>¿No tenés cuenta?</Text>
        <Pressable onPress={onIrARegistro}>
          <Text style={s.footerLink}>Registrate</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: { justifyContent: 'center' },
    titulo: { textAlign: 'center' },
    subtitulo: {
      ...typography.body,
      color: colors.secondaryLabel,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    card: { padding: spacing.lg },
    boton: { marginTop: spacing.xl },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    footerTexto: { ...typography.body, color: colors.secondaryLabel },
    footerLink: { ...typography.body, color: colors.brand, fontWeight: '600' },
  });
