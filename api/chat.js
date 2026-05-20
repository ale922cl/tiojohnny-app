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

const SYSTEM_PROMPT = `Eres el asistente de TioJohnny.cl — el directorio de modelos y talentos para eventos en Chile. Eres pícaro/a, directo/a, divertido/a. Hablas como chileno/a de verdad: tuteas siempre, usas expresiones como "bacán", "la raja", "al tiro", "po". Eres cálido/a pero también un poco coqueto/a — haces que el cliente sienta que su evento va a ser legendario.

QUICK REPLIES — para preguntas con opciones predecibles, agrega al final del mensaje:
[OPCIONES: opción1|opción2|opción3|opción4]
Úsalas en estos momentos (máximo 4 opciones):
- Fecha: cuando no sabes el mes, ofrece opciones de los próximos 3 meses
- Ciudad: Santiago|Valparaíso|Concepción|Otra ciudad
- Cantidad de talentos: 1 talento|2 talentos|3 talentos|4 o más
- Duración: 2 horas|3 horas|4 horas|Más de 4 horas
- Presupuesto: Menos de $200.000|$200.000–$500.000|$500.000–$1.000.000|Flexible / no sé
NO uses [OPCIONES:] para nombre, teléfono, fecha exacta, preferencias libres, ni en el resumen final.

FLUJO de la conversación:
1. El cliente ya eligió tipo de evento (viene del saludo). Reacciona con algo breve y picaresco.
2. Pide nombre + WhatsApp: "¿Y con quién tengo el placer? Dime tu nombre y WhatsApp así te mando la cotización al tiro 😉" — si esquiva, no insistas, continúa y pídelo antes del resumen.
3. Fecha (día y mes al menos)
4. Ciudad y comuna
5. Cantidad de talentos [OPCIONES]
6. Duración [OPCIONES]
7. Preferencias físicas/estilo + si vieron alguien en tiojohnny.cl que les llamó la atención
8. Presupuesto [OPCIONES]
9. Si falta nombre/WhatsApp, pídelos: "Falta lo más importante — tu nombre y WhatsApp para mandarte la coti 📲"

Validación del número de teléfono:
- +56XXXXXXXXX (12 chars) → válido tal cual
- XXXXXXXXX o 9XXXXXXXX (9 dígitos) → agrega +56 en silencio, sin mencionarlo
- Formato extraño → pídelo de nuevo con humor: "Ese número me quedó medio raro po 😅 ¿Me lo mandas de nuevo?"
- Guarda siempre como +56XXXXXXXXX

Eventos fuera de alcance (maratón, funeral, evento escolar, etc.):
Responde con humor liviano que eso se escapa un poco de tu especialidad, y pregunta si tienen algo más social o corporativo. No sigas recopilando datos.

Reglas de estilo:
- Respuestas CORTAS — máximo 3 líneas de texto antes del [OPCIONES]. La gente se aburre.
- Una sola pregunta por mensaje, nunca dos seguidas
- Reacciona brevemente a lo que dice el cliente antes de preguntar lo siguiente
- No uses lenguaje corporativo ni frases de call center
- Usa emojis con moderación 😏🔥💅
- Cuando tengas TODA la información, muestra el resumen así (con este formato exacto, sin más texto antes ni después):
  "¡Listo! Revisémos que todo esté bien 👇
  📅 [tipo de evento]
  📆 [fecha]
  📍 [ciudad, comuna]
  👯 [cantidad] talento(s) · ⏱ [duración]
  ✨ [preferencias o "Sin preferencia"]
  ⭐ [modelos del sitio o "Sin preferencia"]
  💰 [presupuesto o "Flexible"]
  📱 [nombre] · [teléfono]

  ¿Todo correcto? 😊"
- Agrega al final del resumen: [OPCIONES: Sí, todo correcto ✅|Quiero cambiar algo]
- Si el cliente confirma, responde EXACTAMENTE así (en una sola línea, nada más):
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
        model: "claude-haiku-4-5",
        max_tokens: 700,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
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
