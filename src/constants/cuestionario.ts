/**
 * Cuestionario breve de perfil inversor (6 preguntas clave).
 * Cada opción suma de 1 a 5 puntos; la suma total (6 a 29)
 * se envía al backend para clasificar el perfil.
 *
 * Es la versión simplificada del test: menos preguntas, las que
 * más correlacionan con la tolerancia al riesgo real del usuario.
 */

/** Una opción de respuesta del cuestionario. */
export interface OpcionCuestionario {
  letra: string;
  texto: string;
  puntos: number;
}

/** Una pregunta del cuestionario. */
export interface PreguntaCuestionario {
  texto: string;
  opciones: OpcionCuestionario[];
}

export const PREGUNTAS: PreguntaCuestionario[] = [
  {
    texto: '¿Qué porcentaje de tus ingresos mensuales podés ahorrar de forma regular?',
    opciones: [
      { letra: 'A', texto: 'Menos del 10%.', puntos: 1 },
      { letra: 'B', texto: 'Entre el 10% y el 30%.', puntos: 3 },
      { letra: 'C', texto: 'Más del 30%.', puntos: 5 },
    ],
  },
  {
    texto: '¿Qué pasaría con tu nivel de vida si perdieras todo lo que vas a invertir?',
    opciones: [
      { letra: 'A', texto: 'Tendría problemas graves para cubrir mis gastos básicos.', puntos: 1 },
      { letra: 'B', texto: 'Me afectaría, pero podría mantener mi estilo de vida.', puntos: 3 },
      { letra: 'C', texto: 'No afectaría en absoluto mi situación económica.', puntos: 5 },
    ],
  },
  {
    texto: '¿Con qué frecuencia operaste instrumentos financieros en los últimos 2 años?',
    opciones: [
      { letra: 'A', texto: 'Nunca, o solo plazos fijos y cuentas remuneradas.', puntos: 1 },
      { letra: 'B', texto: 'Algunas veces al año.', puntos: 3 },
      { letra: 'C', texto: 'Opero de forma activa todos los meses.', puntos: 5 },
    ],
  },
  {
    texto: '¿Cuál es tu horizonte de inversión para este dinero?',
    opciones: [
      { letra: 'A', texto: 'Corto plazo: lo necesito en menos de 6 meses.', puntos: 1 },
      { letra: 'B', texto: 'Mediano plazo: entre 6 meses y 2 años.', puntos: 3 },
      { letra: 'C', texto: 'Largo plazo: más de 2 años.', puntos: 5 },
    ],
  },
  {
    texto: 'Invertiste $100.000 y a los 3 meses ves $80.000 (-20%). ¿Qué hacés?',
    opciones: [
      { letra: 'A', texto: 'Vendo todo antes de que siga bajando.', puntos: 1 },
      { letra: 'B', texto: 'No toco nada y espero a que se recupere.', puntos: 3 },
      { letra: 'C', texto: 'Aprovecho la baja y compro más.', puntos: 5 },
    ],
  },
  {
    texto: '¿Qué relación riesgo/retorno te deja dormir tranquilo?',
    opciones: [
      { letra: 'A', texto: 'Rendimiento bajo pero seguro.', puntos: 1 },
      { letra: 'B', texto: 'Rendimiento moderado con variaciones leves.', puntos: 3 },
      { letra: 'C', texto: 'Rendimiento alto aunque el precio varíe fuerte.', puntos: 5 },
    ],
  },
];
