import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { setOnNoAutorizado } from '../lib/api';
import { borrarPerfil, borrarToken, guardarPerfil, guardarToken, obtenerToken } from '../lib/storage';

interface AuthState {
  /** Token JWT de la sesión (null = no logueado). */
  token: string | null;
  /** Email del usuario logueado (null si no hay sesión). */
  email: string | null;
  /** Perfil inversor del usuario logueado (null si todavía no hizo el test). */
  perfilInversor: string | null;
  /** true mientras se restaura la sesión guardada al arrancar. */
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Estado global de sesión (Context API).
 * Envuelve la app en index.tsx; los componentes usan useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [perfilInversor, setPerfilInversor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Restaurar sesión al arrancar (si hay token guardado)
  useEffect(() => {
    obtenerToken()
      .then((guardado) => {
        if (guardado) setToken(guardado);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // Si una petición recibe 401, el interceptor borra el token guardado
  // y nos avisa acá para volver al login (si no, la app queda en loop).
  useEffect(() => {
    setOnNoAutorizado(() => {
      setToken(null);
      setEmail(null);
      setPerfilInversor(null);
    });
    return () => setOnNoAutorizado(null);
  }, []);

  /** El backend devuelve el perfil en el login: lo cacheamos localmente. */
  const sincronizarPerfil = async (perfil: string | null) => {
    setPerfilInversor(perfil ?? null);
    if (perfil) {
      await guardarPerfil(perfil);
    } else {
      await borrarPerfil();
    }
  };

  const login = async (mail: string, password: string) => {
    const response = await api.post('/auth/login', { email: mail, password });
    setToken(response.data.token);
    setEmail(response.data.email);
    await guardarToken(response.data.token);
    await sincronizarPerfil(response.data.perfilInversor ?? null);
  };

  const register = async (nombre: string, mail: string, password: string) => {
    const response = await api.post('/auth/register', { nombre, email: mail, password });
    setToken(response.data.token);
    setEmail(response.data.email);
    await guardarToken(response.data.token);
    // Usuario nuevo: nunca tiene perfil todavía
    await sincronizarPerfil(response.data.perfilInversor ?? null);
  };

  const logout = async () => {
    await borrarToken();
    await borrarPerfil();
    setToken(null);
    setEmail(null);
    setPerfilInversor(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, perfilInversor, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
