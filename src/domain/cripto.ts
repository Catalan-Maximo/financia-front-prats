/**
 * Snapshot del análisis técnico de un par cripto.
 * Mapea 1:1 con la entidad CriptoEstado del backend (GET /cripto/estado).
 */
/** Señal emitida por el backend cuando cambió el veredicto (GET /cripto/alertas). */
export interface CriptoAlerta {
  simbolo: string;
  veredictoActual: string;
  veredictoAnterior: string;
  mensaje: string;
}

/** Un cierre diario para el gráfico (GET /cripto/velas/{simbolo}). */
export interface VelaDiaria {
  fecha: string;
  cierre: number;
}

/** Cripto extra: solo informativa (precio y variación), sin análisis. */
export interface CriptoInfo {
  simbolo: string;
  nombre: string;
  precio: number;
  variacion24h: number;
}

/** Una regla del checklist con su resultado. */
export interface CheckCripto {
  label: string;
  pasado: boolean;
  detalle: string;
}

/**
 * Recalcula las 4 reglas del checklist (espejo del backend
 * CriptoChecklistService) para mostrar el "por qué" del veredicto.
 */
export function analizarChecks(estado: CriptoEstado): CheckCripto[] {
  const distSoporte = ((estado.precio - estado.soporte20) / estado.soporte20) * 100;

  return [
    {
      label: 'Contexto de fondo no bajista',
      pasado: estado.sma200 != null && estado.precio >= estado.sma200 * 0.97,
      detalle: estado.sma200 != null
        ? `Precio $${estado.precio.toFixed(2)} vs SMA200*0.97 $${(estado.sma200 * 0.97).toFixed(2)}`
        : 'SMA200 aún no disponible',
    },
    {
      label: 'Cerca del soporte de 20 días',
      pasado: distSoporte <= 4,
      detalle: `${distSoporte.toFixed(1)}% sobre el soporte ($${estado.soporte20.toFixed(2)})`,
    },
    {
      label: 'RSI(14) sin sobrecompra',
      pasado: estado.rsi14 != null && estado.rsi14 < 70,
      detalle: estado.rsi14 != null ? `RSI ${estado.rsi14.toFixed(1)}` : 'RSI aún no disponible',
    },
    {
      label: 'No persiguiendo una suba fuerte',
      pasado: estado.cambio3d != null && estado.cambio3d <= 12,
      detalle: estado.cambio3d != null ? `Variación 3 días: ${estado.cambio3d.toFixed(1)}%` : 'Sin datos suficientes',
    },
  ];
}

export interface CriptoEstado {
  /** Par analizado (BTCUSDT / ETHUSDT). */
  simbolo: string;
  /** Fecha del snapshot. */
  fecha: string;
  /** Precio de cierre actual en USD. */
  precio: number;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  soporte20: number;
  resistencia20: number;
  /** Variación % de los últimos 3 días. */
  cambio3d: number | null;
  /** Cuántas de las 4 reglas pasaron. */
  checksPasados: number;
  /** BUY / WATCH / AVOID. */
  veredicto: 'BUY' | 'WATCH' | 'AVOID';
  fuente: string;
}
