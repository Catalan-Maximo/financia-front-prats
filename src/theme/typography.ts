/**
 * Escala tipográfica estilo iOS (Dynamic Type, valores de Apple).
 * Tracking negativo solo en títulos grandes; cuerpo sin tracking.
 */
export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: -0.37, fontWeight: '700' },
  title1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.26, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.21, fontWeight: '600' },
  title3: { fontSize: 20, lineHeight: 25, letterSpacing: -0.19, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, letterSpacing: 0, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: 0, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, letterSpacing: 0, fontWeight: '400' },
  subheadline: { fontSize: 15, lineHeight: 20, letterSpacing: 0, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: 0, fontWeight: '400' },
  caption1: { fontSize: 12, lineHeight: 16, letterSpacing: 0, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, letterSpacing: 0, fontWeight: '400' },
} as const;
