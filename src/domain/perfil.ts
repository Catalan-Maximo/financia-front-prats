/**
 * Clasificación del perfil inversor por puntuación.
 * Espejo del backend (PerfilInversorService) — se usa en el
 * modo offline cuando el backend no responde.
 */

/** Perfiles posibles. */
export type PerfilInversor = 'Conservador' | 'Moderado' | 'Agresivo';

/** Rangos de puntuación (test breve de 6 preguntas: 6 a 29). */
export const RANGOS_PUNTAJE = {
  conservadorMax: 13,
  moderadoMax: 23,
  agresivoMin: 24,
} as const;

/**
 * Clasifica un puntaje en un perfil inversor.
 * Valores fuera de rango se clasifican al extremo más cercano.
 */
export function clasificarPerfilLocal(puntaje: number): PerfilInversor {
  if (puntaje <= RANGOS_PUNTAJE.conservadorMax) return 'Conservador';
  if (puntaje <= RANGOS_PUNTAJE.moderadoMax) return 'Moderado';
  return 'Agresivo';
}
