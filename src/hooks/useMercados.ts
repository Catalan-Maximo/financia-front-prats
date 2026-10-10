import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { AccionCotizacion, DolarCotizacion, PackCotizacion } from '../domain/mercados';

/**
 * Hook de la sección Mercados: carga los tres bloques de datos
 * (acciones + packs, dólar) con un solo request en paralelo.
 * El JWT lo adjunta el interceptor de Axios.
 */
export default function useMercados() {
  const [acciones, setAcciones] = useState<AccionCotizacion[]>([]);
  const [packs, setPacks] = useState<PackCotizacion[]>([]);
  const [dolar, setDolar] = useState<DolarCotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [accionesRes, packsRes, dolarRes] = await Promise.all([
        api.get<AccionCotizacion[]>('/mercados/acciones'),
        api.get<PackCotizacion[]>('/mercados/packs'),
        api.get<DolarCotizacion[]>('/mercados/dolar'),
      ]);
      setAcciones(accionesRes.data);
      setPacks(packsRes.data);
      setDolar(dolarRes.data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { acciones, packs, dolar, loading, error, limpiarError: () => setError(false), recargar: cargar };
}
