import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { Activo } from '../domain/activo';

/**
 * Hook que carga las tasas de mercado (GET /activos/tasas).
 * Encapsula fetching, estado de carga y error — la pantalla
 * solo renderiza y muestra el alert cuando hay error.
 */
export default function useMercado() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<Activo[]>('/activos/tasas');
      setActivos(response.data);
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

  return { activos, loading, error, limpiarError: () => setError(false), recargar: cargar };
}
