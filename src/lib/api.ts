import axios from 'axios';
import Constants from 'expo-constants';
import { borrarToken, obtenerToken } from './storage';

// Auto-detecta la IP de la Mac donde corre Expo (y el backend).
// El celular se conecta al servidor de Expo por esa IP, así que
// usamos la misma para llegar al backend en el puerto 8080.
// Fallback: 192.168.100.103 por si hostUri no está disponible.
const hostUri = Constants.expoConfig?.hostUri;
const MAC_IP = hostUri ? hostUri.split(':')[0] : '192.168.100.103';

const api = axios.create({
  baseURL: `http://${MAC_IP}:8080/api/v1`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adjunta el JWT en cada petición
api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Callback que AuthContext registra para reaccionar a un 401
let onNoAutorizado: (() => void) | null = null;
export function setOnNoAutorizado(fn: (() => void) | null) {
  onNoAutorizado = fn;
}

// Token vencido o inválido → limpiamos la sesión local y volvemos al login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await borrarToken();
      onNoAutorizado?.();
    }
    return Promise.reject(error);
  },
);

export default api;
