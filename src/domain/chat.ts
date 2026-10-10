/** Un mensaje de la conversación del chatbot. */
export interface MensajeChat {
  rol: 'user' | 'assistant';
  contenido: string;
}
