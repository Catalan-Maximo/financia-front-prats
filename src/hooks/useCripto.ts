import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { CriptoAlerta, CriptoEstado, CriptoInfo } from '../domain/cripto';

/**
 * Hook que carga el estado cripto (GET /cripto/estado), las señales
 * (GET /cripto/alertas) y las criptos extra informativas.
 */
export default function useCripto() {
  const [cripto, setCripto] = useState<CriptoEstado[]>([]);
  const [alertas, setAlertas] = useState<CriptoAlerta[]>([]);
  const [extras, setExtras] = useState<CriptoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [estado, senales, info] = await Promise.all([
        api.get<CriptoEstado[]>('/cripto/estado'),
        api.get<CriptoAlerta[]>('/cripto/alertas'),
        api.get<CriptoInfo[]>('/mercados/cripto-info'),
      ]);
      setCripto(estado.data);
      setAlertas(senales.data);
      setExtras(info.data);
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

  return { cripto, alertas, extras, loading, error, limpiarError: () => setError(false), recargar: cargar };
}
