/**
 * Sombras estilo iOS. En modo oscuro las sombras negras son invisibles —
 * correcto: iOS dark separa superficies por contraste de fill, no por sombras.
 */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;
