import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { Gasto, MetaAhorro, Posicion, ResumenGastos } from '../domain/midinero';

/**
 * Hook de Mi Dinero: posiciones del portafolio y metas de ahorro
 * con sus acciones (agregar, aportar, eliminar).
 */
export default function useMiDinero() {
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [metas, setMetas] = useState<MetaAhorro[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumen, setResumen] = useState<ResumenGastos | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    // allSettled: si un endpoint falla, los demás igual cargan
    const [pos, met, gas, res] = await Promise.allSettled([
      api.get<Posicion[]>('/midinero/posiciones'),
      api.get<MetaAhorro[]>('/midinero/metas'),
      api.get<Gasto[]>('/midinero/gastos'),
      api.get<ResumenGastos>('/midinero/gastos/resumen'),
    ]);

    if (pos.status === 'fulfilled') setPosiciones(pos.value.data);
    else console.warn('posiciones no cargaron', pos.reason?.message);

    if (met.status === 'fulfilled') setMetas(met.value.data);
    else console.warn('metas no cargaron', met.reason?.message);

    if (gas.status === 'fulfilled') setGastos(gas.value.data);
    else console.warn('gastos no cargaron', gas.reason?.message);

    if (res.status === 'fulfilled') setResumen(res.value.data);
    else console.warn('resumen no cargó', res.reason?.message);

    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const agregarPosicion = async (activo: string, cantidad: number, precioCompra: number) => {
    await api.post('/midinero/posiciones', { activo, cantidad, precioCompra });
    await cargar();
  };

  const eliminarPosicion = async (id: number) => {
    await api.delete(`/midinero/posiciones/${id}`);
    await cargar();
  };

  const crearMeta = async (nombre: string, montoObjetivo: number, fechaLimite: string) => {
    await api.post('/midinero/metas', { nombre, montoObjetivo, fechaLimite });
    await cargar();
  };

  const aportarMeta = async (id: number, monto: number) => {
    await api.post(`/midinero/metas/${id}/aporte`, { monto });
    await cargar();
  };

  const eliminarMeta = async (id: number) => {
    await api.delete(`/midinero/metas/${id}`);
    await cargar();
  };

  const agregarGasto = async (categoria: string, descripcion: string, monto: number) => {
    await api.post('/midinero/gastos', { categoria, descripcion, monto });
    await cargar();
  };

  const eliminarGasto = async (id: number) => {
    await api.delete(`/midinero/gastos/${id}`);
    await cargar();
  };

  const guardarIngreso = async (monto: number) => {
    await api.post('/midinero/ingreso', { monto });
    await cargar();
  };

  return {
    posiciones, metas, gastos, resumen, loading,
    agregarPosicion, eliminarPosicion,
    crearMeta, aportarMeta, eliminarMeta,
    agregarGasto, eliminarGasto, guardarIngreso,
  };
}
