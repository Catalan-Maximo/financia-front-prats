import React, { useMemo } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

interface InputProps {
  /** Label descriptivo arriba del campo (opcional). */
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  /** Oculta el texto (para contraseñas). */
  secureTextEntry?: boolean;
  /** Estilos adicionales para el contenedor. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Campo de texto estilo iOS: fondo "fill" redondeado sin borde,
 * label semibold arriba del campo.
 */
export default function Input({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, style }: InputProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={style}>
      {label && <Text style={s.label} maxFontSizeMultiplier={1.3}>{label}</Text>}
      <TextInput
        style={s.input}
        maxFontSizeMultiplier={1.3}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholder={placeholder}
        placeholderTextColor={colors.tertiaryLabel}
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    label: {
      ...typography.subheadline,
      fontWeight: '600',
      color: colors.secondaryLabel,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    input: {
      backgroundColor: colors.fill,
      color: colors.label,
      ...typography.body,
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    },
  });
