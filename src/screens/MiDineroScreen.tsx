import React, { useMemo, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import EstadoVacio from '../components/EstadoVacio';
import SegmentedTabs from '../components/SegmentedTabs';
import BarraProgreso from '../components/BarraProgreso';
import Cargando from '../components/Cargando';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMiDinero from '../hooks/useMiDinero';
import { ACTIVOS_PORTFOLIO, CATEGORIAS_GASTO } from '../domain/midinero';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

type TabMiDinero = 'portafolio' | 'metas' | 'gastos';

const TABS_MIDINERO = [
  { key: 'gastos', label: 'Gastos' },
  { key: 'metas', label: 'Metas' },
  { key: 'portafolio', label: 'Portafolio' },
];

const formatPesos = (v: number) =>
  `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Mi Dinero: portafolio personal (P&L con precios reales) y metas
 * de ahorro con barra de progreso.
 */
export default function MiDineroScreen() {
  const [tab, setTab] = useState<TabMiDinero>('gastos');
  const {
    posiciones, metas, gastos, resumen, loading,
    agregarPosicion, eliminarPosicion, crearMeta, aportarMeta, eliminarMeta,
    agregarGasto, eliminarGasto, guardarIngreso,
  } = useMiDinero();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Formulario de posición
  const [activo, setActivo] = useState(ACTIVOS_PORTFOLIO[0]);
  const [cantidad, setCantidad] = useState('10');
  const [precio, setPrecio] = useState('');

  // Formulario de meta
  const [nombreMeta, setNombreMeta] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [fechaMeta, setFechaMeta] = useState('2027-12-31');

  // Aporte inline por meta
  const [aporteMetaId, setAporteMetaId] = useState<number | null>(null);
  const [aporteMonto, setAporteMonto] = useState('');

  // Formulario de gasto
  const [categoriaGasto, setCategoriaGasto] = useState(CATEGORIAS_GASTO[0]);
  const [descripcionGasto, setDescripcionGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');

  // Ingreso mensual
  const [ingresoTexto, setIngresoTexto] = useState('');

  const agregarPos = async () => {
    const cant = parseFloat(cantidad);
    const prec = parseFloat(precio || '0');
    if (!prec || !cant) {
      Alert.alert('Error', 'Completá cantidad y precio de compra.');
      return;
    }
    await agregarPosicion(activo, cant, prec);
    setPrecio('');
    setCantidad('10');
  };

  const crear = async () => {
    const obj = parseFloat(objetivo);
    if (!nombreMeta.trim() || !obj) {
      Alert.alert('Error', 'Completá nombre y monto objetivo.');
      return;
    }
    await crearMeta(nombreMeta.trim(), obj, fechaMeta);
    setNombreMeta('');
    setObjetivo('');
  };

  const confirmarAporte = async () => {
    const monto = parseFloat(aporteMonto);
    if (aporteMetaId != null && monto > 0) {
      await aportarMeta(aporteMetaId, monto);
    }
    setAporteMetaId(null);
    setAporteMonto('');
  };

  if (loading) {
    return (
      <Screen>
        <Cargando style={s.loading} />
      </Screen>
    );
  }

  const totalValor = posiciones.reduce((acc, p) => acc + p.valorActual, 0);
  const totalGanancia = posiciones.reduce((acc, p) => acc + p.ganancia, 0);

  return (
    <Screen safeTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <Header text="Mi Dinero" level="title" style={s.titulo} />

        {/* Top Tabs */}
        <SegmentedTabs
          opciones={TABS_MIDINERO}
          activa={tab}
          onCambiar={(t) => setTab(t as TabMiDinero)}
        />

        {tab === 'portafolio' && (
          <>
            {/* Resumen */}
            {posiciones.length > 0 && (
              <Card style={s.resumen}>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Valor total</Text>
                  <Text style={s.resumenValor}>{formatPesos(totalValor)}</Text>
                </View>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Ganancia total</Text>
                  <Text style={[s.resumenValor, totalGanancia >= 0 ? s.verde : s.rojo]}>
                    {totalGanancia >= 0 ? '+' : ''}{formatPesos(totalGanancia)}
                  </Text>
                </View>
              </Card>
            )}

            {/* Formulario */}
            <Card style={s.form}>
              <Header text="Agregar posición" level="section" style={s.formTitulo} />
              <View style={s.chips}>
                {ACTIVOS_PORTFOLIO.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setActivo(a)}
                    style={[s.chip, activo === a && s.chipActivo]}
                  >
                    <Text style={[s.chipTexto, activo === a && s.chipTextoActivo]}>{a}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={cantidad}
                  onChangeText={setCantidad}
                  keyboardType="numeric"
                  placeholder="Cantidad"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="numeric"
                  placeholder="Precio de compra"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable style={({ pressed }) => [s.boton, pressed && s.botonPressed]} onPress={agregarPos}>
                <Text style={s.botonTexto}>Agregar</Text>
              </Pressable>
            </Card>

            {/* Lista */}
            {posiciones.map((p) => (
              <Card key={p.id} style={s.posicion}>
                <View style={s.posHeader}>
                  <Text style={s.posActivo} numberOfLines={1}>{p.activo}</Text>
                  <Text style={[s.posGanancia, p.ganancia >= 0 ? s.verde : s.rojo]}>
                    {p.ganancia >= 0 ? '+' : ''}{p.gananciaPct.toFixed(2)}%
                  </Text>
                </View>
                <Text style={s.posDetalle} numberOfLines={1}>
                  {p.cantidad} × {formatPesos(p.precioCompra)} → {formatPesos(p.precioActual)} ahora
                </Text>
                {p.alerta && (
                  <View style={s.stopLoss}>
                    <Ionicons name="warning" size={16} color={colors.systemRed} />
                    <Text style={s.stopLossTexto}>
                      Stop-loss: cayó más del 10% desde tu compra
                    </Text>
                  </View>
                )}
                <View style={s.posPie}>
                  <Text style={s.posValor} numberOfLines={1}>
                    {formatPesos(p.valorActual)} · {p.ganancia >= 0 ? '+' : ''}{formatPesos(p.ganancia)}
                  </Text>
                  <Pressable onPress={() => eliminarPosicion(p.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {posiciones.length === 0 && (
              <EstadoVacio
                icono="briefcase-outline"
                titulo="Todavía no tenés posiciones"
                detalle="Cargá tu primera posición para seguir tu plata real."
              />
            )}
          </>
        )}

        {tab === 'metas' && (
          <>
            <Card style={s.form}>
              <Header text="Nueva meta" level="section" style={s.formTitulo} />
              <TextInput
                style={s.inputFull}
                value={nombreMeta}
                onChangeText={setNombreMeta}
                placeholder="Nombre (ej. Viaje a Bariloche)"
                placeholderTextColor={colors.tertiaryLabel}
              />
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={objetivo}
                  onChangeText={setObjetivo}
                  keyboardType="numeric"
                  placeholder="Objetivo $"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={fechaMeta}
                  onChangeText={setFechaMeta}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable style={({ pressed }) => [s.boton, pressed && s.botonPressed]} onPress={crear}>
                <Text style={s.botonTexto}>Crear meta</Text>
              </Pressable>
            </Card>

            {metas.map((m) => {
              const pct = m.montoObjetivo > 0
                ? Math.min(100, (m.montoActual / m.montoObjetivo) * 100) : 0;
              return (
                <Card key={m.id} style={s.posicion}>
                  <View style={s.posHeader}>
                    <Text style={s.posActivo} numberOfLines={1}>{m.nombre}</Text>
                    <Text style={s.metaPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <BarraProgreso progreso={pct} style={s.progressTrack} />
                  <Text style={s.posDetalle} numberOfLines={1}>
                    {formatPesos(m.montoActual)} de {formatPesos(m.montoObjetivo)} · hasta {m.fechaLimite}
                  </Text>

                  <View style={s.metaAcciones}>
                    {aporteMetaId === m.id ? (
                      <View style={s.aporteFila}>
                        <TextInput
                          style={[s.input, s.aporteInput]}
                          value={aporteMonto}
                          onChangeText={setAporteMonto}
                          keyboardType="numeric"
                          placeholder="Monto $"
                          placeholderTextColor={colors.tertiaryLabel}
                        />
                        <Pressable style={[s.boton, s.botonChico]} onPress={confirmarAporte}>
                          <Text style={s.botonTexto}>OK</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable style={[s.boton, s.botonChico]} onPress={() => setAporteMetaId(m.id)}>
                        <Text style={s.botonTexto}>+ Aportar</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => eliminarMeta(m.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                    </Pressable>
                  </View>
                </Card>
              );
            })}

            {metas.length === 0 && (
              <EstadoVacio
                icono="flag-outline"
                titulo="Todavía no tenés metas"
                detalle="Creá tu primera meta y empezá a medir tu progreso."
              />
            )}
          </>
        )}

        {tab === 'gastos' && (
          <>
            {/* Resumen del mes */}
            {resumen && (
              <Card style={s.resumen}>
                <Header text="Este mes" level="section" style={s.formTitulo} />

                <Text style={s.resumenLabel}>Ingreso mensual</Text>
                <View style={s.ingresoFila}>
                  <TextInput
                    style={[s.input, s.ingresoInput]}
                    value={ingresoTexto || (resumen.ingreso > 0 ? String(resumen.ingreso) : '')}
                    onChangeText={setIngresoTexto}
                    keyboardType="numeric"
                    placeholder="Declarar ingreso"
                    placeholderTextColor={colors.tertiaryLabel}
                  />
                  <Pressable
                    style={[s.boton, s.botonOk]}
                    onPress={() => {
                      const m = parseFloat(ingresoTexto);
                      if (m > 0) guardarIngreso(m);
                    }}
                  >
                    <Text style={s.botonTexto}>OK</Text>
                  </Pressable>
                </View>

                <View style={s.resumenDivisor} />

                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Total gastado</Text>
                  <Text style={s.resumenValor} numberOfLines={1}>{formatPesos(resumen.total)}</Text>
                </View>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Te sobra</Text>
                  <Text
                    style={[s.resumenValor, (resumen.sobra ?? 0) >= 0 ? s.verde : s.rojo]}
                    numberOfLines={1}
                  >
                    {resumen.sobra != null ? formatPesos(resumen.sobra) : 'Declará tu ingreso'}
                  </Text>
                </View>
              </Card>
            )}

            {/* Por categoría */}
            {resumen && Object.keys(resumen.porCategoria).length > 0 && (
              <Card style={s.posicion}>
                <Header text="Gastos por categoría" level="section" style={s.formTitulo} />
                {Object.entries(resumen.porCategoria).map(([cat, monto]) => {
                  const maxCat = Math.max(...Object.values(resumen.porCategoria), 1);
                  const ancho = Math.max((monto / maxCat) * 100, 6);
                  return (
                    <View key={cat} style={s.categoriaFila}>
                      <Text style={s.categoriaNombre}>{cat}</Text>
                      <BarraProgreso progreso={ancho} style={s.categoriaTrack} />
                      <Text style={s.categoriaMonto} numberOfLines={1}>{formatPesos(monto)}</Text>
                    </View>
                  );
                })}
              </Card>
            )}

            {/* Metas: cuánto necesito por mes */}
            {resumen && resumen.metasMensuales.length > 0 && (
              <Card style={s.posicion}>
                <Header text="Para tus metas" level="section" style={s.formTitulo} />
                {resumen.metasMensuales.map((m) => (
                  <View key={m.nombre} style={s.categoriaFila}>
                    <Text style={s.categoriaNombre} numberOfLines={1}>{m.nombre}</Text>
                    <Text style={s.categoriaMonto} numberOfLines={1}>
                      {formatPesos(m.porMes)}/mes · faltan {formatPesos(m.faltante)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Formulario de gasto */}
            <Card style={s.form}>
              <Header text="Agregar gasto" level="section" style={s.formTitulo} />
              <View style={s.chips}>
                {CATEGORIAS_GASTO.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategoriaGasto(c)}
                    style={[s.chip, categoriaGasto === c && s.chipActivo]}
                  >
                    <Text style={[s.chipTexto, categoriaGasto === c && s.chipTextoActivo]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={descripcionGasto}
                  onChangeText={setDescripcionGasto}
                  placeholder="Descripción"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={montoGasto}
                  onChangeText={setMontoGasto}
                  keyboardType="numeric"
                  placeholder="Monto $"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable
                style={({ pressed }) => [s.boton, pressed && s.botonPressed]}
                onPress={async () => {
                  const m = parseFloat(montoGasto);
                  if (!m) {
                    Alert.alert('Error', 'Poné el monto del gasto.');
                    return;
                  }
                  await agregarGasto(categoriaGasto, descripcionGasto, m);
                  setMontoGasto('');
                  setDescripcionGasto('');
                }}
              >
                <Text style={s.botonTexto}>Agregar</Text>
              </Pressable>
            </Card>

            {/* Lista de gastos */}
            {gastos.map((g) => (
              <Card key={g.id} style={s.posicion}>
                <View style={s.posHeader}>
                  <Text style={s.posActivo} numberOfLines={1}>
                    {g.categoria}{g.descripcion ? ` · ${g.descripcion}` : ''}
                  </Text>
                  <Text style={s.posValor}>{formatPesos(g.monto)}</Text>
                </View>
                <View style={s.posPie}>
                  <Text style={s.posDetalle}>{g.fecha}</Text>
                  <Pressable onPress={() => eliminarGasto(g.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {gastos.length === 0 && (
              <EstadoVacio
                icono="receipt-outline"
                titulo="Todavía no tenés gastos"
                detalle="Cargá tus gastos del mes para ver en qué se va tu plata."
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    titulo: { marginBottom: spacing.lg },

    resumen: { padding: spacing.lg, marginBottom: spacing.lg },
    resumenFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    resumenLabel: { ...typography.footnote, color: colors.secondaryLabel },
    resumenValor: { ...typography.title3, fontWeight: '700', color: colors.label, flexShrink: 1, textAlign: 'right' },
    resumenDivisor: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },

    form: { padding: spacing.lg, marginBottom: spacing.lg },
    formTitulo: { marginBottom: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 16,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    chipActivo: { backgroundColor: colors.brand },
    chipTexto: { ...typography.caption1, color: colors.secondaryLabel },
    chipTextoActivo: { color: colors.onBrand, fontWeight: '600' },

    filaInputs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    input: {
      flex: 1,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
    },
    inputFull: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
      marginBottom: spacing.md,
    },

    boton: {
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    botonPressed: { opacity: 0.85 },
    botonChico: { alignSelf: 'flex-start' },
    botonTexto: { ...typography.subheadline, fontWeight: '700', color: colors.onBrand },

    posicion: { padding: spacing.lg, marginBottom: spacing.md },
    posHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
    posActivo: { ...typography.headline, fontWeight: '700', color: colors.label, flex: 1 },
    posGanancia: { ...typography.subheadline, fontWeight: '700' },
    posDetalle: { ...typography.caption1, color: colors.secondaryLabel, marginTop: spacing.xs },
    posValor: { ...typography.footnote, fontWeight: '600', color: colors.label, flex: 1 },
    posPie: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    metaPct: { ...typography.subheadline, fontWeight: '700', color: colors.brand },
    stopLoss: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.dangerBg,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
    stopLossTexto: { ...typography.caption1, fontWeight: '600', color: colors.systemRed, flex: 1 },

    progressTrack: { marginTop: spacing.md },

    metaAcciones: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    aporteFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    aporteInput: { flex: 1 },

    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },

    ingresoFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    ingresoInput: { flex: 1 },
    botonOk: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, alignSelf: 'stretch' },
    categoriaFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    categoriaNombre: { ...typography.footnote, color: colors.label, flex: 1 },
    categoriaTrack: { flex: 1.5 },
    categoriaMonto: {
      ...typography.footnote,
      fontWeight: '600',
      color: colors.label,
      textAlign: 'right',
      flexShrink: 1,
      minWidth: 80,
    },
  });
