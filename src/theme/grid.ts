import { spacing } from './spacing';

/**
 * Rejilla para tarjetas pareadas (Versus, cripto del dashboard).
 * `alignItems: 'stretch'` + `flex: 1` garantizan que dos tarjetas
 * lado a lado midan exactamente lo mismo, aunque les falte información.
 */
export const grid = {
  /** Fila de dos columnas pareadas. */
  fila: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md },
  /** Columna dentro de la fila. */
  col: { flex: 1 },
} as const;
