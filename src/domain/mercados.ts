/**
 * Tipos de la sección Mercados (GET /mercados/...).
 * Mapean 1:1 con los DTOs del backend.
 */

/** Cotización de una acción/ETF (Yahoo Finance). */
export interface AccionCotizacion {
  ticker: string;
  precio: number;
  variacion24h: number;
  /** Valoración por P/E: "Barata" / "Razonable" / "Cara" / "n/d". */
  valoracionPrecio?: string;
}

/** Cotización de un tipo de dólar (DolarAPI). */
export interface DolarCotizacion {
  nombre: string;
  compra: number;
  venta: number;
  fecha: string;
}

/** Un activo dentro de un pack con su peso. */
export interface PackComposicionItem {
  ticker: string;
  porcentaje: number;
}

/** Un pack de inversión con su variación ponderada. */
export interface PackCotizacion {
  id: number;
  nombre: string;
  riesgo: 'Bajo' | 'Moderado' | 'Agresivo';
  variacion24h: number;
  composicion: PackComposicionItem[];
}

/** Un año de resultados de una empresa. */
export interface IngresoAnual {
  anio: string;
  ingresos: number;
  neto: number;
}

/** Fundamentales de una acción (Yahoo Finance). */
export interface Fundamentales {
  ticker: string;
  pe: number | null;
  valoracionPrecio: 'Barata' | 'Razonable' | 'Cara' | 'n/d';
  crecimientoIngresosPct: number | null;
  margenNetoPct: number | null;
  deuda: number | null;
  caja: number | null;
  deudaMayorQueCaja: boolean;
  ingresosAnuales: IngresoAnual[];
}
