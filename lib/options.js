// ============================================================
// Canonical vocabulary for talent profile fields.
// Single source of truth — used by the model portal, the admin
// editor, and the registration form so every entry point can
// only produce the SAME values (no "café" vs "cafés" drift).
// ============================================================

export const COMUNAS = [
  "Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí",
  "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia",
  "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina",
  "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
  "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda",
  "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura",
  "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo",
  "San Miguel", "San Pedro", "Santiago", "Talagante", "Til Til", "Vitacura",
];

export const NATIONALITIES = [
  "Chilena", "Venezolana", "Colombiana", "Peruana", "Argentina", "Brasileña",
  "Ecuatoriana", "Boliviana", "Dominicana", "Haitiana", "Cubana", "Paraguaya",
  "Uruguaya", "Mexicana", "Española", "Otra",
];

export const EYE_COLORS = [
  "Café", "Café claro", "Miel", "Verdes", "Azules", "Grises", "Negros",
];

export const HAIR_COLORS = [
  "Negro", "Castaño", "Castaño claro", "Rubio", "Pelirrojo", "Colorín", "Canoso",
];

// Numeric selects — stored in the same canonical string form the site expects.
function range(from, to, step = 1) {
  const out = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
}

// Height stored like "1.75m" (matches the site's existing format).
export const HEIGHTS = range(145, 195).map((cm) => {
  const m = (cm / 100).toFixed(2);
  return { value: `${m}m`, label: `${m} m` };
});

// Age stored as a plain number string.
export const AGES = range(18, 55).map((n) => ({ value: String(n), label: `${n} años` }));

// Weight stored like "60kg".
export const WEIGHTS = range(45, 95).map((n) => ({ value: `${n}kg`, label: `${n} kg` }));

// ── Matching helpers (preserve/normalize existing free-text data) ──

// Loose normalize: lowercase, strip accents + trailing plural + spaces.
function norm(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/s$/, "");
}

// Try to map a stored value to a canonical option. Accepts an array of
// strings OR {value,label} objects. Returns the canonical value or null.
export function matchOption(value, options) {
  if (value == null || value === "") return null;
  const vals = options.map((o) => (typeof o === "string" ? o : o.value));
  if (vals.includes(value)) return value; // exact
  const nv = norm(value);
  const hit = vals.find((v) => norm(v) === nv);
  return hit || null;
}

// Build the option list to render for a stored value: if the value doesn't
// match any canonical option, prepend it so it's preserved (never silently
// blanked) and the model can switch to a canonical one.
export function optionsForValue(options, value) {
  const objs = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  if (!value) return objs;
  if (matchOption(value, options)) return objs;
  return [{ value, label: `${value} (actual)` }, ...objs];
}
