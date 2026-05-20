import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Eres un asistente de TioJohnny.cl, el directorio de modelos y talentos para eventos en Chile. Tu trabajo es recopilar información sobre el evento del cliente de forma amigable y conversacional, en español chileno informal.

Necesitas recopilar esta información:
1. Tipo de evento (corporativo, despedida de soltero/a, fiesta privada, desfile, sesión fotográfica, otro)
2. Fecha del evento (día y mes como mínimo)
3. Ubicación o ciudad del evento
4. Cantidad de modelos/talentos que necesitan
5. Duración del evento en horas
6. Preferencias específicas (categoría de talento, características, etc.) — si no tienen preferencias está bien
7. Presupuesto aproximado — si no saben o es flexible, también está bien
8. Nombre del cliente y número de WhatsApp para contacto

Reglas importantes:
- Haz UNA o máximo DOS preguntas por mensaje, no todas juntas
- Sé amigable y usa algún emoji ocasionalmente 🎉
- Si el cliente da info incompleta, pregunta para aclarar
- Si no saben el presupuesto o las preferencias, acepta "flexible" o "sin preferencia"
- Cuando tengas TODA la información, muestra un resumen así:
  "¡Perfecto! Confirmemos los detalles:
  📅 Evento: [tipo]
  📆 Fecha: [fecha]
  📍 Lugar: [ubicación]
  👯 Talentos: [cantidad]
  ⏱ Duración: [horas]
  ✨ Preferencias: [preferencias o "Sin preferencia específica"]
  💰 Presupuesto: [presupuesto o "Flexible"]
  📱 Contacto: [nombre] - [teléfono]
  ¿Está todo correcto?"
- Si el cliente confirma, responde EXACTAMENTE así (en una sola línea):
  COTIZACIÓN_LISTA|{"tipo":"...","fecha":"...","ubicacion":"...","cantidad":N,"duracion":"...","preferencias":"...","presupuesto":"...","nombre":"...","telefono":"..."}
- No agregues nada más después del JSON`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "API_KEY_MISSING",
      content: "El agente aún no está configurado. Por favor intenta más tarde. 🙏",
    });
  }

  const client = new Anthropic({ apiKey });

  // Set up SSE headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Try up to 5 times on 529 overloaded — notify client on each retry
  const MAX = 5;
  for (let attempt = 0; attempt < MAX; attempt++) {
    try {
      const stream = client.messages.stream({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20),
      });

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          send({ text: chunk.delta.text });
        }
      }

      send({ done: true });
      res.end();
      return;
    } catch (err) {
      const isOverloaded = err?.status === 529 || err?.error?.error?.type === "overloaded_error";
      if (isOverloaded && attempt < MAX - 1) {
        send({ retrying: attempt + 1 }); // tell client we're retrying
        await sleep(600 + attempt * 400); // 600ms, 1000ms, 1400ms, 1800ms
        continue;
      }
      console.error("Anthropic error:", err);
      send({ error: true });
      res.end();
      return;
    }
  }
}
