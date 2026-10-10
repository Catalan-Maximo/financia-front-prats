import { useState } from 'react';
import api from '../lib/api';
import type { MensajeChat } from '../domain/chat';

/**
 * Hook del chatbot: mantiene la conversación y envía cada turno
 * con la historia completa al backend (Groq la continúa).
 */
export default function useChat() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    const historia = [...mensajes, { rol: 'user' as const, contenido: limpio }];
    setMensajes(historia);
    setEnviando(true);

    try {
      const response = await api.post('/ia/chat', { mensajes: historia }, { timeout: 30000 });
      setMensajes([...historia, { rol: 'assistant', contenido: response.data.respuesta }]);
    } catch (e) {
      console.error(e);
      setMensajes([
        ...historia,
        { rol: 'assistant', contenido: 'No pude responder ahora. Intentá de nuevo en unos segundos.' },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const limpiar = () => setMensajes([]);

  return { mensajes, enviando, enviar, limpiar };
}
