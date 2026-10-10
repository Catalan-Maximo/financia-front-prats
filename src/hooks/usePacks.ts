import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { PackCotizacion } from '../domain/mercados';

/**
 * Hook que carga los packs de inversión (GET /mercados/packs).
 * El JWT lo adjunta el interceptor de Axios.
 */
export default function usePacks() {
  const [packs, setPacks] = useState<PackCotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const response = await api.get<PackCotizacion[]>('/mercados/packs');
      setPacks(response.data);
    } catch (e) {
      console.warn('No se pudieron cargar los packs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { packs, loading };
}
