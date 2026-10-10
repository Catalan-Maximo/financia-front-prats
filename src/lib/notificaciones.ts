import * as Notifications from 'expo-notifications';
import api from './api';

/**
 * Pide permiso de notificaciones y registra el Expo push token
 * en el backend (POST /usuarios/push-token) para que el job de
 * cripto avise cuando cambia el veredicto de compra/venta.
 *
 * Nota: las notificaciones remotas no llegan en Expo Go de Android
 * (limitación de Expo Go desde SDK 53); funcionan en iOS Expo Go
 * y en development builds.
 */
export async function registrarNotificaciones(): Promise<void> {
  try {
    const permisos = await Notifications.requestPermissionsAsync();
    if (!permisos.granted) {
      console.warn('Permiso de notificaciones denegado');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await api.post('/usuarios/push-token', { token });
    console.info('Push token registrado en el backend');
  } catch (error) {
    console.warn('No se pudieron registrar las notificaciones', error);
  }
}
