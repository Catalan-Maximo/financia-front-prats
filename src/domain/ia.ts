import type { RendimientoDTO } from './inversion';

/**
 * Tipos para el asesor virtual de IA.
 * Mapean 1:1 con los DTOs del backend (com.FinancIA.api.dto).
 */

/** Request body para POST /ia/simular */
export interface IARequest {
  /** Perfil de riesgo: "Conservador", "Moderado" o "Agresivo". */
  perfilInversor: string;
  /** Monto disponible para invertir en pesos. */
  monto: number;
  /** Plazo de inversión deseado en meses. */
  plazoMeses: number;
  /** Inflación mensual estimada (%, ej. 4.0 = 4%). */
  inflacionMensual: number;
  /** Activo A a comparar (opcional). */
  activoA?: string;
  /** Activo B a comparar (opcional). */
  activoB?: string;
}

/** Una asignación porcentual del portafolio sugerido. */
export interface Asignacion {
  /** Tipo de activo (ej. "Billetera Virtual", "Plazo Fijo", "Dólar / Cobertura"). */
  tipoActivo: string;
  /** Porcentaje sugerido del portafolio (0-100). */
  porcentaje: number;
  /** Justificación breve de la asignación. */
  motivo: string;
}

/** Response de POST /ia/simular */
export interface IAResponse {
  /** Perfil de riesgo utilizado para la recomendación. */
  perfilInversor: string;
  /** Texto de recomendación generado por la IA. */
  recomendacion: string;
  /** Nivel de riesgo general: "Bajo", "Medio", "Alto". */
  nivelRiesgo: string;
  /** Distribución sugerida del portafolio. */
  distribucionSugerida: Asignacion[];
  /** Rendimientos proyectados para cada activo del mercado. */
  rendimientos: RendimientoDTO[];
  /** Ganancia real total estimada en $ al final del plazo. */
  gananciaRealEstimada: number;
  /** Resumen breve de la estrategia. */
  resumenEstrategia: string;
}
