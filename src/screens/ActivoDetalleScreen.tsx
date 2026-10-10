import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BotonVolver from '../components/BotonVolver';
import Screen from '../components/Screen';
import GraficoBarras, { type PuntoGrafico } from '../components/GraficoBarras';
import ExplicarDatosIA from '../components/ExplicarDatosIA';
import { INFLACION_ESTIMADA_DASHBOARD } from '../constants';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { Activo } from '../domain/activo';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface ActivoDetalleProps {
  activo: Activo;
  onVolver: () => void;
}

/**
 * Detalle de un activo de renta fija: tasa actual y tendencia
 * de los últimos 30 días (los datos los guarda el job diario).
 */
export default function ActivoDetalleScreen({ activo, onVolver }: ActivoDetalleProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [historial, setHistorial] = useState<PuntoGrafico[]>([]);

  useEffect(() => {
    api.get<PuntoGrafico[]>(`/activos/historial/${encodeURIComponent(activo.entidad)}`)
      .then((r) => setHistorial(r.data))
      .catch(() => {});
  }, [activo.entidad]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BotonVolver onPress={onVolver} />

        <Header text={activo.entidad} level="title" style={s.titulo} />
        <View style={s.datos}>
          <Badge label={activo.tipo} tone="brand" />
          <Text style={s.tna}>{activo.tna}% TNA</Text>
        </View>
        {(() => {
          const real = activo.tna / 12 - INFLACION_ESTIMADA_DASHBOARD;
          return (
            <Badge
              label={real > 0 ? 'Le gana a la inflación' : 'Pierde con la inflación'}
              tone={real > 0 ? 'success' : 'danger'}
              style={s.veredictoBadge}
            />
          );
        })()}

        <Card style={s.card}>
          <Header text="Tendencia — últimos 30 días" level="section" style={s.seccion} />
          {historial.length > 1 ? (
            <GraficoBarras puntos={historial} prefijo="" />
          ) : (
            <Text style={s.sinDatos}>Todavía no hay historial suficiente (se acumula día a día).</Text>
          )}
        </Card>

        <Card style={s.card}>
          <Header text="Riesgo" level="section" style={s.seccion} />
          <Text style={s.texto}>
            Renta fija: el rendimiento es contractual (Bajo riesgo). No fluctúa como las
            acciones o cripto, aunque puede perder contra la inflación.
          </Text>
        </Card>

        <ExplicarDatosIA datos={
          `${activo.entidad} (${activo.tipo}): TNA ${activo.tna}% anual. ` +
          `Rendimiento real mensual estimado ${(activo.tna / 12 - 4).toFixed(2)}% contra una inflación del 4%.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    titulo: { marginBottom: spacing.md },
    datos: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    veredictoBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
    tna: { ...typography.title2, fontWeight: '700', color: colors.label },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
    sinDatos: { ...typography.footnote, color: colors.secondaryLabel },
    texto: { ...typography.footnote, color: colors.secondaryLabel, lineHeight: 18 },
  });
