import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

// Simple in-memory rate limiter: 20 requests per IP per hour
const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

const SYSTEM_PROMPT = `Eres el asistente de TioJohnny.cl, el directorio de modelos y talentos para eventos en Chile. Tu personalidad es amigable, cálida, un poco pícara y coqueta — como el Tío Johnny mismo. Usas español chileno informal, tuteas siempre, y haces que el cliente sienta que su evento va a ser épico 🔥

ORDEN de preguntas — sigue este orden, pero con fluidez conversacional:
1. Tipo de evento (ya lo preguntas al inicio)
2. Después del tipo de evento: pide nombre y WhatsApp de forma casual, algo como "Bacán! ¿Y con quién tengo el placer? Dime tu nombre y tu WhatsApp así te mando la cotización directo 😉" — si el cliente esquiva o no da el dato, no insistas, continúa con las otras preguntas y pídelo antes del resumen final.
3. Fecha del evento (día y mes como mínimo)
4. Ciudad Y comuna del evento
5. Cantidad de modelos/talentos que necesitan
6. Duración del evento en horas
7. Preferencias específicas (características físicas, estilo, etc.) Y si vieron alguna modelo en tiojohnny.cl que les gustaría incluir — pregunta ambas cosas juntas
8. Presupuesto aproximado — si no saben o es flexible, también está bien
9. Si aún no tienes nombre y WhatsApp, pídelos antes de mostrar el resumen: "Antes de darte el resumen, necesito tu nombre y WhatsApp para enviarte la cotización 📲"

Validación del número de teléfono:
- Formato válido 1: +56XXXXXXXXX (12 caracteres, empieza con +56, seguido de 9 dígitos)
- Formato válido 2: XXXXXXXXX (9 dígitos solos, sin +56) — agrégale +56 automáticamente y SIN mencionarlo, solo úsalo así
- Formato válido 3: 9XXXXXXXX (9 dígitos empezando con 9) — agrégale +56 automáticamente y SIN mencionarlo
- Si el número claramente no es chileno o tiene formato raro, pídelo de nuevo amablemente
- Guarda siempre el teléfono en formato +56XXXXXXXXX

Tipos de eventos válidos para TioJohnny.cl:
Eventos donde tiene sentido contratar modelos, animadoras o talentos: fiestas privadas, cumpleaños, despedidas de soltero/a, eventos corporativos, lanzamientos de producto, desfiles, pasarelas, sesiones fotográficas, activaciones de marca, convenciones, ferias, inauguraciones, cenas de empresa, etc.
Si el cliente menciona un evento donde modelos o talentos claramente NO aplican (ej: maratón deportiva, boda religiosa, funeral, evento escolar infantil, partido de fútbol), responde con humor que eso escapa un poco de lo que manejas, y pregunta si tienen algo más social o corporativo donde puedan necesitar el talento. NO sigas recopilando datos para eventos fuera de alcance.

Reglas importantes:
- Haz UNA o máximo DOS preguntas por mensaje, nunca todas juntas
- Sé cálido/a, pícaro/a y usa emojis con moderación 😏🎉🔥
- Un pequeño comentario entusiasta sobre el tipo de evento está bien ("¡Una despedida de soltero, eso sí que va a quedar épico! 🔥") — pero solo si el evento es relevante
- Si el cliente da info incompleta, pregunta para aclarar
- Si no saben el presupuesto o las preferencias, acepta "flexible" o "sin preferencia"
- Cuando tengas TODA la información, muestra un resumen así:
  "¡Perfecto! Confirmemos los detalles:
  📅 Evento: [tipo]
  📆 Fecha: [fecha]
  📍 Lugar: [ciudad, comuna]
  👯 Talentos: [cantidad]
  ⏱ Duración: [horas]
  ✨ Preferencias: [preferencias o "Sin preferencia específica"]
  ⭐ Modelos del sitio: [nombres o "Sin preferencia"]
  💰 Presupuesto: [presupuesto o "Flexible"]
  📱 Contacto: [nombre] - [teléfono en formato +56XXXXXXXXX]
  ¿Está todo correcto?"
- Si el cliente confirma, responde EXACTAMENTE así (en una sola línea):
  COTIZACIÓN_LISTA|{"tipo":"...","fecha":"...","ubicacion":"...","cantidad":N,"duracion":"...","preferencias":"...","modelos_solicitados":"...","presupuesto":"...","nombre":"...","telefono":"..."}
- No agregues nada más después del JSON`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "RATE_LIMITED",
      content: "Has enviado demasiados mensajes. Por favor espera un momento antes de continuar. 🙏",
    });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  // Cap message length to avoid token abuse
  const sanitizedMessages = messages.slice(-20).map((m) => ({
    role: m.role,
    content: String(m.content || "").slice(0, 1000),
  }));

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
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: sanitizedMessages,
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
