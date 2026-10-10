/**
 * Activo del mercado devuelto por GET /activos/tasas.
 * Mapea 1:1 con la respuesta del backend (ActivoService).
 */
export interface Activo {
  /** Entidad que ofrece el instrumento (ej. "BCRA", "Mercado Pago"). */
  entidad: string;
  /** Tasa Nominal Anual en % (ej. 23.31). */
  tna: number;
  /** Tipo de instrumento (ej. "Plazo Fijo Tradicional", "Billetera Virtual"). */
  tipo: string;
}
