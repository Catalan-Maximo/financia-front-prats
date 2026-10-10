import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Screen from '../components/Screen';
import AssetListItem from '../components/AssetListItem';
import PackCard from '../components/PackCard';
import SegmentedTabs from '../components/SegmentedTabs';
import Cargando from '../components/Cargando';
import GraficoBarras, { type PuntoGrafico } from '../components/GraficoBarras';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMercados from '../hooks/useMercados';
import useCripto from '../hooks/useCripto';
import type { PackCotizacion, AccionCotizacion } from '../domain/mercados';
import type { CriptoEstado, CriptoInfo } from '../domain/cripto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

type TabMercado = 'acciones' | 'dolar' | 'crypto';

const TABS: { key: TabMercado; label: string }[] = [
  { key: 'acciones', label: 'Acciones' },
  { key: 'dolar', label: 'Dólar' },
  { key: 'crypto', label: 'Crypto' },
];

const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface MercadosScreenProps {
  onAbrirPack: (pack: PackCotizacion) => void;
  onAbrirDetalleCripto: (estado: CriptoEstado) => void;
  onAbrirVersus: () => void;
  onAbrirAccion: (accion: AccionCotizacion) => void;
  onAbrirCriptoInfo: (info: CriptoInfo) => void;
}

/**
 * Sección Mercados con navegación superior (Acciones / Dólar / Crypto)
 * y carrusel horizontal de packs de inversión.
 */
export default function MercadosScreen({ onAbrirPack, onAbrirDetalleCripto, onAbrirVersus, onAbrirAccion, onAbrirCriptoInfo }: MercadosScreenProps) {
  const [tab, setTab] = useState<TabMercado>('acciones');
  const { acciones, packs, dolar, loading, error, limpiarError } = useMercados();
  const { cripto, extras } = useCripto();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Historial del dólar oficial para el gráfico de la pestaña Dólar
  const [historialDolar, setHistorialDolar] = useState<PuntoGrafico[]>([]);
  useEffect(() => {
    api.get<PuntoGrafico[]>('/mercados/dolar-historial?dias=30')
      .then((r) => setHistorialDolar(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error de carga', 'No se pudieron sincronizar los mercados.', [
        { text: 'OK', onPress: limpiarError },
      ]);
    }
  }, [error, limpiarError]);

  if (loading) {
    return (
      <Screen>
        <Cargando style={s.loading} />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <Header text="Mercados" level="title" style={s.titulo} />

      {/* Acceso al VERSUS */}
      <Pressable
        style={({ pressed }) => [s.versusBtn, pressed && s.versusPressed]}
        onPress={onAbrirVersus}
      >
        <Ionicons name="git-compare-outline" size={18} color={colors.onBrand} />
        <Text style={s.versusTexto}>Versus: compará dos inversiones</Text>
      </Pressable>

      {/* Top Tabs */}
      <SegmentedTabs
        opciones={TABS}
        activa={tab}
        onCambiar={(t) => setTab(t as TabMercado)}
        style={s.tabsMargin}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        {tab === 'acciones' && (
          <>
            {/* Carrusel de packs */}
            <Header text="Packs de Inversión" level="section" style={s.seccion} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} onPress={() => onAbrirPack(pack)} />
              ))}
            </ScrollView>

            {/* Lista de acciones */}
            <Header text="Acciones y ETFs" level="section" style={s.seccion} />
            {acciones.map((a) => (
              <AssetListItem
                key={a.ticker}
                simbolo={a.ticker}
                nombre={nombreTicker(a.ticker)}
                precio={`$${a.precio.toLocaleString('es-AR')}`}
                variacion={a.variacion24h}
                onPress={() => onAbrirAccion(a)}
              />
            ))}
          </>
        )}

        {tab === 'dolar' && (
          <>
            <Header text="Dólar Oficial — últimos 30 días" level="section" style={s.seccion} />
            {historialDolar.length > 1 && (
              <View style={s.graficoDolar}>
                <GraficoBarras puntos={historialDolar} prefijo="$" />
              </View>
            )}
            <Header text="Cotizaciones del Dólar" level="section" style={s.seccion} />
            {dolar.map((d) => (
              <AssetListItem
                key={d.nombre}
                simbolo={abreviaturaDolar(d.nombre)}
                nombre={d.nombre}
                precio={`$${d.venta.toLocaleString('es-AR')}`}
                variacion={0}
                detalle={`Compra $${d.compra.toLocaleString('es-AR')} · Venta $${d.venta.toLocaleString('es-AR')} · ${d.fecha}`}
              />
            ))}
          </>
        )}

        {tab === 'crypto' && (
          <>
            <Header text="Cripto" level="section" style={s.seccion} />
            {cripto.map((c) => (
              <AssetListItem
                key={c.simbolo}
                simbolo={c.simbolo.replace('USDT', '')}
                nombre={c.simbolo.startsWith('BTC') ? 'Bitcoin' : 'Ethereum'}
                precio={`$${c.precio.toLocaleString('es-AR')}`}
                variacion={c.cambio3d ?? 0}
                detalle={`RSI ${c.rsi14 != null ? c.rsi14.toFixed(1) : 'n/d'}`}
                badge={{
                  texto: c.veredicto,
                  tono: TONO_VEREDICTO[c.veredicto] ?? 'warning',
                }}
                onPress={() => onAbrirDetalleCripto(c)}
              />
            ))}

            {extras.length > 0 && (
              <>
                <Header text="Otras criptomonedas (informativo)" level="section" style={s.seccion} />
                {extras.map((info) => (
                  <AssetListItem
                    key={info.simbolo}
                    simbolo={info.simbolo.replace('USDT', '')}
                    nombre={info.nombre}
                    precio={`$${info.precio.toLocaleString('es-AR')}`}
                    variacion={info.variacion24h}
                    onPress={() => onAbrirCriptoInfo(info)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

/** Nombres amigables para los tickers de la sección Acciones. */
function nombreTicker(ticker: string): string {
  const nombres: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corp.',
    SPY: 'SPDR S&P 500 ETF',
    YPF: 'YPF S.A. (ADR)',
    GGAL: 'Grupo Financiero Galicia (ADR)',
  };
  return nombres[ticker] ?? ticker;
}

/** Abreviatura para el avatar de cada dólar. */
function abreviaturaDolar(nombre: string): string {
  const abrev: Record<string, string> = {
    'Oficial': 'OF',
    'Blue': 'BL',
    'Bolsa': 'MEP',
    'Contado con liquidación': 'CCL',
    'Cripto': 'CR',
    'Tarjeta': 'TA',
    'Mayorista': 'MA',
  };
  return abrev[nombre] ?? nombre.substring(0, 2).toUpperCase();
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    titulo: { marginTop: spacing.lg, marginBottom: spacing.lg },

    versusBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
    },
    versusPressed: { opacity: 0.85 },
    versusTexto: { ...typography.subheadline, fontWeight: '700', color: colors.onBrand },

    graficoDolar: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },

    tabsMargin: { marginBottom: spacing.sm },

    seccion: { marginTop: spacing.xl, marginBottom: spacing.md },
  });
