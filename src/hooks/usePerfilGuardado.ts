import { useEffect, useState } from 'react';
import { obtenerPerfil } from '../lib/storage';

/**
 * Hook de arranque: lee el perfil guardado en AsyncStorage.
 * Mientras carga, `cargando` es true (la app muestra un spinner).
 * Si existe un perfil de una sesión anterior, `perfilGuardado`
 * lo contiene y App salta el test directamente.
 */
export default function usePerfilGuardado() {
  const [perfilGuardado, setPerfilGuardado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerPerfil()
      .then((perfil) => {
        if (activo) setPerfilGuardado(perfil);
      })
      .catch((error) => {
        // Si el storage falla, arrancamos como si no hubiera perfil
        console.warn('No se pudo leer el perfil guardado', error);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return { perfilGuardado, cargando };
}
