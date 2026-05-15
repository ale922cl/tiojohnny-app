import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, Heart, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Phone, MessageCircle,
  MapPin, Filter, Lock, LogOut, Plus, Trash2, Edit3, Save, Eye, EyeOff,
  ArrowLeft, User, Camera, Settings, Loader2, AlertCircle, Tag, GripVertical, Archive, ArchiveRestore, Share2, Check, Layers, Grid3X3, RotateCcw, Upload, FileSpreadsheet, BarChart3, TrendingUp, Users, Eye as EyeIcon, SlidersHorizontal, Download, Image as ImageIcon, ZoomIn,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";



// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://ktnuedojmitfwoeugefx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnVlZG9qbWl0ZndvZXVnZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjYwMDcsImV4cCI6MjA5MTUwMjAwN30.x85014xsGKhIZji8GU4KqBA-8rPksgSJJBkRSkG4UPE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Categories are now loaded from Supabase (no hardcoded list)

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER SVG (shown when no photos uploaded)
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// STATIC DATA
// ═══════════════════════════════════════════════════════════════════════════════
const COMUNAS_SANTIAGO = [
  "Alhué","Buin","Calera de Tango","Cerrillos","Cerro Navia","Colina","Conchalí",
  "Curacaví","El Bosque","El Monte","Estación Central","Huechuraba","Independencia",
  "Isla de Maipo","La Cisterna","La Florida","La Granja","La Pintana","La Reina",
  "Lampa","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú",
  "María Pinto","Melipilla","Ñuñoa","Padre Hurtado","Paine","Pedro Aguirre Cerda",
  "Peñaflor","Peñalolén","Pirque","Providencia","Pudahuel","Puente Alto","Quilicura",
  "Quinta Normal","Recoleta","Renca","San Bernardo","San Joaquín","San José de Maipo",
  "San Miguel","San Pedro","Santiago","Talagante","Til Til","Vitacura",
];
const NATIONALITIES = [
  "Chilena","Venezolana","Colombiana","Peruana","Argentina","Brasileña",
  "Ecuatoriana","Boliviana","Dominicana","Haitiana","Cubana","Paraguaya",
  "Uruguaya","Mexicana","Española","Otra",
];

const PALETTES = [
  { bg1: "#6d28d9", bg2: "#c084fc", skin: "#d4a574", hair: "#1a0a2e", accent: "#a78bfa", top: "#2d1b69" },
  { bg1: "#1e3a5f", bg2: "#7dd3fc", skin: "#c68642", hair: "#0d0d0d", accent: "#60a5fa", top: "#1e293b" },
  { bg1: "#831843", bg2: "#f9a8d4", skin: "#e0ac69", hair: "#3b0a0a", accent: "#f472b6", top: "#4a0e2b" },
  { bg1: "#064e3b", bg2: "#6ee7b7", skin: "#d4a574", hair: "#1c1c1c", accent: "#34d399", top: "#1b4332" },
  { bg1: "#7c2d12", bg2: "#fdba74", skin: "#c68642", hair: "#2d1600", accent: "#fb923c", top: "#78350f" },
  { bg1: "#3b0764", bg2: "#d8b4fe", skin: "#e0ac69", hair: "#1a0533", accent: "#c084fc", top: "#581c87" },
  { bg1: "#1e3a5f", bg2: "#93c5fd", skin: "#d4a574", hair: "#0a0a0a", accent: "#60a5fa", top: "#0f2942" },
  { bg1: "#701a75", bg2: "#f0abfc", skin: "#c68642", hair: "#1a0a20", accent: "#e879f9", top: "#4a044e" },
];

function generatePlaceholderSvg(id) {
  const p = PALETTES[((id || 1) - 1) % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="400" height="560">
    <defs><linearGradient id="bg${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}"/><stop offset="100%" stop-color="${p.bg2}"/>
    </linearGradient></defs>
    <rect width="200" height="280" fill="url(#bg${id})"/>
    <circle cx="100" cy="100" r="40" fill="${p.skin}" opacity="0.9"/>
    <path d="M58 110 Q60 75 80 68 Q92 63 100 62 Q108 63 120 68 Q140 75 142 110 Q135 90 120 82 Q108 75 100 74 Q92 75 80 82 Q65 90 58 110Z" fill="${p.hair}"/>
    <ellipse cx="100" cy="230" rx="55" ry="40" fill="${p.top}"/>
    <rect x="90" y="145" width="20" height="30" rx="8" fill="${p.skin}" opacity="0.9"/>
    <circle cx="88" cy="100" r="3" fill="#1a1a2e"/><circle cx="112" cy="100" r="3" fill="#1a1a2e"/>
    <path d="M93 115 Q100 120 107 115" stroke="#c27070" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="100" y="260" text-anchor="middle" fill="${p.accent}" font-size="11" font-family="sans-serif" opacity="0.6">Sin foto</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// Serve optimized photo via Supabase image transformation API
// Converts  /storage/v1/object/public/…  →  /storage/v1/render/image/public/…?width=&quality=
function optimizePhotoUrl(url, { width, quality = 75 } = {}) {
  if (!url || !url.includes("/storage/v1/object/public/")) return url;
  const base = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const params = new URLSearchParams({ quality });
  if (width) params.set("width", width);
  return `${base}?${params}`;
}

// Upload a photo to Supabase Storage and return its public URL
async function uploadPhoto(file, talentId) {
  const ext = file.name.split(".").pop();
  const fileName = `${talentId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("talent-photos")
    .upload(fileName, file, { cacheControl: "31536000", upsert: false }); // 1 year — filenames are unique

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("talent-photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Delete a photo from Supabase Storage
async function deletePhoto(url) {
  // Extract the path from the public URL
  const marker = "/talent-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.substring(idx + marker.length);
  await supabase.storage.from("talent-photos").remove([path]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS HELPER
// ═══════════════════════════════════════════════════════════════════════════════
// Persistent visitor ID via cookie (survives refresh, new tabs, etc.)
function getVisitorId() {
  try {
    const match = document.cookie.match(/tj_vid=([^;]+)/);
    if (match) return match[1];
  } catch (_) {}
  const vid = "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  try { document.cookie = "tj_vid=" + vid + ";max-age=31536000;path=/;SameSite=Lax"; } catch (_) {}
  return vid;
}
// Session ID — new per browser session (tab close = new session)
let _sessionId = null;
function getSessionId() {
  if (_sessionId) return _sessionId;
  try { _sessionId = sessionStorage.getItem("tj_sid"); } catch (_) {}
  if (!_sessionId) {
    _sessionId = "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    try { sessionStorage.setItem("tj_sid", _sessionId); } catch (_) {}
  }
  return _sessionId;
}

function getDeviceType() {
  try { return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop"; } catch (_) { return "unknown"; }
}
function trackEvent(eventType, talentId = null, category = null, extra = null) {
  const payload = {
    event_type: eventType,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
  };
  if (talentId) payload.talent_id = talentId;
  if (category) payload.category = category;
  if (extra) payload.extra = extra;
  // Fire and forget — don't block UI
  supabase.from("analytics_events").insert([payload]).then(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION STYLES (injected once)
// ═══════════════════════════════════════════════════════════════════════════════
const ANIM_CSS = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeSlideDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(28px) scale(0.97); }
}
@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes modalSlideDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(100%); }
}
@keyframes heartPop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.5); }
  60%  { transform: scale(0.85); }
  100% { transform: scale(1); }
}
@keyframes heartBurst {
  0%   { opacity: 1; transform: scale(0.3); }
  50%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.6); }
}
@keyframes flyHeart {
  0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
  30%  { opacity: 1; transform: translate(var(--fly-x1), var(--fly-y1)) scale(0.8) rotate(-15deg); }
  70%  { opacity: 0.7; transform: translate(var(--fly-x2), var(--fly-y2)) scale(0.5) rotate(10deg); }
  100% { opacity: 0; transform: translate(var(--fly-x3), var(--fly-y3)) scale(0.2) rotate(0deg); }
}
@keyframes floatUp {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.4); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pillPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes cardPress {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.96); }
  100% { transform: scale(1); }
}
@keyframes favBadgeBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes sparkle {
  0%   { opacity: 0; transform: scale(0) rotate(0deg); }
  50%  { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
}
@keyframes cardStackIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.card-stack-in { animation-name: cardStackIn; animation-duration: 0.35s; animation-timing-function: cubic-bezier(0.22,1,0.36,1); animation-fill-mode: none; }
@keyframes swipeTutorialHand {
  0%   { opacity: 0; transform: translate(0, 20px); }
  15%  { opacity: 1; transform: translate(0, 0); }
  35%  { opacity: 1; transform: translate(60px, -5px) rotate(5deg); }
  50%  { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  70%  { opacity: 1; transform: translate(-60px, -5px) rotate(-5deg); }
  85%  { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(0, 20px); }
}
.swipe-tutorial-hand { animation: swipeTutorialHand 2.5s cubic-bezier(0.4,0,0.2,1) forwards; }
@keyframes kenBurns1 {
  0%   { transform: scale(1.02) translate(0, 0); }
  100% { transform: scale(1.18) translate(-3%, -2%); }
}
@keyframes kenBurns2 {
  0%   { transform: scale(1.02) translate(0, 0); }
  100% { transform: scale(1.16) translate(2%, -3%); }
}
@keyframes kenBurns3 {
  0%   { transform: scale(1.05) translate(-2%, 0); }
  100% { transform: scale(1.2) translate(2%, -2%); }
}
@keyframes spotlightIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes spotlightImgIn {
  0%   { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes counterSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card-enter { animation: fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes heartbeatGlow {
  0%   { box-shadow: 0 0 0 0 rgba(244,63,94,0); outline: 2px solid rgba(244,63,94,0); }
  50%  { box-shadow: 0 0 20px 8px rgba(244,63,94,0.45); outline: 2px solid rgba(244,63,94,0.7); }
  100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); outline: 2px solid rgba(244,63,94,0); }
}
.heartbeat-fav { animation: heartbeatGlow 0.8s ease-in-out 3; outline-offset: 0px; }
@keyframes splashLogo {
  0%   { opacity: 0; transform: scale(0.7); filter: blur(8px); }
  40%  { opacity: 1; transform: scale(1.05); filter: blur(0); }
  60%  { opacity: 1; transform: scale(0.98); filter: blur(0); }
  75%  { opacity: 1; transform: scale(1); filter: blur(0); }
  100% { opacity: 0; transform: scale(1.1); filter: blur(4px); }
}
@keyframes splashFlare {
  0%   { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50%  { opacity: 0.6; transform: scale(1.2) rotate(90deg); }
  100% { opacity: 0; transform: scale(2) rotate(180deg); }
}
@keyframes splashBg {
  0%   { opacity: 1; }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes gridMorphIn {
  from { opacity: 0; transform: scale(0.85) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.grid-morph-in { animation: gridMorphIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes gridMorphOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.85) translateY(-12px); }
}
.grid-morph-out { animation: gridMorphOut 0.2s ease-in both; }
.modal-enter { animation: modalSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
.modal-exit  { animation: modalSlideDown 0.25s cubic-bezier(0.55,0,1,0.45) both; }
@keyframes profileBlurReveal {
  0%   { filter: blur(12px) brightness(0.7); transform: scale(1.06); }
  100% { filter: blur(0) brightness(1); transform: scale(1); }
}
.profile-blur-reveal { animation: profileBlurReveal 0.6s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes profileCrossfade {
  0%   { opacity: 0; transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
.profile-crossfade { animation: profileCrossfade 0.4s ease-out both; }
@keyframes lightboxZoom {
  0%   { transform: scale(1) translate(0, 0); opacity: 0; }
  8%   { opacity: 1; }
  100% { transform: scale(1.08) translate(-1%, -1%); opacity: 1; }
}
.lightbox-zoom { animation: lightboxZoom 10s cubic-bezier(0.25,0,0.75,1) forwards; }
.heart-pop   { animation: heartPop 0.4s cubic-bezier(0.22,1,0.36,1); }
.pill-pop    { animation: pillPop 0.3s cubic-bezier(0.22,1,0.36,1); }
.badge-bounce { animation: favBadgeBounce 0.4s cubic-bezier(0.22,1,0.36,1); }
`;

// Returns UTC ISO string for start/end of a date string ("YYYY-MM-DD") in Santiago timezone
function santiagoDateToUTC(dateStr, boundary = "start") {
  const noon = new Date(dateStr + "T12:00:00Z");
  const santiagoHour = +new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago", hour: "numeric", hour12: false,
  }).format(noon);
  const offsetHours = santiagoHour - 12; // negative for Santiago (UTC-3 / UTC-4)
  const base = boundary === "start" ? "T00:00:00Z" : "T23:59:59Z";
  return new Date(new Date(dateStr + base).getTime() - offsetHours * 3600000).toISOString();
}

// Returns UTC ISO string for start of a day N days ago in Santiago timezone
function santiagoStartOf(daysBack = 0) {
  const d = new Date(Date.now() - daysBack * 86400000);
  const dateStr = d.toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  return santiagoDateToUTC(dateStr, "start");
}

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_ES = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

function DatePicker({ label, value, onChange, maxDate }) {
  const [open, setOpen] = useState(false);
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  const init = value ? new Date(value + "T12:00:00Z") : new Date();
  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const prevMonth = () => viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1);

  const handleDay = (dayStr) => { onChange(dayStr); setOpen(false); };

  const displayDate = value
    ? new Date(value + "T12:00:00Z").toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="flex-1">
      <p className="text-xs mb-1.5 font-semibold" style={{ color: "#7878a0" }}>{label}</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all active:scale-95"
        style={{ background: open ? "rgba(139,92,246,0.15)" : "#1e1e3a", border: `1.5px solid ${open ? "#8B5CF6" : value ? "rgba(139,92,246,0.4)" : "#2a2a4a"}`, color: value ? "#e2e2f0" : "#4a4a6a" }}
      >
        <span>{displayDate || "Seleccionar"}</span>
        <ChevronDown size={14} color={open ? "#8B5CF6" : "#4a4a6a"} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div className="mt-1.5 rounded-2xl p-3 z-10" style={{ background: "#12122a", border: "1px solid #2a2a4a" }}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg active:scale-90" style={{ background: "#1e1e3a" }}>
              <ChevronLeft size={14} color="#8B5CF6" />
            </button>
            <span className="text-xs font-bold text-white">{MONTHS_ES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg active:scale-90" style={{ background: "#1e1e3a" }}>
              <ChevronRight size={14} color="#8B5CF6" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map(d => <div key={d} className="text-center" style={{ fontSize: 9, color: "#4a4a6a" }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayStr = fmt(viewYear, viewMonth, day);
              const isSelected = dayStr === value;
              const isToday = dayStr === todayStr;
              const disabled = dayStr > todayStr || (maxDate && dayStr > maxDate);
              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleDay(dayStr)}
                  className="flex items-center justify-center rounded-lg active:scale-90"
                  style={{
                    aspectRatio: "1", fontSize: 12,
                    background: isSelected ? "#8B5CF6" : "transparent",
                    color: disabled ? "#2a2a4a" : isSelected ? "#fff" : isToday ? "#8B5CF6" : "#d4d4f0",
                    fontWeight: isSelected || isToday ? "bold" : "normal",
                    cursor: disabled ? "default" : "pointer",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <button onClick={() => { onChange(""); setOpen(false); }} className="mt-2 w-full text-xs py-1" style={{ color: "#f43f5e" }}>
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all flex-shrink-0"
      style={{ background: copied ? "rgba(34,197,94,0.15)" : "#2a2a4a", color: copied ? "#22c55e" : "#8B5CF6", border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "transparent"}` }}
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function RegField({ label, required, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: required ? "#e2e2f0" : "#9898b0" }}>
        {label} {required && <span style={{ color: "#f43f5e" }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#f43f5e" }}>{error}</p>}
    </div>
  );
}

let animStyleInjected = false;
function injectAnimStyles() {
  if (animStyleInjected) return;
  const style = document.createElement("style");
  style.textContent = ANIM_CSS;
  document.head.appendChild(style);
  animStyleInjected = true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function TioJohnny() {
  // ─── App state ─────────────────────────────────────────────────────────
  const [view, setView] = useState("public");
  const [talents, setTalents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // ─── Login state ───────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ─── Public state ──────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(null); // which filter dropdown is open: "nationality" | "eyes" | "hair" | null
  const [filterNationality, setFilterNationality] = useState([]); // multi-select
  const [filterEyes, setFilterEyes] = useState([]);               // multi-select
  const [filterHair, setFilterHair] = useState([]);               // multi-select
  const [filterLocation, setFilterLocation] = useState([]);       // multi-select (Comuna)
  const [filterDomicilio, setFilterDomicilio] = useState(false);  // toggle
  const [filterAgeMin, setFilterAgeMin] = useState("");           // dropdown
  const [filterAgeMax, setFilterAgeMax] = useState("");           // dropdown
  const [filterHeightMin, setFilterHeightMin] = useState("");     // dropdown
  const [filterHeightMax, setFilterHeightMax] = useState("");     // dropdown
  const filterDropRef = useRef(null);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [spotlightTalent, setSpotlightTalent] = useState(null);
  const [countersShown, setCountersShown] = useState(false);
  const [counterVals, setCounterVals] = useState({ models: 0, cats: 0, comunas: 0 });
  const [castMode, setCastMode] = useState(false);
  const [castSelected, setCastSelected] = useState(new Set());
  const [castToast, setCastToast] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselKey, setCarouselKey] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [ambientColor, setAmbientColor] = useState("rgba(139,92,246,0.3)");
  const profileScrollRef = useRef(null);
  const profileHeroRef = useRef(null);
  const lightboxTouchX = useRef(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const match = document.cookie.match(/tj_favs=([^;]+)/);
      return match ? JSON.parse(decodeURIComponent(match[1])) : [];
    } catch (_) { return []; }
  });

  // ─── Editor state ──────────────────────────────────────────────────────
  const [editorId, setEditorId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("");
  const [formCategories, setFormCategories] = useState([]);
  const [formRate, setFormRate] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAbout, setFormAbout] = useState("");
  const [formExperience, setFormExperience] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formEyes, setFormEyes] = useState("");
  const [formHair, setFormHair] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formSizes, setFormSizes] = useState("");
  const [formNationality, setFormNationality] = useState("");
  const [formPhotos, setFormPhotos] = useState([]); // array of URLs (already uploaded)
  const [formInstagram, setFormInstagram] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const catDropdownRef = useRef(null);

  // ─── CSV import state ──────────────────────────────────────────────
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]); // parsed rows
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null); // { added: N, errors: N }
  const csvFileRef = useRef(null);

  // ─── Analytics state ───────────────────────────────────────────────
  const [adminTab, setAdminTab] = useState("profiles"); // "profiles" | "pendientes" | "analytics"
  const [promoLoading, setPromoLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState("30");
  const [analyticsCustomFrom, setAnalyticsCustomFrom] = useState("");
  const [analyticsCustomTo, setAnalyticsCustomTo] = useState("");
  const [trendingData, setTrendingData] = useState({}); // { talentId: viewCount (last 7 days) }
  const [shareCardTalent, setShareCardTalent] = useState(null);
  const [statsCardLoading, setStatsCardLoading] = useState(null); // talent id
  const [statsCardToast, setStatsCardToast] = useState(null);     // talent object

  // ─── Swipe mode state ──────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "swipe"
  const [swipeIndex, setSwipeIndex] = useState(0);
  // swipeDelta & swiping removed — drag is now DOM-direct via refs for 60fps
  const [swipeAnim, setSwipeAnim] = useState(null); // "left" | "right" | null
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);
  const swipeTutorialShown = useRef(false);
  const swipeStartRef = useRef(null);
  const SWIPE_THRESHOLD = 80;

  // ─── Animation state ────────────────────────────────────────────────
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [heartPopId, setHeartPopId] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [pillPopCat, setPillPopCat] = useState(null);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [cardAnimKey, setCardAnimKey] = useState(0); // triggers re-entrance animation
  const [heartbeatIds, setHeartbeatIds] = useState([]); // cards doing heartbeat glow
  const favPillRef = useRef(null);

  // ─── Cinematic splash state (disabled) ──────────────────────────────
  const [showSplash, setShowSplash] = useState(false);
  const SPLASH_ENABLED = false;

  // ─── Currency state ────────────────────────────────────────────────
  const [currency, setCurrency] = useState("CLP"); // "CLP" | "USD" | "EUR"
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ CLP: 1, USD: 0, EUR: 0 });

  // ─── Registration form state ───────────────────────────────────────
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regNationality, setRegNationality] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regPhotos, setRegPhotos] = useState([]);
  const [regAbout, setRegAbout] = useState("");
  const [regRate, setRegRate] = useState("");
  const [regHeight, setRegHeight] = useState("");
  const [regWeight, setRegWeight] = useState("");
  const [regEyes, setRegEyes] = useState("");
  const [regHair, setRegHair] = useState("");
  const [regSizes, setRegSizes] = useState("");
  const [regInstagram, setRegInstagram] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regUploading, setRegUploading] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const regFileRef = useRef(null);

  // ─── Pending talents state (admin) ────────────────────────────────
  const [pendingTalents, setPendingTalents] = useState([]);

  // ─── Category morph state ──────────────────────────────────────────
  const [gridMorphing, setGridMorphing] = useState(false);
  const prevCategoryRef = useRef("Todas");

  // ─── Heatmap state ─────────────────────────────────────────────────
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const searchRef = useRef(null);
  const fileRef = useRef(null);

  // Inject CSS animations once
  useEffect(() => { injectAnimStyles(); }, []);

  // ─── Animated entrance counters ───────────────────────────────────────
  const counterAnimRan = useRef(false);
  useEffect(() => {
    if (counterAnimRan.current || talents.length === 0) return;
    counterAnimRan.current = true;
    const activeTalents = talents.filter((t) => !t.archived);
    const totalModels = activeTalents.length;
    const totalCats = [...new Set(activeTalents.flatMap((t) => Array.isArray(t.category) ? t.category : [t.category]).filter(Boolean))].length;
    const totalComunas = [...new Set(activeTalents.map((t) => t.location).filter(Boolean))].length;
    setCountersShown(true);
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounterVals({
        models: Math.round(totalModels * ease),
        cats: Math.round(totalCats * ease),
        comunas: Math.round(totalComunas * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    // Auto-hide after 4 seconds
    setTimeout(() => setCountersShown(false), 4000);
  }, [talents]);

  // ─── Fetch pending + auto-load analytics for analytics-only users ──
  useEffect(() => {
    if (!session) return;
    const role = session.user?.user_metadata?.role;
    const email = session.user?.email;
    if (role === "analytics" || email === "aceitunoafarica@hotmail.com") {
      setAdminTab("analytics");
      fetchAnalytics();
    } else {
      fetchPending();
    }
  }, [session]);

  // ─── Fetch trending data ──────────────────────────────────────────
  const fetchTrending = useCallback(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    supabase.from("analytics_events")
      .select("talent_id")
      .eq("event_type", "profile_view")
      .gte("created_at", weekAgo)
      .then(({ data }) => {
        if (!data) return;
        const counts = {};
        data.forEach((e) => { if (e.talent_id) counts[e.talent_id] = (counts[e.talent_id] || 0) + 1; });
        setTrendingData(counts);
      });
  }, []);

  useEffect(() => {
    if (talents.length) fetchTrending();
  }, [talents]);

  // ─── Splash timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!SPLASH_ENABLED) { setShowSplash(false); return; }
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // ─── Fetch exchange rates ─────────────────────────────────────────
  useEffect(() => {
    // Simple fallback rates — used if API fails or is unreachable
    const fallback = { CLP: 1, USD: 0.00106, EUR: 0.00098 };
    try {
      fetch("https://open.er-api.com/v6/latest/CLP")
        .then((r) => { if (!r.ok) throw new Error("bad"); return r.json(); })
        .then((d) => {
          if (d && d.rates) {
            setExchangeRates({ CLP: 1, USD: d.rates.USD || fallback.USD, EUR: d.rates.EUR || fallback.EUR });
          } else {
            setExchangeRates(fallback);
          }
        })
        .catch(() => setExchangeRates(fallback));
    } catch (_) {
      setExchangeRates(fallback);
    }
  }, []);

  // ─── Currency formatter ───────────────────────────────────────────
  const formatRate = useCallback((rateStr) => {
    try {
      if (!rateStr || currency === "CLP") return rateStr || "";
      const cleaned = String(rateStr).replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      if (isNaN(num)) return rateStr;
      const converted = num * (exchangeRates[currency] || 1);
      const suffix = rateStr.includes("/") ? " / " + rateStr.split("/").pop().trim() : "";
      if (currency === "USD") return "$" + Math.round(converted) + " USD" + suffix;
      if (currency === "EUR") return "€" + Math.round(converted) + suffix;
      return rateStr;
    } catch (_) { return rateStr || ""; }
  }, [currency, exchangeRates]);

  // ─── Magnetic tilt for grid cards (desktop only — skip on touch) ──
  const handleCardPointerMove = useCallback((e) => {
    if (e.pointerType === "touch") return; // skip on mobile — avoid jank
    const card = e.currentTarget;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.03)`;
    card.style.transition = "transform 0.1s ease-out";
  }, []);
  const handleCardPointerLeave = useCallback((e) => {
    const card = e.currentTarget;
    if (!card) return;
    card.style.transform = "";
    card.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)";
  }, []);

  // ─── Load data from Supabase on mount ───────────────────────────────
  useEffect(() => {
    fetchTalents();
    fetchCategories();
    trackEvent("page_view", null, null, JSON.stringify({ device: getDeviceType() }));
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Hash routing: open profile from URL on load + back button ─────
  const talentsRef = useRef([]);
  talentsRef.current = talents;

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash;
      if (hash === "#/registro") { setView("registro"); return; }
      const idMatch = hash.match(/^#\/modelo\/(\d+)$/);
      const slugMatch = !idMatch && hash.match(/^#\/([a-z0-9-]+)$/);
      const found = idMatch
        ? talentsRef.current.find((x) => x.id === parseInt(idMatch[1]))
        : slugMatch
          ? talentsRef.current.find((x) => toSlug(x.name) === slugMatch[1])
          : null;
      if (found && !found.archived && found.status !== "pendiente") {
        setSelectedTalent(found);
        setCarouselIndex(0);
        setView("public");
      } else if (!idMatch && !slugMatch) {
        setSelectedTalent(null);
      }
    };
    // Open on first load (after talents are fetched)
    if (talents.length > 0) openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [talents.length]);

  const fetchTalents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("talents")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data) setTalents(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) setCategories(data);
  };

  // Derived arrays for UI
  const categoryNames = categories.map((c) => c.name);
  const publicCategories = ["Todas", "Favoritas", ...categoryNames];

  // ─── Category management handlers ─────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 1;
    await supabase.from("categories").insert([{ name: newCategoryName.trim(), sort_order: nextOrder }]);
    setNewCategoryName("");
    await fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    await supabase.from("categories").delete().eq("id", id);
    await fetchCategories();
  };

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // ─── Slug helper ──────────────────────────────────────────────────
  const toSlug = (name) => name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ─── Cast mode toggle ─────────────────────────────────────────────
  const toggleCast = (id) => setCastSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Fuzzy search suggestions
  const searchSuggestions = searchQuery.length >= 1 ? (() => {
    const q = searchQuery.toLowerCase();
    const activeTalents = talents.filter((t) => !t.archived);
    const matches = [];
    activeTalents.forEach((t) => {
      // Score: name match is highest, then specialty, location, etc.
      const name = (t.name || "").toLowerCase();
      const spec = (t.specialty || "").toLowerCase();
      const loc = (t.location || "").toLowerCase();
      const nat = (t.nationality || "").toLowerCase();
      if (name.startsWith(q)) matches.push({ t, score: 100, matchField: "nombre" });
      else if (name.includes(q)) matches.push({ t, score: 80, matchField: "nombre" });
      else if (spec.includes(q)) matches.push({ t, score: 60, matchField: "especialidad" });
      else if (loc.includes(q)) matches.push({ t, score: 40, matchField: "ubicación" });
      else if (nat.includes(q)) matches.push({ t, score: 30, matchField: "nacionalidad" });
      else if ((t.hair || "").toLowerCase().includes(q)) matches.push({ t, score: 20, matchField: "cabello" });
      else if ((t.eyes || "").toLowerCase().includes(q)) matches.push({ t, score: 20, matchField: "ojos" });
    });
    return matches.sort((a, b) => b.score - a.score).slice(0, 6);
  })() : [];

  // Close category dropdown on outside click
  useEffect(() => {
    if (!catDropdownOpen) return;
    const handler = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
        setCatSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [catDropdownOpen]);

  // ─── Helpers ───────────────────────────────────────────────────────────
  // raw URL — used for lightbox full-res and canvas/PDF
  const getMainPhoto = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos[0] : generatePlaceholderSvg(t.id);
  };
  // raw URLs — used for lightbox full-res
  const getPhotos = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos : [generatePlaceholderSvg(t.id)];
  };
  // 400px thumbnail — grid cards, leaderboard rows, admin thumbnails
  const getThumb = (t) => optimizePhotoUrl(getMainPhoto(t), { width: 400, quality: 72 });
  // 800px — hero/carousel in profile modal
  const getHeroPhoto = (url) => optimizePhotoUrl(url, { width: 800, quality: 80 });
  // optimized list for carousel (800px each)
  const getCarouselPhotos = (t) => getPhotos(t).map((u) => getHeroPhoto(u));

  const toggleFav = useCallback((id, e) => {
    e.stopPropagation();
    const adding = !favorites.includes(id);
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
    trackEvent(adding ? "favorite" : "unfavorite", id);

    // Heart pop animation on the button
    setHeartPopId(id);
    setTimeout(() => setHeartPopId(null), 450);

    if (adding) {
      // Heartbeat glow on the card
      setHeartbeatIds((prev) => [...prev, id]);
      setTimeout(() => setHeartbeatIds((prev) => prev.filter((x) => x !== id)), 3600);
      // Bounce the favorites badge
      setBadgeBounce(true);
      setTimeout(() => setBadgeBounce(false), 450);

      // Spawn floating hearts from click position
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Get Favoritas pill position for fly target
      const favRect = favPillRef.current?.getBoundingClientRect();
      const tx = favRect ? favRect.left + favRect.width / 2 : window.innerWidth / 2;
      const ty = favRect ? favRect.top + favRect.height / 2 : 60;

      const newHearts = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        tx, ty,
        delay: i * 0.06,
        size: 12 + Math.random() * 10,
        color: ["#f43f5e", "#ec4899", "#f472b6", "#fb7185", "#ff6b9d", "#e11d48"][i],
      }));
      setFloatingHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((n) => n.id === h.id)));
      }, 1200);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      document.cookie = "tj_favs=" + encodeURIComponent(JSON.stringify(favorites)) + ";max-age=31536000;path=/;SameSite=Lax";
    } catch (_) {}
  }, [favorites]);

  // Helper: get categories array from a talent (supports old string format + new array format)
  const getTalentCategories = (t) => {
    if (Array.isArray(t.category)) return t.category;
    if (typeof t.category === "string" && t.category) return [t.category];
    return [];
  };

  const hasActiveFilters = !!(filterNationality.length || filterAgeMin || filterAgeMax || filterHeightMin || filterHeightMax || filterEyes.length || filterHair.length || filterLocation.length || filterDomicilio);
  const clearAllFilters = () => { setFilterNationality([]); setFilterAgeMin(""); setFilterAgeMax(""); setFilterHeightMin(""); setFilterHeightMax(""); setFilterEyes([]); setFilterHair([]); setFilterLocation([]); setFilterDomicilio(false); };

  // Close filter dropdowns on outside click
  useEffect(() => {
    if (!filterDropOpen) return;
    const handler = (e) => { if (filterDropRef.current && !filterDropRef.current.contains(e.target)) setFilterDropOpen(null); };
    document.addEventListener("mousedown", handler); document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [filterDropOpen]);
  const toggleFilter = (arr, setArr, val) => setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  // Parse numeric value from a string like "1.75m", "175cm", "24 años", "58kg"
  const parseNum = (v) => { if (!v) return null; const m = v.match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };

  // Collect unique values from all non-archived talents for filter options
  const allNonArchived = talents.filter((t) => !t.archived);
  const uniqueVals = (field) => [...new Set(allNonArchived.map((t) => (t[field] || "").trim()).filter(Boolean))].sort();
  const filterOptions = {
    nationality: uniqueVals("nationality"),
    eyes: uniqueVals("eyes"),
    hair: uniqueVals("hair"),
    location: uniqueVals("location"),
  };
  // ─── Smart search (NLP filter parsing) ───────────────────────────
  const parseSmartSearch = useCallback((query) => {
    const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const hairMap = { rubia: "Rubio", rubio: "Rubio", morocha: "Castaño", morena: "Moreno", moreno: "Moreno", castana: "Castaño", castaño: "Castaño", pelirroja: "Rojo", peliroja: "Rojo", negra: "Negro", negro: "Negro" };
    const eyeMap = { cafe: "Café", marron: "Café", verde: "Verde", azul: "Azul", miel: "Miel", negros: "Negro", oscuros: "Negro" };
    const isAlta = /\b(alta|altas|alto)\b/.test(q);
    const isBaja = /\b(baja|bajas|bajo)\b/.test(q);
    let detectedHair = null, detectedEyes = null, detectedLocation = null;
    for (const [keyword, value] of Object.entries(hairMap)) {
      if (q.includes(keyword) && filterOptions.hair.some(h => h.toLowerCase() === value.toLowerCase())) {
        detectedHair = filterOptions.hair.find(h => h.toLowerCase() === value.toLowerCase());
        break;
      }
    }
    for (const [keyword, value] of Object.entries(eyeMap)) {
      if (q.includes(keyword) && filterOptions.eyes.some(e => e.toLowerCase() === value.toLowerCase())) {
        detectedEyes = filterOptions.eyes.find(e => e.toLowerCase() === value.toLowerCase());
        break;
      }
    }
    for (const loc of filterOptions.location) {
      const locSlug = loc.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (q.includes(locSlug)) { detectedLocation = loc; break; }
    }
    let heightMin = null, heightMax = null;
    if (isAlta) heightMin = "1.70";
    if (isBaja) heightMax = "1.65";
    return { detectedHair, detectedEyes, detectedLocation, heightMin, heightMax };
  }, [filterOptions]);

  // Auto-apply smart filters when query looks like natural language
  useEffect(() => {
    if (searchQuery.trim().split(/\s+/).length < 2) return;
    const { detectedHair, detectedEyes, detectedLocation, heightMin, heightMax } = parseSmartSearch(searchQuery);
    if (detectedHair) setFilterHair([detectedHair]);
    if (detectedEyes) setFilterEyes([detectedEyes]);
    if (detectedLocation) setFilterLocation([detectedLocation]);
    if (heightMin) setFilterHeightMin(heightMin);
    if (heightMax) setFilterHeightMax(heightMax);
  }, [searchQuery]);

  // Collect unique ages and heights for range dropdowns
  const allAges = [...new Set(allNonArchived.map((t) => parseNum(t.age)).filter((a) => a !== null && a > 0))].sort((a, b) => a - b);
  const allHeights = [...new Set(allNonArchived.map((t) => { let h = parseNum(t.height); if (h && h > 100) h = h / 100; return h; }).filter((h) => h !== null && h > 0))].sort((a, b) => a - b);

  const filtered = talents.filter((t) => {
    if (t.archived) return false;
    if (t.status === "pendiente") return false;
    const talentCats = getTalentCategories(t);
    const matchCat = activeCategory === "Todas" || (activeCategory === "Favoritas" ? favorites.includes(t.id) : talentCats.includes(activeCategory));
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.specialty || "").toLowerCase().includes(q) || (t.location || "").toLowerCase().includes(q) || (t.nationality || "").toLowerCase().includes(q) || (t.hair || "").toLowerCase().includes(q) || (t.eyes || "").toLowerCase().includes(q);
    if (!matchCat || !matchSearch) return false;
    // Advanced filters (multi-select: match any selected)
    if (filterNationality.length && !filterNationality.some((v) => (t.nationality || "").toLowerCase() === v.toLowerCase())) return false;
    if (filterEyes.length && !filterEyes.some((v) => (t.eyes || "").toLowerCase() === v.toLowerCase())) return false;
    if (filterHair.length && !filterHair.some((v) => (t.hair || "").toLowerCase() === v.toLowerCase())) return false;
    if (filterLocation.length && !filterLocation.some((v) => (t.location || "").toLowerCase() === v.toLowerCase())) return false;
    if (filterDomicilio && !getTalentCategories(t).some((c) => c.toLowerCase() === "domicilio")) return false;
    if (filterAgeMin || filterAgeMax) {
      const age = parseNum(t.age);
      if (age === null) return false;
      if (filterAgeMin && age < parseFloat(filterAgeMin)) return false;
      if (filterAgeMax && age > parseFloat(filterAgeMax)) return false;
    }
    if (filterHeightMin || filterHeightMax) {
      let h = parseNum(t.height);
      if (h === null) return false;
      if (h > 100) h = h / 100;
      if (filterHeightMin && h < parseFloat(filterHeightMin)) return false;
      if (filterHeightMax && h > parseFloat(filterHeightMax)) return false;
    }
    return true;
  });

  // ─── Auth handlers ─────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos"
        : error.message);
    } else {
      setSession(data.session);
      setView("admin");
      const role = data.session?.user?.user_metadata?.role;
      const email = data.session?.user?.email;
      if (role === "analytics" || email === "aceitunoafarica@hotmail.com") setAdminTab("analytics");
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setView("public");
  };

  // ─── Editor handlers ──────────────────────────────────────────────────
  const openEditor = (talent) => {
    if (talent) {
      setEditorId(talent.id);
      setFormName(talent.name || "");
      setFormSpecialty(talent.specialty || "");
      setFormCategories(Array.isArray(talent.category) ? talent.category : (talent.category ? [talent.category] : []));
      setFormRate(talent.rate || "");
      setFormPhone(talent.phone || "");
      setFormLocation(talent.location || "");
      setFormAbout(talent.about || "");
      setFormExperience(talent.experience || "");
      setFormHeight(talent.height || "");
      setFormWeight(talent.weight || "");
      setFormEyes(talent.eyes || "");
      setFormHair(talent.hair || "");
      setFormAge(talent.age || "");
      setFormSizes(talent.sizes || "");
      setFormNationality(talent.nationality || "");
      setFormPhotos(talent.photos || []);
      setFormInstagram(talent.instagram || "");
    } else {
      setEditorId(null);
      setFormName(""); setFormSpecialty(""); setFormCategories([]);
      setFormRate(""); setFormPhone(""); setFormLocation("");
      setFormAbout(""); setFormExperience("");
      setFormHeight(""); setFormWeight(""); setFormEyes("");
      setFormHair(""); setFormAge(""); setFormSizes("");
      setFormNationality("");
      setFormPhotos([]); setFormInstagram("");
    }
    setView("editor");
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    // Use a temp ID for new profiles
    const tempId = editorId || "new_" + Date.now();

    for (const file of files) {
      try {
        const url = await uploadPhoto(file, tempId);
        setFormPhotos((prev) => [...prev, url]);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    if (e.target) e.target.value = "";
  };

  const removeFormPhoto = async (index) => {
    const url = formPhotos[index];
    // Delete from storage
    try { await deletePhoto(url); } catch (e) { console.error(e); }
    setFormPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Field auto-formatters (run onBlur) ───────────────────────────────
  const fmtRate = (v) => {
    const raw = v.replace(/[$.\s]/g, "").replace(/\/hr.*/i, "").trim();
    const n = parseInt(raw, 10);
    if (!raw || isNaN(n)) return v;
    const formatted = n.toLocaleString("es-CL"); // e.g. 80.000
    return `$${formatted} /hr`;
  };
  const fmtPhone = (v) => {
    const stripped = v.trim();
    if (!stripped) return stripped;
    if (stripped.startsWith("+")) return stripped;
    const digits = stripped.replace(/\D/g, "");
    if (digits.startsWith("56")) return `+${digits}`;
    return `+56${digits}`;
  };
  const fmtInstagram = (v) => {
    const stripped = v.trim();
    if (!stripped) return stripped;
    return stripped.startsWith("@") ? stripped : `@${stripped}`;
  };
  const fmtHeight = (v) => {
    const stripped = v.trim();
    if (!stripped || /[a-zA-Z]/.test(stripped)) return stripped; // already has unit
    const n = parseFloat(stripped);
    if (isNaN(n)) return stripped;
    const meters = n >= 100 ? n / 100 : n; // 175 → 1.75
    return `${meters.toFixed(2).replace(/\.?0+$/, "")}m`;
  };
  const fmtWeight = (v) => {
    const stripped = v.trim();
    if (!stripped || /[a-zA-Z]/.test(stripped)) return stripped;
    const n = parseFloat(stripped);
    if (isNaN(n)) return stripped;
    return `${n}kg`;
  };
  const fmtAge = (v) => {
    const digits = v.replace(/\D/g, "");
    return digits;
  };

  const handleSaveProfile = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    const profileData = {
      name: formName,
      specialty: formSpecialty,
      category: formCategories,
      rate: formRate,
      phone: formPhone,
      location: formLocation,
      about: formAbout,
      experience: formExperience,
      height: formHeight,
      weight: formWeight,
      eyes: formEyes,
      hair: formHair,
      age: formAge,
      sizes: formSizes,
      nationality: formNationality,
      photos: formPhotos,
      instagram: formInstagram,
    };

    if (editorId) {
      // Update existing
      await supabase.from("talents").update(profileData).eq("id", editorId);
    } else {
      // Insert new — place at the end
      const maxOrder = talents.length > 0 ? Math.max(...talents.map((t) => t.sort_order ?? 0)) : 0;
      await supabase.from("talents").insert([{ ...profileData, sort_order: maxOrder + 1 }]);
    }

    await fetchTalents();
    setSaving(false);
    setView("admin");
  };

  const handleArchive = async (id, archived) => {
    await supabase.from("talents").update({ archived }).eq("id", id);
    await fetchTalents();
  };

  // ─── Delete confirm state ──────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ─── Reorder talents (swap sort_order with neighbor) ──────────────
  const [reordering, setReordering] = useState(false);
  const handleReorder = async (id, direction) => {
    if (reordering) return;
    setReordering(true);
    // Work with active talents only (they're already sorted)
    const active = talents.filter((t) => !t.archived);
    const idx = active.findIndex((t) => t.id === id);
    const swapIdx = idx + direction; // -1 = up, +1 = down
    if (swapIdx < 0 || swapIdx >= active.length) { setReordering(false); return; }

    const a = active[idx];
    const b = active[swapIdx];
    // Swap their sort_order values
    const orderA = a.sort_order ?? idx;
    const orderB = b.sort_order ?? swapIdx;

    await Promise.all([
      supabase.from("talents").update({ sort_order: orderB }).eq("id", a.id),
      supabase.from("talents").update({ sort_order: orderA }).eq("id", b.id),
    ]);
    await fetchTalents();
    setReordering(false);
  };

  const handleDelete = async (id) => {
    // Delete photos from storage first
    const talent = talents.find((t) => t.id === id);
    if (talent?.photos) {
      for (const url of talent.photos) {
        try { await deletePhoto(url); } catch (e) { console.error(e); }
      }
    }
    await supabase.from("talents").delete().eq("id", id);
    await fetchTalents();
  };

  // ─── Pending talent handlers ───────────────────────────────────────
  const fetchPending = async () => {
    const { data, error } = await supabase.from("talents").select("*").eq("status", "pendiente");
    if (!error && data) setPendingTalents(data);
  };

  const handleApprove = async (id) => {
    await supabase.from("talents").update({ status: "active" }).eq("id", id);
    await fetchTalents();
    await fetchPending();
  };

  const handleReject = async (id) => {
    const t = pendingTalents.find((x) => x.id === id);
    if (t?.photos) {
      for (const url of t.photos) {
        try { await deletePhoto(url); } catch (e) { console.error(e); }
      }
    }
    await supabase.from("talents").delete().eq("id", id);
    await fetchPending();
  };

  // ─── Registration form handlers ────────────────────────────────────
  const handleRegPhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setRegUploading(true);
    const tempId = "reg_" + Date.now();
    for (const file of files) {
      try {
        const url = await uploadPhoto(file, tempId);
        setRegPhotos((prev) => [...prev, url]);
      } catch (err) { console.error(err); }
    }
    setRegUploading(false);
    if (e.target) e.target.value = "";
  };

  const handleRegSubmit = async () => {
    const errors = {};
    if (!regPhotos.length) errors.photos = "Agrega al menos 1 foto";
    if (!regName.trim()) errors.name = "El nombre es obligatorio";
    if (!regLocation) errors.location = "Selecciona tu comuna";
    if (!regAge.trim()) errors.age = "La edad es obligatoria";
    if (!regNationality) errors.nationality = "Selecciona tu nacionalidad";
    if (!regPhone.trim()) errors.phone = "El teléfono es obligatorio";
    if (!regRate.trim()) errors.rate = "La tarifa es obligatoria";
    if (Object.keys(errors).length) { setRegErrors(errors); return; }
    setRegErrors({});
    setRegSubmitting(true);
    const maxOrder = talents.length > 0 ? Math.max(...talents.map((t) => t.sort_order ?? 0)) : 0;
    await supabase.from("talents").insert([{
      name: regName.trim(),
      phone: fmtPhone(regPhone),
      age: regAge.trim(),
      nationality: regNationality,
      location: regLocation,
      photos: regPhotos,
      about: regAbout.trim(),
      rate: regRate.trim() ? fmtRate(regRate) : "",
      height: regHeight.trim() ? fmtHeight(regHeight) : "",
      weight: regWeight.trim() ? fmtWeight(regWeight) : "",
      eyes: regEyes.trim(),
      hair: regHair.trim(),
      sizes: regSizes.trim(),
      instagram: regInstagram.trim() ? fmtInstagram(regInstagram) : "",
      specialty: regSpecialty.trim(),
      status: "pendiente",
      sort_order: maxOrder + 1,
      archived: false,
    }]);
    setRegSubmitting(false);
    setRegSuccess(true);
  };

  // ─── CSV Import handlers ───────────────────────────────────────────
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    // Parse header
    const parseRow = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };
    const headers = parseRow(lines[0]).map((h) => h.toLowerCase().trim());
    return lines.slice(1).map((line) => {
      const vals = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return obj;
    });
  };

  // Map CSV columns to talent fields (flexible naming)
  const mapCsvToProfile = (row) => {
    const get = (...keys) => {
      for (const k of keys) {
        const val = row[k] || row[k.toLowerCase()];
        if (val) return val;
      }
      return "";
    };
    return {
      name: get("name", "nombre", "nombre completo"),
      specialty: get("specialty", "especialidad", "especiality"),
      category: (get("category", "categoría", "categorias", "categorías", "categories") || "").split(/[;|,]/).map((s) => s.trim()).filter(Boolean),
      rate: get("rate", "tarifa", "precio"),
      phone: get("phone", "teléfono", "telefono", "celular", "whatsapp"),
      location: get("location", "ubicación", "ubicacion", "ciudad"),
      about: get("about", "sobre", "descripción", "descripcion", "bio"),
      experience: get("experience", "experiencia", "servicios", "services"),
      height: get("height", "altura"),
      weight: get("weight", "peso"),
      eyes: get("eyes", "ojos"),
      hair: get("hair", "cabello", "pelo"),
      age: get("age", "edad"),
      sizes: get("sizes", "talla", "tallas"),
      nationality: get("nationality", "nacionalidad", "pais", "país"),
      instagram: get("instagram", "ig", "insta"),
      photos: [],
      archived: false,
    };
  };

  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setCsvPreview(rows);
      setCsvResult(null);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleCsvImport = async () => {
    if (csvPreview.length === 0) return;
    setCsvImporting(true);
    const maxOrder = talents.length > 0 ? Math.max(...talents.map((t) => t.sort_order ?? 0)) : 0;
    let added = 0;
    let errors = 0;
    for (let i = 0; i < csvPreview.length; i++) {
      const profile = mapCsvToProfile(csvPreview[i]);
      if (!profile.name) { errors++; continue; }
      profile.sort_order = maxOrder + 1 + i;
      const { error } = await supabase.from("talents").insert([profile]);
      if (error) { errors++; console.error(error); } else { added++; }
    }
    await fetchTalents();
    setCsvImporting(false);
    setCsvResult({ added, errors });
    setCsvPreview([]);
  };

  // ─── Analytics data fetch ──────────────────────────────────────────
  const fetchAnalytics = async (range, customFrom, customTo) => {
    const r = range !== undefined ? range : analyticsRange;
    const cf = customFrom !== undefined ? customFrom : analyticsCustomFrom;
    const ct = customTo !== undefined ? customTo : analyticsCustomTo;
    setAnalyticsLoading(true);
    const now = new Date();
    const todayStart = santiagoStartOf(0);
    const weekAgo   = santiagoStartOf(7);
    const monthAgo  = santiagoStartOf(30);

    let query = supabase.from("analytics_events").select("*").order("created_at", { ascending: false });
    if (r === "30") query = query.gte("created_at", monthAgo);
    else if (r === "custom" && cf) {
      query = query.gte("created_at", santiagoDateToUTC(cf, "start"));
      if (ct) query = query.lte("created_at", santiagoDateToUTC(ct, "end"));
    }
    // r === "all": no date filter

    const { data: events } = await query;

    if (!events) { setAnalyticsLoading(false); return; }

    // ── Unique REAL visitors (by visitor_id cookie, falls back to session_id for old data) ──
    const getVid = (e) => e.visitor_id || e.session_id;
    const allVisitors = new Set(events.map(getVid));
    const todayVisitors = new Set(events.filter((e) => e.created_at >= todayStart).map(getVid));
    const weekVisitors = new Set(events.filter((e) => e.created_at >= weekAgo).map(getVid));

    // Page views (sessions, not refreshes — count unique sessions)
    const pageViews = events.filter((e) => e.event_type === "page_view");
    const todaySessions = new Set(pageViews.filter((e) => e.created_at >= todayStart).map((e) => e.session_id)).size;
    const weekSessions = new Set(pageViews.filter((e) => e.created_at >= weekAgo).map((e) => e.session_id)).size;
    const monthSessions = new Set(pageViews.map((e) => e.session_id)).size;

    // Profile views — top 10
    const profileViews = events.filter((e) => e.event_type === "profile_view" && e.talent_id);
    const viewCounts = {};
    profileViews.forEach((e) => { viewCounts[e.talent_id] = (viewCounts[e.talent_id] || 0) + 1; });
    const topViewed = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // ── Combined Favorites (grid hearts + pasarela swipe_like) — top 10 ──
    const allFavEvents = events.filter((e) => (e.event_type === "favorite" || e.event_type === "swipe_like") && e.talent_id);
    const favCounts = {};
    allFavEvents.forEach((e) => { favCounts[e.talent_id] = (favCounts[e.talent_id] || 0) + 1; });
    const topFavorited = Object.entries(favCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Shares — top 10
    const shareEvents = events.filter((e) => e.event_type === "share" && e.talent_id);
    const shareCounts = {};
    shareEvents.forEach((e) => { shareCounts[e.talent_id] = (shareCounts[e.talent_id] || 0) + 1; });
    const topShared = Object.entries(shareCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Contacts per talent (whatsapp + call + instagram) — top 10
    const contactEvents = events.filter((e) => ["contact_whatsapp", "contact_call", "contact_instagram"].includes(e.event_type) && e.talent_id);
    const contactByTalent = {};
    contactEvents.forEach((e) => {
      if (!contactByTalent[e.talent_id]) contactByTalent[e.talent_id] = { whatsapp: 0, call: 0, instagram: 0 };
      if (e.event_type === "contact_whatsapp") contactByTalent[e.talent_id].whatsapp++;
      else if (e.event_type === "contact_call") contactByTalent[e.talent_id].call++;
      else if (e.event_type === "contact_instagram") contactByTalent[e.talent_id].instagram++;
    });
    const topContacted = Object.entries(contactByTalent)
      .map(([tid, c]) => [tid, c.whatsapp + c.call + c.instagram, c])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Pasarela stats
    const swipeLikes = events.filter((e) => e.event_type === "swipe_like").length;
    const swipeSkips = events.filter((e) => e.event_type === "swipe_skip").length;
    const swipeTotal = swipeLikes + swipeSkips;

    // Popular categories
    const catEvents = events.filter((e) => e.event_type === "category_view" && e.category);
    const catCounts = {};
    catEvents.forEach((e) => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
    const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Daily visitors (last 7 days) — by real visitor_id
    const dailyVisitors = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dayStr = d.toISOString().slice(0, 10);
      const dayVids = new Set(events.filter((e) => e.created_at.slice(0, 10) === dayStr).map(getVid));
      dailyVisitors.push({ day: d.toLocaleDateString("es-CL", { weekday: "short" }), count: dayVids.size });
    }

    // ── NEW METRICS ──

    // Device breakdown (mobile vs desktop)
    const deviceEvents = pageViews.filter((e) => e.extra);
    let mobileCount = 0, desktopCount = 0;
    deviceEvents.forEach((e) => {
      try { const d = typeof e.extra === "string" ? JSON.parse(e.extra) : e.extra; if (d.device === "mobile") mobileCount++; else desktopCount++; } catch (_) {}
    });

    // Engagement rate — % of visitors who viewed at least one profile
    const visitorsWhoViewedProfile = new Set(profileViews.map(getVid));
    const engagementRate = allVisitors.size > 0 ? Math.round((visitorsWhoViewedProfile.size / allVisitors.size) * 100) : 0;

    // Average profiles viewed per visitor
    const avgProfilesPerVisitor = allVisitors.size > 0 ? (profileViews.length / allVisitors.size).toFixed(1) : "0";

    // Bounce rate — visitors with only page_view events (no profile_view, no favorite, no swipe)
    const interactiveTypes = new Set(["profile_view", "favorite", "swipe_like", "swipe_skip", "share", "contact_whatsapp", "contact_call", "contact_instagram"]);
    const interactedVisitors = new Set(events.filter((e) => interactiveTypes.has(e.event_type)).map(getVid));
    const bounceRate = allVisitors.size > 0 ? Math.round(((allVisitors.size - interactedVisitors.size) / allVisitors.size) * 100) : 0;

    // Return visitors — visitors seen on more than one distinct day
    const visitorDays = {};
    events.forEach((e) => {
      const vid = getVid(e);
      const day = e.created_at.slice(0, 10);
      if (!visitorDays[vid]) visitorDays[vid] = new Set();
      visitorDays[vid].add(day);
    });
    const returnVisitors = Object.values(visitorDays).filter((days) => days.size > 1).length;

    // Contact clicks
    const contactWa = events.filter((e) => e.event_type === "contact_whatsapp").length;
    const contactCall = events.filter((e) => e.event_type === "contact_call").length;
    const contactIg = events.filter((e) => e.event_type === "contact_instagram").length;

    // Peak hours (0-23)
    const hourCounts = new Array(24).fill(0);
    events.forEach((e) => {
      try { const h = new Date(e.created_at).getHours(); hourCounts[h]++; } catch (_) {}
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    setAnalyticsData({
      visitors: { today: todayVisitors.size, week: weekVisitors.size, month: allVisitors.size },
      sessions: { today: todaySessions, week: weekSessions, month: monthSessions },
      topViewed, topFavorited, topShared, topContacted, contactByTalent,
      pasarela: { likes: swipeLikes, skips: swipeSkips, total: swipeTotal },
      topCategories,
      dailyVisitors,
      totalEvents: events.length,
      devices: { mobile: mobileCount, desktop: desktopCount },
      engagementRate,
      avgProfilesPerVisitor,
      bounceRate,
      returnVisitors,
      contacts: { whatsapp: contactWa, call: contactCall, instagram: contactIg, total: contactWa + contactCall + contactIg },
      peakHour,
      hourCounts,
      fetchedRange: r,
      fetchedFrom: cf,
      fetchedTo: ct,
    });
    setAnalyticsLoading(false);
  };

  // ─── Stats card generator (per-talent WhatsApp image) ─────────────
  const generateStatsCard = async (t) => {
    setStatsCardLoading(t.id);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const [{ count: totalViews }, { count: favCount }, { count: contactCount }, { count: weekViewsCount }] = await Promise.all([
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "profile_view").eq("talent_id", t.id),
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).in("event_type", ["favorite", "swipe_like"]).eq("talent_id", t.id),
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).in("event_type", ["contact_whatsapp", "contact_call", "contact_instagram"]).eq("talent_id", t.id),
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "profile_view").eq("talent_id", t.id).gte("created_at", weekAgo),
    ]);
    const wv = weekViewsCount || 0;
    const weekRank = Object.entries(trendingData).filter(([, v]) => v > wv).length + 1;
    const total = activeTalents.length;

    const W = 800, H = 960;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const rr = (x, y, w, h, r, fill) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    };

    // Background
    ctx.fillStyle = "#12122a"; ctx.fillRect(0, 0, W, H);

    // Header gradient band
    const hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, "#1a0a3e"); hg.addColorStop(0.5, "#2d1b69"); hg.addColorStop(1, "#1a0a3e");
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 110);

    // Wordmark
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#8B5CF6"; ctx.textAlign = "left";
    ctx.fillText("Tio", 44, 70);
    const tw = ctx.measureText("Tio").width;
    ctx.fillStyle = "#e2e2f0";
    ctx.fillText("Johnny", 44 + tw, 70);
    const jw = ctx.measureText("Johnny").width;
    ctx.font = "bold 24px Arial"; ctx.fillStyle = "#5a5a7a";
    ctx.fillText(".cl", 44 + tw + jw, 70);
    ctx.font = "16px Arial"; ctx.fillStyle = "#7878a0"; ctx.textAlign = "right";
    ctx.fillText("Reporte semanal", W - 44, 70);

    // Circular photo
    const PR = 84, PX = W / 2, PY = 230;
    ctx.beginPath(); ctx.arc(PX, PY, PR + 5, 0, Math.PI * 2);
    ctx.fillStyle = "#8B5CF6"; ctx.fill();
    const photoUrl = getMainPhoto(t);
    await new Promise((res) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save(); ctx.beginPath(); ctx.arc(PX, PY, PR, 0, Math.PI * 2); ctx.clip();
        const sc = Math.max((PR * 2) / img.width, (PR * 2) / img.height);
        const sw = (PR * 2) / sc, sh = (PR * 2) / sc;
        ctx.drawImage(img, (img.width - sw) / 2, 0, sw, sh, PX - PR, PY - PR, PR * 2, PR * 2);
        ctx.restore(); res();
      };
      img.onerror = res; img.src = photoUrl;
    });

    // Name + specialty
    ctx.font = "bold 34px Arial"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
    ctx.fillText(t.name, W / 2, PY + PR + 46);
    if (t.specialty) { ctx.font = "20px Arial"; ctx.fillStyle = "#8B5CF6"; ctx.fillText(t.specialty, W / 2, PY + PR + 76); }

    // Divider
    ctx.strokeStyle = "rgba(139,92,246,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(44, 400); ctx.lineTo(W - 44, 400); ctx.stroke();
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#5a5a7a"; ctx.textAlign = "center";
    ctx.fillText("ESTA SEMANA", W / 2, 424);

    // 3 stat tiles
    const tiles = [
      { v: wv, label: "Vistas", emoji: "👁" },
      { v: favCount || 0, label: "Favoritas", emoji: "❤️" },
      { v: contactCount || 0, label: "Contactos", emoji: "💬" },
    ];
    const tW = 210, tH = 118, gap = (W - 88 - tW * 3) / 2;
    tiles.forEach((tile, i) => {
      const tx = 44 + i * (tW + gap);
      rr(tx, 440, tW, tH, 18, "#1e1e3a");
      ctx.font = "28px Arial"; ctx.textAlign = "center";
      ctx.fillText(tile.emoji, tx + tW / 2, 484);
      ctx.font = "bold 32px Arial"; ctx.fillStyle = "#8B5CF6";
      ctx.fillText(String(tile.v), tx + tW / 2, 524);
      ctx.font = "14px Arial"; ctx.fillStyle = "#7878a0";
      ctx.fillText(tile.label, tx + tW / 2, 548);
    });

    // Ranking tile
    rr(44, 580, W - 88, 82, 18, "#1e1e3a");
    ctx.font = "bold 16px Arial"; ctx.fillStyle = "#7878a0"; ctx.textAlign = "left";
    ctx.fillText("Ranking esta semana", 80, 608);
    ctx.font = "bold 26px Arial"; ctx.fillStyle = wv > 0 ? "#fb923c" : "#4a4a6a"; ctx.textAlign = "right";
    ctx.fillText(wv > 0 ? `🔥 #${weekRank} de ${total}` : "Sin vistas aún", W - 80, 646);

    // Total historical tile
    rr(44, 682, W - 88, 72, 18, "#1e1e3a");
    ctx.font = "16px Arial"; ctx.fillStyle = "#7878a0"; ctx.textAlign = "left";
    ctx.fillText("Total histórico", 80, 706);
    ctx.font = "bold 24px Arial"; ctx.fillStyle = "#e2e2f0";
    ctx.fillText(`${totalViews || 0} vistas en total`, 80, 738);

    // Motivational quote
    ctx.font = "italic 19px Arial"; ctx.fillStyle = "#7878a0"; ctx.textAlign = "center";
    const quote = wv >= 5 ? "¡Tu perfil está generando resultados increíbles! 🚀"
      : wv >= 2 ? "Tu perfil está creciendo semana a semana ✨"
      : "Sigue activa — tu audiencia te está esperando 💜";
    ctx.fillText(quote, W / 2, 800);

    // Footer
    ctx.fillStyle = "#0d0d1e"; ctx.fillRect(0, H - 100, W, 100);
    ctx.font = "14px Arial"; ctx.fillStyle = "#5a5a7a"; ctx.textAlign = "center";
    ctx.fillText("El catálogo de talentos para eventos", W / 2, H - 62);
    ctx.font = "bold 24px Arial"; ctx.fillStyle = "#8B5CF6";
    ctx.fillText("tiojohnny.cl", W / 2, H - 28);

    const link = document.createElement("a");
    link.download = `stats-${toSlug(t.name)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setStatsCardLoading(null);
    if (t.phone) { setStatsCardToast(t); setTimeout(() => setStatsCardToast(null), 7000); }
  };

  // ─── Heatmap / Attention Map data ──────────────────────────────────
  const fetchHeatmap = async () => {
    setHeatmapLoading(true);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: events } = await supabase
      .from("analytics_events")
      .select("event_type, talent_id")
      .gte("created_at", monthAgo);
    if (!events) { setHeatmapLoading(false); return; }
    // Group by talent: count profile_view, share, favorite, swipe_like per talent
    const map = {};
    events.forEach((e) => {
      if (!e.talent_id) return;
      if (!map[e.talent_id]) map[e.talent_id] = { views: 0, favs: 0, shares: 0, likes: 0 };
      if (e.event_type === "profile_view") map[e.talent_id].views++;
      if (e.event_type === "favorite") map[e.talent_id].favs++;
      if (e.event_type === "share") map[e.talent_id].shares++;
      if (e.event_type === "swipe_like") map[e.talent_id].likes++;
    });
    setHeatmapData(map);
    setHeatmapLoading(false);
  };

  // Animated category switching with morph transition
  const switchCategory = useCallback((cat) => {
    if (cat === prevCategoryRef.current) return;
    setGridMorphing(true); // trigger exit animation
    setTimeout(() => {
      prevCategoryRef.current = cat;
      setActiveCategory(cat);
      setCardAnimKey((k) => k + 1);
      setGridMorphing(false); // trigger enter animation
    }, 200); // matches gridMorphOut duration
    setPillPopCat(cat);
    setTimeout(() => setPillPopCat(null), 350);
    trackEvent("category_view", null, cat);
  }, []);

  // ─── Ambient color extraction from image ──────────────────────────
  const extractAmbientColor = useCallback((imgSrc) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 50; canvas.height = 50;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, 50, 50);
          const data = ctx.getImageData(0, 0, 50, 50).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 16) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          // Boost saturation slightly for a more vivid glow
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max - min > 20) {
            setAmbientColor(`rgba(${r},${g},${b},0.45)`);
          } else {
            setAmbientColor("rgba(139,92,246,0.3)"); // fallback to violet
          }
        } catch (_) { setAmbientColor("rgba(139,92,246,0.3)"); }
      };
      img.onerror = () => setAmbientColor("rgba(139,92,246,0.3)");
      img.src = imgSrc;
    } catch (_) { setAmbientColor("rgba(139,92,246,0.3)"); }
  }, []);

  // ─── Parallax scroll handler for profile hero ────────────────────
  const handleProfileScroll = useCallback(() => {
    const scrollEl = profileScrollRef.current;
    const heroEl = profileHeroRef.current;
    if (!scrollEl || !heroEl) return;
    const scrollY = scrollEl.scrollTop;
    const img = heroEl.querySelector("img");
    if (img) {
      img.style.transform = `translateY(${scrollY * 0.35}px) scale(1.05)`;
    }
  }, []);

  // Open profile with URL update
  const openProfile = useCallback((t) => {
    setSelectedTalent(t);
    setCarouselIndex(0);
    setCarouselKey((k) => k + 1);
    setAmbientColor("rgba(139,92,246,0.3)");
    // Extract ambient color from main photo
    const mainImg = getMainPhoto(t);
    if (mainImg) extractAmbientColor(mainImg);
    // Eagerly preload first two carousel photos
    const photos = t.photos || [];
    photos.slice(0, 2).forEach((url) => { const i = new Image(); i.src = getHeroPhoto(url); });
    window.history.pushState(null, "", `#/${toSlug(t.name)}`);
    trackEvent("profile_view", t.id);
  }, [extractAmbientColor]);

  // Animated modal close
  const closeDetail = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedTalent(null);
      setModalClosing(false);
      window.history.pushState(null, "", window.location.pathname);
      fetchTrending();
    }, 250);
  }, [fetchTrending]);

  // ─── Swipe mode handlers (DOM-direct for 60fps) ─────────────────────
  useEffect(() => { setSwipeIndex(0); }, [activeCategory, searchQuery]);

  const lastPosRef = useRef({ x: 0, time: 0 });
  const dragXRef = useRef(0); // live drag x, NOT in state
  const swipingLockRef = useRef(false); // prevents double-fire of doSwipe

  // Long-press detection for spotlight mode
  const longPressTimerRef = useRef(null);
  const didLongPressRef = useRef(false);
  const lastTapRef = useRef(null);    // for double-tap-to-favorite
  const openTimerRef = useRef(null);  // delayed open after single tap
  const pointerDownRef = useRef(false); // true while finger/pointer is pressed
  const heroTouchX = useRef(null);    // carousel swipe touch tracking
  const makeLongPress = (t) => ({
    onPointerDown: () => {
      if (castMode) return;
      pointerDownRef.current = true;
      didLongPressRef.current = false;
      longPressTimerRef.current = setTimeout(() => { didLongPressRef.current = true; setSpotlightTalent(t); }, 400);
    },
    onPointerUp: (e) => {
      clearTimeout(longPressTimerRef.current);
      pointerDownRef.current = false;
      if (didLongPressRef.current || castMode) return;
      const now = Date.now();
      if (lastTapRef.current?.id === t.id && now - lastTapRef.current.time < 320) {
        // Double tap — favorite without opening
        clearTimeout(openTimerRef.current);
        lastTapRef.current = null;
        toggleFav(t.id, e);
      } else {
        lastTapRef.current = { id: t.id, time: now };
        openTimerRef.current = setTimeout(() => { lastTapRef.current = null; openProfile(t); }, 260);
      }
    },
    // onPointerLeave fires after onPointerUp on mobile — only cancel if pointer is still pressed (drag off)
    onPointerLeave: () => {
      if (pointerDownRef.current) {
        clearTimeout(longPressTimerRef.current);
        clearTimeout(openTimerRef.current);
        lastTapRef.current = null;
        pointerDownRef.current = false;
      }
    },
    onPointerCancel: () => {
      clearTimeout(longPressTimerRef.current);
      clearTimeout(openTimerRef.current);
      lastTapRef.current = null;
      pointerDownRef.current = false;
    },
  });
  const swipeCardRef = useRef(null);
  const swipeBackRef = useRef(null);
  const swipeThirdRef = useRef(null);
  const swipeLikeRef = useRef(null);
  const swipeNopeRef = useRef(null);
  const swipeGlowRef = useRef(null);

  // Apply drag position directly to DOM (no React re-render)
  const applyDrag = (dx) => {
    dragXRef.current = dx;
    const card = swipeCardRef.current;
    if (card) {
      card.style.transition = "none";
      card.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg)`;
    }
    const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);
    // Back card
    const back = swipeBackRef.current;
    if (back) {
      back.style.transition = "none";
      back.style.transform = `scale(${0.93 + progress * 0.07}) translateY(${12 - progress * 12}px)`;
      back.style.opacity = 0.5 + progress * 0.5;
    }
    // Third card
    const third = swipeThirdRef.current;
    if (third) {
      third.style.transition = "none";
      third.style.transform = `scale(${0.86 + progress * 0.04}) translateY(${24 - progress * 8}px)`;
      third.style.opacity = 0.25 + progress * 0.15;
    }
    // Glow
    const glow = swipeGlowRef.current;
    if (glow) {
      if (dx > 15) {
        glow.style.background = `linear-gradient(135deg, rgba(34,197,94,${Math.min(progress * 0.25, 0.25)}) 0%, transparent 60%)`;
      } else if (dx < -15) {
        glow.style.background = `linear-gradient(225deg, rgba(244,63,94,${Math.min(progress * 0.25, 0.25)}) 0%, transparent 60%)`;
      } else {
        glow.style.background = "none";
      }
    }
    // LIKE / NOPE stamps
    const like = swipeLikeRef.current;
    if (like) {
      if (dx > 20) {
        like.style.display = "block";
        like.style.opacity = Math.min(progress * 1.2, 1);
        like.style.transform = `rotate(-15deg) scale(${0.8 + progress * 0.2})`;
      } else {
        like.style.display = "none";
      }
    }
    const nope = swipeNopeRef.current;
    if (nope) {
      if (dx < -20) {
        nope.style.display = "block";
        nope.style.opacity = Math.min(progress * 1.2, 1);
        nope.style.transform = `rotate(15deg) scale(${0.8 + progress * 0.2})`;
      } else {
        nope.style.display = "none";
      }
    }
  };

  const handleSwipeTouchStart = (e) => {
    if (swipingLockRef.current) return;
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    lastPosRef.current = { x: touch.clientX, time: Date.now() };
    dragXRef.current = 0;
  };
  const handleSwipeTouchMove = (e) => {
    if (!swipeStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - swipeStartRef.current.x;
    lastPosRef.current = { x: touch.clientX, time: Date.now() };
    applyDrag(dx);
  };
  const handleSwipeTouchEnd = () => {
    if (!swipeStartRef.current) return;
    resolveSwipe();
    swipeStartRef.current = null;
  };

  const handleSwipeMouseDown = (e) => {
    if (swipingLockRef.current) return;
    e.preventDefault();
    swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastPosRef.current = { x: e.clientX, time: Date.now() };
    dragXRef.current = 0;

    const handleMouseMove = (ev) => {
      if (!swipeStartRef.current) return;
      const dx = ev.clientX - swipeStartRef.current.x;
      lastPosRef.current = { x: ev.clientX, time: Date.now() };
      applyDrag(dx);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      resolveSwipe();
      swipeStartRef.current = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resolveSwipe = () => {
    const dx = dragXRef.current;
    const elapsed = Date.now() - (swipeStartRef.current?.time || Date.now());
    const velocity = elapsed > 0 ? Math.abs(dx) / elapsed * 1000 : 0;
    const shouldTrigger = Math.abs(dx) > SWIPE_THRESHOLD || (Math.abs(dx) > 30 && velocity > 500);
    if (shouldTrigger) {
      doSwipe(dx > 0 ? "right" : "left");
    } else {
      // Snap back with transition
      const card = swipeCardRef.current;
      if (card) { card.style.transition = "transform 0.3s cubic-bezier(0.22,1,0.36,1)"; card.style.transform = "translateX(0) rotate(0deg)"; }
      const back = swipeBackRef.current;
      if (back) { back.style.transition = "all 0.3s cubic-bezier(0.22,1,0.36,1)"; back.style.transform = "scale(0.93) translateY(12px)"; back.style.opacity = "0.5"; }
      const third = swipeThirdRef.current;
      if (third) { third.style.transition = "all 0.3s cubic-bezier(0.22,1,0.36,1)"; third.style.transform = "scale(0.86) translateY(24px)"; third.style.opacity = "0.25"; }
      const glow = swipeGlowRef.current;
      if (glow) glow.style.background = "none";
      const like = swipeLikeRef.current; if (like) like.style.display = "none";
      const nope = swipeNopeRef.current; if (nope) nope.style.display = "none";
      dragXRef.current = 0;
    }
  };

  const doSwipe = (dir) => {
    // Prevent double-fire (touchend + synthetic click, rapid calls, etc.)
    if (swipingLockRef.current) return;
    swipingLockRef.current = true;

    const flyX = dir === "right" ? window.innerWidth * 1.3 : -window.innerWidth * 1.3;
    setSwipeAnim(dir);
    // Animate card off-screen via DOM
    const card = swipeCardRef.current;
    if (card) {
      card.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out";
      card.style.transform = `translateX(${flyX}px) rotate(${dir === "right" ? 25 : -25}deg)`;
      card.style.opacity = "0";
    }
    // Back card snaps to front position
    const back = swipeBackRef.current;
    if (back) { back.style.transition = "all 0.2s ease-out"; back.style.transform = "scale(1) translateY(0)"; back.style.opacity = "1"; }
    const third = swipeThirdRef.current;
    if (third) { third.style.transition = "all 0.2s ease-out"; third.style.transform = "scale(0.93) translateY(12px)"; third.style.opacity = "0.5"; }

    const currentTalent = filtered[swipeIndex];
    if (currentTalent) trackEvent(dir === "right" ? "swipe_like" : "swipe_skip", currentTalent.id);
    if (dir === "right" && currentTalent) {
      // Use functional update to avoid stale-state duplicates
      setFavorites((prev) => prev.includes(currentTalent.id) ? prev : [...prev, currentTalent.id]);
      setBadgeBounce(true);
      setTimeout(() => setBadgeBounce(false), 450);
    }
    setTimeout(() => {
      setSwipeAnim(null);
      dragXRef.current = 0;
      setSwipeIndex((i) => Math.min(i + 1, filtered.length));
      swipingLockRef.current = false;
    }, 250);
  };

  const undoSwipe = () => {
    if (swipeIndex > 0) setSwipeIndex((i) => i - 1);
  };

  // Animate new card entrance via ref, then remove class so it doesn't block inline transforms
  useEffect(() => {
    const card = swipeCardRef.current;
    if (!card) return;
    card.classList.add("card-stack-in");
    const onEnd = () => { card.classList.remove("card-stack-in"); card.style.transform = ""; card.style.opacity = ""; };
    card.addEventListener("animationend", onEnd, { once: true });
    // Safety fallback in case animationend doesn't fire
    const timer = setTimeout(onEnd, 400);
    return () => { clearTimeout(timer); card.removeEventListener("animationend", onEnd); };
  }, [swipeIndex]);

  // ─── Share handler ──────────────────────────────────────────────────
  const [shareConfirm, setShareConfirm] = useState(null); // talent id that just got "copied" feedback
  const handleShare = useCallback(async (t, e) => {
    if (e) e.stopPropagation();
    trackEvent("share", t.id);
    const url = `${window.location.origin}${window.location.pathname}#/${toSlug(t.name)}`;
    const shareData = {
      title: `${t.name} — TioJohnny.cl`,
      text: `${t.name} · ${t.specialty}`,
      url,
    };
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareConfirm(t.id);
        setTimeout(() => setShareConfirm(null), 1800);
      }
    } catch (err) {
      // User cancelled share sheet — no-op
      if (err.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          setShareConfirm(t.id);
          setTimeout(() => setShareConfirm(null), 1800);
        } catch (_) {}
      }
    }
  }, []);

  // ─── Tarjeta Pro PDF Generator ──────────────────────────────────
  const [compCardLoading, setCompCardLoading] = useState(false);
  const generateCompCard = useCallback(async (t) => {
    setCompCardLoading(true);
    try {
      // Standard business card: 90mm × 55mm landscape
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [55, 90] });
      const W = 90, H = 55;

      // ── Elegant dark background with subtle gradient feel ──
      doc.setFillColor(15, 15, 35);
      doc.rect(0, 0, W, H, "F");

      // Accent stripe — thin violet line at top
      doc.setFillColor(139, 92, 246);
      doc.rect(0, 0, W, 1.2, "F");

      // ── Left side: Photo (cropped square) ──
      const photoW = 22, photoH = 28;
      const photoX = 4, photoY = 5;
      const mainImg = getMainPhoto(t);
      try {
        const imgResp = await fetch(mainImg);
        const blob = await imgResp.blob();
        const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
        // Rounded-corner photo area with background
        doc.setFillColor(30, 30, 58);
        doc.roundedRect(photoX - 0.5, photoY - 0.5, photoW + 1, photoH + 1, 1.5, 1.5, "F");
        doc.addImage(dataUrl, "JPEG", photoX, photoY, photoW, photoH, undefined, "MEDIUM");
      } catch (_) {
        doc.setFillColor(30, 30, 58);
        doc.roundedRect(photoX - 0.5, photoY - 0.5, photoW + 1, photoH + 1, 1.5, 1.5, "F");
        doc.setTextColor(100, 100, 140);
        doc.setFontSize(7);
        doc.text("Foto", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
      }

      // ── Right side: Name & info ──
      const infoX = 30;

      // Name — large, white, bold feel
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const nameText = t.name || "Modelo";
      doc.text(nameText, infoX, 7.5);

      // Specialty — violet accent
      doc.setTextColor(139, 92, 246);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(t.specialty || "Modelo / Actriz", infoX, 11.5);

      // Thin divider
      doc.setDrawColor(60, 60, 100);
      doc.setLineWidth(0.2);
      doc.line(infoX, 13.5, W - 4, 13.5);

      // Key stats — compact two-column layout
      const statsData = [
        t.location && ["\u{1F4CD}", t.location],
        t.nationality && ["\u{1F30E}", t.nationality],
        t.height && ["\u{1F4CF}", t.height],
        t.age && ["\u{1F382}", t.age + " años"],
      ].filter(Boolean);

      doc.setFontSize(5.5);
      let statY = 16.5;
      statsData.forEach(([icon, val]) => {
        doc.setTextColor(120, 120, 160);
        doc.text(icon, infoX, statY);
        doc.setTextColor(210, 210, 230);
        doc.text(String(val), infoX + 5, statY);
        statY += 3.8;
      });

      // ── Bottom section ──
      // Contact info — bottom left under photo
      doc.setFontSize(5);
      let contactY = 37;
      if (t.phone) {
        doc.setTextColor(139, 92, 246);
        doc.text("\u260E", 4, contactY);
        doc.setTextColor(200, 200, 220);
        doc.text(t.phone, 8, contactY);
        contactY += 3.5;
      }
      if (t.instagram) {
        doc.setTextColor(225, 48, 108);
        doc.text("@", 4, contactY);
        doc.setTextColor(200, 200, 220);
        doc.text(t.instagram.replace("@", ""), 8, contactY);
        contactY += 3.5;
      }

      // Rate — if available
      if (t.rate) {
        doc.setTextColor(139, 92, 246);
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "bold");
        doc.text(t.rate, 4, contactY + 1);
        doc.setFont("helvetica", "normal");
      }

      // ── QR Code — bottom right corner ──
      const profileUrl = `${window.location.origin}${window.location.pathname}#/${toSlug(t.name)}`;
      const qrSize = 16;
      const qrX = W - qrSize - 3, qrY = H - qrSize - 6;
      try {
        const qrDataUrl = await QRCode.toDataURL(profileUrl, { width: 200, margin: 1, color: { dark: "#8B5CF6", light: "#0f0f23" } });
        // QR background pad
        doc.setFillColor(20, 20, 45);
        doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "F");
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (_) {}

      // "Ver perfil" label under QR
      doc.setTextColor(100, 100, 140);
      doc.setFontSize(3.5);
      doc.text("Ver perfil", qrX + qrSize / 2, qrY + qrSize + 2.5, { align: "center" });

      // ── Branding — bottom accent bar + logo ──
      doc.setFillColor(139, 92, 246);
      doc.rect(0, H - 1.2, W, 1.2, "F");
      doc.setTextColor(100, 100, 140);
      doc.setFontSize(3.8);
      doc.text("TioJohnny.cl", W / 2, H - 2, { align: "center" });

      // Save
      doc.save(`${(t.name || "modelo").replace(/\s+/g, "_")}_TarjetaPro.pdf`);
      trackEvent("tarjeta_pro_download", t.id);
    } catch (err) {
      console.error("Comp card error:", err);
    }
    setCompCardLoading(false);
  }, []);

  // ─── Share Card (poster image download) ─────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const generateShareCard = useCallback(async (t) => {
    const W = 600, H = 1060;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // ── Background ──
    ctx.fillStyle = "#12122a";
    ctx.fillRect(0, 0, W, H);

    // ── Photo (top 58%) ──
    const photoH = 620;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = getMainPhoto(t); });
      // cover-fit: fill width, crop height from top
      const aspect = img.naturalWidth / img.naturalHeight;
      const drawW = W;
      const drawH = drawW / aspect;
      ctx.drawImage(img, 0, 0, drawW, Math.max(drawH, photoH));
    } catch (_) {}

    // Gradient over photo bottom
    const grad = ctx.createLinearGradient(0, photoH - 220, 0, photoH);
    grad.addColorStop(0, "rgba(18,18,42,0)");
    grad.addColorStop(1, "#12122a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, photoH - 220, W, 220);

    // ── Name ──
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Arial";
    ctx.fillText(t.name, 36, photoH - 90);

    // ── Specialty · Rate ──
    ctx.fillStyle = "#8B5CF6";
    ctx.font = "bold 22px Arial";
    const specialtyLine = [t.specialty, formatRate(t.rate)].filter(Boolean).join("  ·  ");
    ctx.fillText(specialtyLine, 36, photoH - 54);

    // ── Location ──
    if (t.location) {
      ctx.fillStyle = "#9898b0";
      ctx.font = "19px Arial";
      ctx.fillText(`📍 ${t.location}`, 36, photoH - 22);
    }

    // ── Stats grid ──
    const stats = [
      { label: "Edad", value: t.age },
      { label: "Altura", value: t.height },
      { label: "Peso", value: t.weight },
      { label: "Ojos", value: t.eyes },
      { label: "Cabello", value: t.hair },
      { label: "Talla", value: t.sizes },
      { label: "Nacionalidad", value: t.nationality },
    ].filter((s) => s.value);

    const cols = 3;
    const cellW = (W - 72) / cols;
    const cellH = 72;
    const gridTop = photoH + 16;

    stats.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 36 + col * cellW;
      const y = gridTop + row * cellH;

      // Cell bg
      ctx.fillStyle = "#1e1e3a";
      roundRect(ctx, x, y, cellW - 8, cellH - 8, 10);
      ctx.fill();

      // Label
      ctx.fillStyle = "#7878a0";
      ctx.font = "11px Arial";
      ctx.fillText(s.label.toUpperCase(), x + 12, y + 22);

      // Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 17px Arial";
      ctx.fillText(s.value, x + 12, y + 46);
    });

    // ── Divider ──
    const divY = gridTop + (Math.ceil(stats.length / cols)) * cellH + 10;
    ctx.strokeStyle = "rgba(139,92,246,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(36, divY); ctx.lineTo(W - 36, divY); ctx.stroke();

    // ── Branding ──
    const brandY = divY + 36;
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#8B5CF6";
    ctx.fillText("Tio", 36, brandY);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Johnny", 36 + ctx.measureText("Tio").width, brandY);
    ctx.fillStyle = "#4a4a6a";
    ctx.font = "20px Arial";
    ctx.fillText(".cl", 36 + ctx.measureText("TioJohnny").width + 2, brandY);

    // ── URL ──
    const slug = toSlug(t.name);
    ctx.fillStyle = "#4a4a6a";
    ctx.font = "15px Arial";
    ctx.fillText(`tiojohnny.cl/#/${slug}`, 36, brandY + 28);

    // ── Download ──
    const link = document.createElement("a");
    link.download = `${slug}-tiojohnny.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [formatRate, getMainPhoto]);


  // ─── Drag-to-reorder photos ───────────────────────────────────────
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (idx) => {
    setDragIdx(idx);
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (idx !== dragOverIdx) setDragOverIdx(idx);
  };
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    setFormPhotos((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // Touch-based reorder (mobile)
  const [touchDragIdx, setTouchDragIdx] = useState(null);
  const movePhoto = (from, to) => {
    if (to < 0 || to >= formPhotos.length) return;
    setFormPhotos((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  // Split talents into active / archived / pending for admin
  const activeTalents = talents.filter((t) => !t.archived && t.status !== "pendiente");
  const archivedTalents = talents.filter((t) => t.archived && t.status !== "pendiente");
  const pendingForAdmin = pendingTalents; // from separate fetch

  // ─── Shared styles ────────────────────────────────────────────────────
  const inputStyle = { background: "#12122a", border: "1px solid #2a2a4a" };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: LOADING
  // ═════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#12122a" }}>
        <div className="text-center">
          <Loader2 size={32} color="#8B5CF6" className="animate-spin mx-auto" />
          <p className="text-sm mt-3" style={{ color: "#7878a0" }}>Cargando talentos...</p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: LOGIN
  // ═════════════════════════════════════════════════════════════════════════
  if (view === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#12122a" }}>
        <div className="w-full max-w-sm rounded-3xl p-8" style={{ background: "#1e1e3a" }}>
          <button onClick={() => setView("public")} className="mb-4">
            <ArrowLeft size={20} color="#8B5CF6" />
          </button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#8B5CF6" }}>
              <Lock size={28} color="#fff" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs mt-1" style={{ color: "#7878a0" }}>Solo acceso autorizado</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Email</label>
              <input type="email" value={loginEmail} onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="tu@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Contraseña</label>
              <div className="relative">
                <input type={loginShowPass ? "text" : "password"} value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none pr-12" style={inputStyle} placeholder="••••••••" onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }} />
                <button type="button" onClick={() => setLoginShowPass(!loginShowPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {loginShowPass ? <EyeOff size={16} color="#7878a0" /> : <Eye size={16} color="#7878a0" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg" style={{ color: "#f43f5e", background: "rgba(244,63,94,0.1)" }}>
                <AlertCircle size={14} /> {loginError}
              </div>
            )}
            <button onClick={handleLogin} disabled={loginLoading} className="w-full py-3 rounded-xl font-bold text-white text-sm transition-transform active:scale-95 flex items-center justify-center gap-2" style={{ background: "#8B5CF6", opacity: loginLoading ? 0.7 : 1 }}>
              {loginLoading && <Loader2 size={16} className="animate-spin" />}
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: EDITOR
  // ═════════════════════════════════════════════════════════════════════════
  if (view === "editor") {
    return (
      <div className="min-h-screen" style={{ background: "#12122a", color: "#fff" }}>
        <div className="overflow-y-auto px-4 pb-8">
          <div className="flex items-center justify-between py-4 sticky top-0 z-10" style={{ background: "#12122a" }}>
            <button onClick={() => setView("admin")} className="flex items-center gap-2 text-sm" style={{ color: "#8B5CF6" }}>
              <ArrowLeft size={18} /> Volver
            </button>
            <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white text-sm transition-transform active:scale-95" style={{ background: "#8B5CF6", opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>

          <h2 className="text-lg font-bold text-white mb-5">
            {editorId ? "Editar Perfil" : "Nuevo Perfil"}
          </h2>

          {/* Photo Upload with drag-to-reorder */}
          <div className="mb-6">
            <label className="text-xs font-medium mb-2 block" style={{ color: "#9898b0" }}>Fotos del perfil</label>
            <div className="flex gap-3 flex-wrap">
              {formPhotos.map((photo, i) => (
                <div
                  key={photo}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  className="relative rounded-xl overflow-hidden transition-all"
                  style={{
                    width: 72,
                    height: 96,
                    opacity: dragIdx === i ? 0.4 : 1,
                    transform: dragOverIdx === i && dragIdx !== i ? "scale(1.08)" : "scale(1)",
                    outline: dragOverIdx === i && dragIdx !== i ? "2px solid #8B5CF6" : "none",
                    outlineOffset: 2,
                    cursor: "grab",
                  }}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover pointer-events-none" />
                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 p-0.5 rounded" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <GripVertical size={10} color="#fff" />
                  </div>
                  {/* Delete */}
                  <button onClick={(e) => { e.stopPropagation(); removeFormPhoto(i); }} className="absolute top-1 right-1 p-1 rounded-full" style={{ background: "rgba(244,63,94,0.9)" }}>
                    <X size={10} color="#fff" />
                  </button>
                  {/* Move arrows for mobile */}
                  {formPhotos.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 py-0.5" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <button onClick={(e) => { e.stopPropagation(); movePhoto(i, i - 1); }} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }}>
                        <ChevronLeft size={12} color="#fff" />
                      </button>
                      <span className="text-white" style={{ fontSize: 8 }}>{i === 0 ? "PRINCIPAL" : i + 1}</span>
                      <button onClick={(e) => { e.stopPropagation(); movePhoto(i, i + 1); }} disabled={i === formPhotos.length - 1} style={{ opacity: i === formPhotos.length - 1 ? 0.3 : 1 }}>
                        <ChevronRight size={12} color="#fff" />
                      </button>
                    </div>
                  )}
                  {i === 0 && formPhotos.length <= 1 && (
                    <div className="absolute bottom-0 left-0 right-0 text-center py-0.5 text-white" style={{ background: "#8B5CF6", fontSize: 8 }}>PRINCIPAL</div>
                  )}
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95" style={{ width: 72, height: 96, border: "2px dashed #2a2a4a", color: "#7878a0" }}>
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                <span style={{ fontSize: 9 }}>{uploading ? "Subiendo..." : "Subir"}</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            <p className="text-xs mt-2" style={{ color: "#4a4a6a" }}>Arrastra las fotos para reordenar. La primera es la principal. En móvil usa las flechas.</p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Nombre completo</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Ej: Valentina Rojas" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Especialidad</label>
              <input value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Fashion Model" />
            </div>
            <div ref={catDropdownRef} className="relative">
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Categorías</label>
              {/* Selected tags */}
              <button
                type="button"
                onClick={() => { setCatDropdownOpen((o) => !o); setCatSearch(""); }}
                className="w-full px-4 py-3 rounded-xl text-sm text-left outline-none flex items-center gap-2 flex-wrap min-h-[44px]"
                style={{ ...inputStyle, color: "#fff" }}
              >
                {formCategories.length === 0 && <span style={{ color: "#4a4a6a" }}>Seleccionar categorías...</span>}
                {formCategories.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "#8B5CF6" }}>
                    {c}
                    <span
                      onClick={(e) => { e.stopPropagation(); setFormCategories((prev) => prev.filter((x) => x !== c)); }}
                      className="cursor-pointer ml-0.5"
                      style={{ opacity: 0.7 }}
                    >&times;</span>
                  </span>
                ))}
                <ChevronDown size={14} color="#7878a0" className="ml-auto flex-shrink-0" style={{ transform: catDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {/* Dropdown */}
              {catDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-20" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a", maxHeight: 240, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  {/* Search */}
                  <div className="px-3 py-2" style={{ borderBottom: "1px solid #2a2a4a" }}>
                    <input
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      placeholder="Buscar categoría..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-600"
                      autoFocus
                    />
                  </div>
                  {/* Options */}
                  <div className="overflow-y-auto" style={{ maxHeight: 192 }}>
                    {categoryNames
                      .filter((c) => !catSearch || c.toLowerCase().includes(catSearch.toLowerCase()))
                      .map((c) => {
                        const checked = formCategories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormCategories((prev) => checked ? prev.filter((x) => x !== c) : [...prev, c])}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                            style={{ color: checked ? "#fff" : "#9898b0", background: checked ? "rgba(139,92,246,0.15)" : "transparent" }}
                          >
                            <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center" style={{ border: checked ? "none" : "1.5px solid #4a4a6a", background: checked ? "#8B5CF6" : "transparent" }}>
                              {checked && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                            {c}
                          </button>
                        );
                      })}
                    {categoryNames.filter((c) => !catSearch || c.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                      <p className="px-4 py-3 text-xs" style={{ color: "#4a4a6a" }}>No se encontraron categorías</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Tarifa</label>
                <input value={formRate} onChange={(e) => setFormRate(e.target.value)} onBlur={() => setFormRate(fmtRate(formRate))} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="$80.000 /hr" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Teléfono</label>
                <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} onBlur={() => setFormPhone(fmtPhone(formPhone))} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="+56912345678" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Ubicación (Comuna)</label>
                <select value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                  <option value="">Selecciona...</option>
                  {COMUNAS_SANTIAGO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Instagram (opcional)</label>
                <input value={formInstagram} onChange={(e) => setFormInstagram(e.target.value)} onBlur={() => setFormInstagram(fmtInstagram(formInstagram))} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="@valentina.rojas" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Sobre (descripción)</label>
              <textarea value={formAbout} onChange={(e) => setFormAbout(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none" style={inputStyle} placeholder="Describe la trayectoria y especialidad..." />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Servicios (uno por línea)</label>
              <textarea value={formExperience} onChange={(e) => setFormExperience(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none" style={inputStyle} placeholder={"Sesión fotográfica\nEvento corporativo\nDesfile de moda"} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "#8B5CF6" }}>Medidas / Stats</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: formHeight, set: setFormHeight, fmt: fmtHeight, label: "Altura", ph: "1.75m" },
                  { val: formWeight, set: setFormWeight, fmt: fmtWeight, label: "Peso", ph: "58kg" },
                  { val: formEyes, set: setFormEyes, fmt: null, label: "Ojos", ph: "Café" },
                  { val: formHair, set: setFormHair, fmt: null, label: "Cabello", ph: "Castaño" },
                  { val: formAge, set: setFormAge, fmt: fmtAge, label: "Edad", ph: "24" },
                  { val: formSizes, set: setFormSizes, fmt: null, label: "Talla", ph: "S/M" },
                ].map((s) => (
                  <div key={s.label}>
                    <label className="block mb-1" style={{ fontSize: 10, color: "#7878a0" }}>{s.label}</label>
                    <input value={s.val} onChange={(e) => s.set(e.target.value)} onBlur={() => s.fmt && s.set(s.fmt(s.val))} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none text-center" style={inputStyle} placeholder={s.ph} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Nacionalidad</label>
              <select value={formNationality} onChange={(e) => setFormNationality(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                <option value="">Selecciona...</option>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSaveProfile} disabled={saving} className="w-full mt-8 mb-4 py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-transform active:scale-95" style={{ background: "#8B5CF6", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: ADMIN DASHBOARD
  // ═════════════════════════════════════════════════════════════════════════
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: SELF-SIGNUP (public registration form)
  // ═════════════════════════════════════════════════════════════════════════
  if (view === "registro") {
    const Field = RegField;
    const inp = "w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none";
    const inpStyle = { background: "#1e1e3a", border: "1px solid #2a2a4a" };
    const inpErrStyle = (k) => ({ background: "#1e1e3a", border: `1px solid ${regErrors[k] ? "#f43f5e" : "#2a2a4a"}` });

    if (regSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#12122a" }}>
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)", border: "2px solid #8B5CF6" }}>
              <Check size={36} color="#8B5CF6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Solicitud enviada!</h2>
            <p className="text-sm mb-6" style={{ color: "#9898b0" }}>
              Revisaremos tu perfil y te contactaremos pronto al número que dejaste.
            </p>
            <button
              onClick={() => { setView("public"); window.location.hash = ""; }}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: "#8B5CF6" }}
            >
              Ver el catálogo
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pb-10" style={{ background: "#12122a", color: "#fff" }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: "#12122a", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
          <button onClick={() => { setView("public"); window.location.hash = ""; }}>
            <ArrowLeft size={20} color="#8B5CF6" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Únete al catálogo</h1>
            <p className="text-xs" style={{ color: "#7878a0" }}>Completa tu perfil y te contactamos</p>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
          {/* Photos — mandatory */}
          <Field label="Fotos" required error={regErrors.photos}>
            <div className="flex flex-wrap gap-2 mt-1">
              {regPhotos.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ width: 80, height: 100 }}>
                  <img src={url} alt="" className="w-full h-full object-cover" style={{ objectPosition: "top" }} />
                  <button
                    onClick={() => setRegPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.7)" }}
                  >
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => regFileRef.current?.click()}
                disabled={regUploading}
                className="flex flex-col items-center justify-center rounded-xl gap-1"
                style={{ width: 80, height: 100, background: "#1e1e3a", border: "2px dashed #2a2a4a", color: "#8B5CF6" }}
              >
                {regUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                <span style={{ fontSize: 10 }}>{regUploading ? "Subiendo..." : "Agregar"}</span>
              </button>
            </div>
            <input ref={regFileRef} type="file" accept="image/*" multiple onChange={handleRegPhotoUpload} className="hidden" />
          </Field>

          {/* Mandatory fields */}
          <Field label="Nombre" required error={regErrors.name}>
            <input className={inp} style={inpErrStyle("name")} placeholder="Ej: Valentina Rojas" value={regName} onChange={(e) => setRegName(e.target.value)} />
          </Field>

          <Field label="Teléfono / WhatsApp" required error={regErrors.phone}>
            <input className={inp} style={inpErrStyle("phone")} placeholder="+56 9 XXXX XXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} inputMode="tel" />
          </Field>

          <Field label="Tarifa (CLP)" required error={regErrors.rate}>
            <input className={inp} style={inpErrStyle("rate")} placeholder="Ej: 80000" value={regRate} onChange={(e) => setRegRate(e.target.value)} inputMode="numeric" />
          </Field>

          <Field label="Edad" required error={regErrors.age}>
            <input className={inp} style={inpErrStyle("age")} placeholder="Ej: 24" value={regAge} onChange={(e) => setRegAge(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={2} />
          </Field>

          <Field label="Nacionalidad" required error={regErrors.nationality}>
            <select className={inp} style={inpErrStyle("nationality")} value={regNationality} onChange={(e) => setRegNationality(e.target.value)}>
              <option value="">Selecciona...</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>

          <Field label="Comuna (Santiago)" required error={regErrors.location}>
            <select className={inp} style={inpErrStyle("location")} value={regLocation} onChange={(e) => setRegLocation(e.target.value)}>
              <option value="">Selecciona tu comuna...</option>
              {COMUNAS_SANTIAGO.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          {/* Optional fields */}
          <div className="pt-2" style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}>
            <p className="text-xs font-semibold mb-4" style={{ color: "#8B5CF6" }}>INFORMACIÓN ADICIONAL (opcional)</p>
            <div className="space-y-4">
              <Field label="Descripción / Bio">
                <textarea className={inp} style={inpStyle} rows={3} placeholder="Cuéntanos sobre ti, tu experiencia, disponibilidad..." value={regAbout} onChange={(e) => setRegAbout(e.target.value)} />
              </Field>

              <Field label="Especialidad">
                <input className={inp} style={inpStyle} placeholder="Ej: Modelo, Promotora, Animadora..." value={regSpecialty} onChange={(e) => setRegSpecialty(e.target.value)} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Altura">
                  <input className={inp} style={inpStyle} placeholder="Ej: 1.72" value={regHeight} onChange={(e) => setRegHeight(e.target.value)} />
                </Field>
                <Field label="Peso">
                  <input className={inp} style={inpStyle} placeholder="Ej: 58" value={regWeight} onChange={(e) => setRegWeight(e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Color de ojos">
                  <input className={inp} style={inpStyle} placeholder="Ej: Café" value={regEyes} onChange={(e) => setRegEyes(e.target.value)} />
                </Field>
                <Field label="Color de cabello">
                  <input className={inp} style={inpStyle} placeholder="Ej: Moreno" value={regHair} onChange={(e) => setRegHair(e.target.value)} />
                </Field>
              </div>

              <Field label="Talla / Medidas">
                <input className={inp} style={inpStyle} placeholder="Ej: S / 34-26-36" value={regSizes} onChange={(e) => setRegSizes(e.target.value)} />
              </Field>

              <Field label="Instagram">
                <input className={inp} style={inpStyle} placeholder="@tu_usuario" value={regInstagram} onChange={(e) => setRegInstagram(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleRegSubmit}
            disabled={regSubmitting}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: "#8B5CF6", opacity: regSubmitting ? 0.7 : 1 }}
          >
            {regSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {regSubmitting ? "Enviando..." : "Enviar solicitud"}
          </button>

          <p className="text-center text-xs pb-4" style={{ color: "#4a4a6a" }}>
            Tu perfil será revisado antes de publicarse. Te contactaremos por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  if (view === "admin") {
    const ANALYTICS_EMAILS = ["aceitunoafarica@hotmail.com"];
    const isAnalyticsOnly = session?.user?.user_metadata?.role === "analytics" || ANALYTICS_EMAILS.includes(session?.user?.email);
    return (
      <div className="min-h-screen" style={{ background: "#12122a", color: "#fff" }}>
        <div className={`mx-auto ${adminTab === "analytics" ? "max-w-6xl" : "max-w-3xl"}`}>
        <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock size={16} color="#8B5CF6" /> {isAnalyticsOnly ? "Analytics" : "Admin Panel"}
            </h1>
            <p className="text-xs" style={{ color: "#7878a0" }}>{session?.user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView("public")} className="p-2 rounded-xl" style={{ background: "#1e1e3a" }}>
              <Eye size={18} color="#8B5CF6" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl" style={{ background: "#1e1e3a" }}>
              <LogOut size={18} color="#f43f5e" />
            </button>
          </div>
        </header>

        {/* Admin tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-1">
          {!isAnalyticsOnly && (
            <button
              onClick={() => setAdminTab("profiles")}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: adminTab === "profiles" ? "#8B5CF6" : "#1e1e3a", color: adminTab === "profiles" ? "#fff" : "#7878a0" }}
            >
              <Users size={16} /> Perfiles
            </button>
          )}
          {!isAnalyticsOnly && (
            <button
              onClick={() => { setAdminTab("pendientes"); fetchPending(); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative"
              style={{ background: adminTab === "pendientes" ? "#f59e0b" : "#1e1e3a", color: adminTab === "pendientes" ? "#fff" : "#7878a0" }}
            >
              <AlertCircle size={16} /> Pendientes
              {pendingForAdmin.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white font-bold flex items-center justify-center" style={{ background: "#f43f5e", fontSize: 10 }}>
                  {pendingForAdmin.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => { setAdminTab("analytics"); if (!analyticsData) fetchAnalytics(); }}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: adminTab === "analytics" ? "#8B5CF6" : "#1e1e3a", color: adminTab === "analytics" ? "#fff" : "#7878a0" }}
          >
            <BarChart3 size={16} /> Analytics
          </button>
        </div>

        {/* ═══ ANALYTICS TAB ═══ */}
        {adminTab === "analytics" && (
          <div className="px-4 py-3 md:px-6 md:py-5">
            {analyticsLoading && (
              <div className="text-center py-16">
                <Loader2 size={24} color="#8B5CF6" className="animate-spin mx-auto" />
                <p className="text-xs mt-3" style={{ color: "#7878a0" }}>Cargando analytics...</p>
              </div>
            )}
            {analyticsData && !analyticsLoading && (
              <div className="space-y-5">

                {/* ── Controls row ── */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex flex-1 gap-1 rounded-xl p-1" style={{ background: "#1e1e3a" }}>
                      {[{ v: "30", label: "30 días" }, { v: "all", label: "Todo" }, { v: "custom", label: "Fechas" }].map(({ v, label }) => (
                        <button
                          key={v}
                          onClick={() => {
                            setAnalyticsRange(v);
                            if (v !== "custom") fetchAnalytics(v, "", "");
                          }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: analyticsRange === v ? "#8B5CF6" : "transparent", color: analyticsRange === v ? "#fff" : "#7878a0" }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => fetchAnalytics()} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: "#1e1e3a", color: "#8B5CF6" }}>
                      <RotateCcw size={12} /> Actualizar
                    </button>
                  </div>
                  {analyticsRange === "custom" && (
                    <div className="flex gap-3 md:flex-shrink-0">
                      <DatePicker
                        label="Desde"
                        value={analyticsCustomFrom}
                        maxDate={analyticsCustomTo || undefined}
                        onChange={(val) => {
                          setAnalyticsCustomFrom(val);
                          if (analyticsCustomTo) fetchAnalytics("custom", val, analyticsCustomTo);
                        }}
                      />
                      <DatePicker
                        label="Hasta"
                        value={analyticsCustomTo}
                        onChange={(val) => {
                          setAnalyticsCustomTo(val);
                          if (analyticsCustomFrom) fetchAnalytics("custom", analyticsCustomFrom, val);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ── Visitors summary ── */}
                {analyticsData.fetchedRange === "30" && (
                  <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                    {[
                      { label: "Hoy", value: analyticsData.visitors.today, sub: `${analyticsData.sessions.today} sesiones` },
                      { label: "7 días", value: analyticsData.visitors.week, sub: `${analyticsData.sessions.week} sesiones` },
                      { label: "30 días", value: analyticsData.visitors.month, sub: `${analyticsData.sessions.month} sesiones` },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "#1e1e3a" }}>
                        <div className="text-3xl font-bold text-white">{s.value}</div>
                        <div className="text-xs font-semibold mt-1" style={{ color: "#8B5CF6" }}>{s.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#4a4a6a" }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
                {analyticsData.fetchedRange === "all" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Hoy", value: analyticsData.visitors.today, sub: `${analyticsData.sessions.today} sesiones` },
                      { label: "7 días", value: analyticsData.visitors.week, sub: `${analyticsData.sessions.week} sesiones` },
                      { label: "30 días", value: analyticsData.visitors.month, sub: `${analyticsData.sessions.month} sesiones` },
                      { label: "Total histórico", value: analyticsData.visitors.month, sub: `${analyticsData.sessions.month} sesiones`, accent: true },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.accent ? "rgba(139,92,246,0.15)" : "#1e1e3a", border: s.accent ? "1px solid #8B5CF6" : "none" }}>
                        <div className="text-3xl font-bold text-white">{s.value}</div>
                        <div className="text-xs font-semibold mt-1" style={{ color: "#8B5CF6" }}>{s.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#4a4a6a" }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
                {analyticsData.fetchedRange === "custom" && (
                  <div className="rounded-xl p-5 text-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid #8B5CF6" }}>
                    <div className="text-4xl font-bold text-white">{analyticsData.visitors.month}</div>
                    <div className="text-sm font-semibold mt-1" style={{ color: "#8B5CF6" }}>Visitantes únicos</div>
                    <div className="text-xs mt-1" style={{ color: "#7878a0" }}>
                      {analyticsData.fetchedFrom} → {analyticsData.fetchedTo || "hoy"} · {analyticsData.sessions.month} sesiones
                    </div>
                  </div>
                )}

                {/* ── Main dashboard grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* LEFT COLUMN */}
                  <div className="space-y-4">

                    {/* Engagement metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Engagement", value: analyticsData.engagementRate + "%", sub: "vieron un perfil", color: "#22c55e" },
                        { label: "Rebote", value: analyticsData.bounceRate + "%", sub: "se fueron sin interactuar", color: "#f43f5e" },
                        { label: "Perfiles/Visita", value: analyticsData.avgProfilesPerVisitor, sub: "promedio", color: "#60a5fa" },
                        { label: "Recurrentes", value: analyticsData.returnVisitors, sub: "volvieron otro día", color: "#f59e0b" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{s.label}</div>
                          <div style={{ fontSize: 10, color: "#4a4a6a" }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Devices */}
                    {(analyticsData.devices.mobile + analyticsData.devices.desktop > 0) && (
                      <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Dispositivos</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex rounded-full overflow-hidden" style={{ height: 12 }}>
                              {analyticsData.devices.mobile > 0 && <div style={{ width: `${(analyticsData.devices.mobile / (analyticsData.devices.mobile + analyticsData.devices.desktop)) * 100}%`, background: "#8B5CF6" }} />}
                              {analyticsData.devices.desktop > 0 && <div style={{ width: `${(analyticsData.devices.desktop / (analyticsData.devices.mobile + analyticsData.devices.desktop)) * 100}%`, background: "#60a5fa" }} />}
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span style={{ color: "#8B5CF6" }}>{analyticsData.devices.mobile} móvil</span>
                            <span style={{ color: "#60a5fa" }}>{analyticsData.devices.desktop} desktop</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contacts */}
                    {analyticsData.contacts.total > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>Contactos (intención de contratar)</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: "#25D366" }}>{analyticsData.contacts.whatsapp}</div>
                            <div style={{ fontSize: 10, color: "#7878a0" }}>WhatsApp</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: "#8B5CF6" }}>{analyticsData.contacts.call}</div>
                            <div style={{ fontSize: 10, color: "#7878a0" }}>Llamadas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: "#E1306C" }}>{analyticsData.contacts.instagram}</div>
                            <div style={{ fontSize: 10, color: "#7878a0" }}>Instagram</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pasarela */}
                    {analyticsData.pasarela.total > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Pasarela</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex rounded-full overflow-hidden" style={{ height: 12 }}>
                              <div style={{ width: `${(analyticsData.pasarela.likes / analyticsData.pasarela.total) * 100}%`, background: "#22c55e" }} />
                              <div style={{ width: `${(analyticsData.pasarela.skips / analyticsData.pasarela.total) * 100}%`, background: "#f43f5e" }} />
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span style={{ color: "#22c55e" }}>{analyticsData.pasarela.likes} likes</span>
                            <span style={{ color: "#f43f5e" }}>{analyticsData.pasarela.skips} skips</span>
                          </div>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "#7878a0" }}>
                          {analyticsData.pasarela.total > 0 ? Math.round((analyticsData.pasarela.likes / analyticsData.pasarela.total) * 100) : 0}% tasa de like
                        </p>
                      </div>
                    )}

                    {/* Popular categories */}
                    {analyticsData.topCategories.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Categorías Populares</h3>
                        <div className="flex flex-wrap gap-2">
                          {analyticsData.topCategories.map(([cat, count]) => (
                            <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#12122a", color: "#9898b0" }}>
                              {cat} <span style={{ color: "#8B5CF6" }}>{count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">

                    {/* Daily visitors chart */}
                    <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Visitantes Únicos (últimos 7 días)</h3>
                      <div className="flex items-end justify-between gap-1" style={{ height: 120 }}>
                        {analyticsData.dailyVisitors.map((d, i) => {
                          const max = Math.max(...analyticsData.dailyVisitors.map((x) => x.count), 1);
                          const h = Math.max((d.count / max) * 100, 4);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-white">{d.count || ""}</span>
                              <div className="w-full rounded-t-lg" style={{ height: h, background: "linear-gradient(to top, #8B5CF6, #c084fc)", minWidth: 8 }} />
                              <span style={{ fontSize: 9, color: "#7878a0" }}>{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Peak hour */}
                    <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B5CF6" }}>Hora Pico</h3>
                      <p className="text-lg font-bold text-white">{analyticsData.peakHour}:00 - {analyticsData.peakHour + 1}:00</p>
                      <div className="flex items-end gap-px mt-3" style={{ height: 60 }}>
                        {analyticsData.hourCounts.map((c, i) => {
                          const max = Math.max(...analyticsData.hourCounts, 1);
                          return <div key={i} className="flex-1 rounded-t" style={{ height: Math.max((c / max) * 56, 1), background: i === analyticsData.peakHour ? "#8B5CF6" : "#2a2a4a", minWidth: 2 }} />;
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span style={{ fontSize: 8, color: "#4a4a6a" }}>0h</span>
                        <span style={{ fontSize: 8, color: "#4a4a6a" }}>12h</span>
                        <span style={{ fontSize: 8, color: "#4a4a6a" }}>23h</span>
                      </div>
                    </div>

                    {/* Heatmap */}
                    <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1" style={{ color: "#f59e0b" }}>
                          <TrendingUp size={12} /> Mapa de Atención
                        </h3>
                        <button onClick={fetchHeatmap} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#12122a", color: "#f59e0b" }}>
                          {heatmapLoading ? "..." : heatmapData ? "Actualizar" : "Cargar"}
                        </button>
                      </div>
                      {heatmapData && (
                        <div className="space-y-2">
                          {Object.entries(heatmapData)
                            .map(([tid, d]) => ({ tid, total: d.views + d.favs + d.shares + d.likes, ...d }))
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 10)
                            .map((item, i) => {
                              const t = talents.find((x) => x.id === parseInt(item.tid));
                              if (!t) return null;
                              const maxTotal = Object.values(heatmapData).reduce((m, d) => Math.max(m, d.views + d.favs + d.shares + d.likes), 1);
                              const pct = (item.total / maxTotal) * 100;
                              const heat = pct / 100;
                              const heatColor = `rgb(${Math.round(255 * Math.min(heat * 2, 1))}, ${Math.round(180 * Math.max(0, 1 - heat * 1.5))}, ${Math.round(60 * (1 - heat))})`;
                              return (
                                <div key={item.tid} className="flex items-center gap-2">
                                  <span className="text-xs font-bold w-5 text-right" style={{ color: "#4a4a6a" }}>{i + 1}</span>
                                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 ${8 + heat * 12}px ${heatColor}44` }}>
                                    <img src={getThumb(t)} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                                    <div className="flex gap-2 mt-0.5" style={{ fontSize: 9 }}>
                                      <span style={{ color: "#8B5CF6" }}>{item.views} <EyeIcon size={8} style={{ display: "inline" }} /></span>
                                      <span style={{ color: "#f43f5e" }}>{item.favs} ♥</span>
                                      <span style={{ color: "#60a5fa" }}>{item.shares} ↗</span>
                                      <span style={{ color: "#22c55e" }}>{item.likes} ✓</span>
                                    </div>
                                  </div>
                                  <div className="w-16">
                                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#12122a" }}>
                                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #f59e0b, ${heatColor})` }} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                      {!heatmapData && !heatmapLoading && (
                        <p className="text-xs text-center py-3" style={{ color: "#4a4a6a" }}>Presiona "Cargar" para ver el mapa de atención</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Leaderboards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Más Vistas", data: analyticsData.topViewed, color: "#8B5CF6", icon: <EyeIcon size={12} /> },
                    { title: "Más Favoritas", data: analyticsData.topFavorited, color: "#f43f5e", icon: <Heart size={12} /> },
                    { title: "Más Compartidas", data: analyticsData.topShared, color: "#60a5fa", icon: <Share2 size={12} /> },
                  ].map((section) => section.data.length > 0 && (
                    <div key={section.title} className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1" style={{ color: section.color }}>
                        {section.icon} {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.data.map(([tid, count], i) => {
                          const t = talents.find((x) => x.id === parseInt(tid));
                          if (!t) return null;
                          const maxCount = section.data[0]?.[1] || 1;
                          return (
                            <div key={tid} className="flex items-center gap-2">
                              <span className="text-xs font-bold w-5 text-right" style={{ color: "#4a4a6a" }}>{i + 1}</span>
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={getThumb(t)} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                                <div className="mt-0.5 rounded-full overflow-hidden" style={{ height: 4, background: "#12122a" }}>
                                  <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: section.color }} />
                                </div>
                              </div>
                              <span className="text-xs font-bold" style={{ color: section.color }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Más Contactadas ── */}
                {analyticsData.topContacted.length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: "#1e1e3a" }}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1" style={{ color: "#25D366" }}>
                      <Phone size={12} /> Más Contactadas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analyticsData.topContacted.map(([tid, total, breakdown], i) => {
                        const t = talents.find((x) => x.id === parseInt(tid));
                        if (!t) return null;
                        const maxTotal = analyticsData.topContacted[0]?.[1] || 1;
                        return (
                          <div key={tid} className="flex items-center gap-2">
                            <span className="text-xs font-bold w-5 text-right" style={{ color: "#4a4a6a" }}>{i + 1}</span>
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={getThumb(t)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "#12122a" }}>
                                  <div className="h-full rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, background: "#25D366" }} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {breakdown.whatsapp > 0 && <span className="text-xs" style={{ color: "#25D366" }}>WA {breakdown.whatsapp}</span>}
                                  {breakdown.call > 0 && <span className="text-xs" style={{ color: "#8B5CF6" }}>☎ {breakdown.call}</span>}
                                  {breakdown.instagram > 0 && <span className="text-xs" style={{ color: "#E1306C" }}>IG {breakdown.instagram}</span>}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold" style={{ color: "#25D366" }}>{total}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-xs text-center pb-4" style={{ color: "#4a4a6a" }}>
                  {analyticsData.totalEvents} eventos registrados ({
                    analyticsData.fetchedRange === "all" ? "todo el tiempo" :
                    analyticsData.fetchedRange === "custom" ? `${analyticsData.fetchedFrom} → ${analyticsData.fetchedTo || "hoy"}` :
                    "últimos 30 días"
                  })
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ PENDIENTES TAB ═══ */}
        {adminTab === "pendientes" && (
          <div className="px-4 py-3">
            {pendingForAdmin.length === 0 ? (
              <div className="text-center py-16">
                <Check size={40} color="#22c55e" className="mx-auto mb-3" />
                <p className="text-sm" style={{ color: "#6b6b90" }}>No hay solicitudes pendientes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: "#7878a0" }}>{pendingForAdmin.length} solicitud{pendingForAdmin.length !== 1 ? "es" : ""} esperando revisión</p>
                {pendingForAdmin.map((t) => (
                  <div key={t.id} className="rounded-2xl overflow-hidden" style={{ background: "#1e1e3a", border: "1px solid rgba(245,158,11,0.3)" }}>
                    {/* Photos strip */}
                    {(t.photos || []).length > 0 && (
                      <div className="flex gap-1 p-2 overflow-x-auto">
                        {t.photos.map((url, i) => (
                          <img key={i} src={url} alt="" className="rounded-lg flex-shrink-0 object-cover" style={{ width: 72, height: 90, objectPosition: "top" }} />
                        ))}
                      </div>
                    )}
                    <div className="px-3 pb-3 pt-1">
                      <h3 className="text-sm font-bold text-white">{t.name}</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5">
                        {[
                          ["Edad", t.age],
                          ["Nacionalidad", t.nationality],
                          ["Comuna", t.location],
                          ["Teléfono", t.phone],
                          ["Especialidad", t.specialty],
                          ["Tarifa", t.rate],
                          ["Altura", t.height],
                          ["Cabello", t.hair],
                        ].filter(([, v]) => v).map(([label, val]) => (
                          <p key={label} className="text-xs" style={{ color: "#9898b0" }}>
                            <span style={{ color: "#6b6b90" }}>{label}: </span>{val}
                          </p>
                        ))}
                      </div>
                      {t.about && <p className="text-xs mt-2 leading-relaxed" style={{ color: "#c4c4d8" }}>{t.about}</p>}
                      {t.instagram && <p className="text-xs mt-1" style={{ color: "#E1306C" }}>{t.instagram}</p>}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                          style={{ background: "#22c55e" }}
                        >
                          <Check size={15} /> Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(t.id)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                          style={{ background: "#2a2a4a", color: "#f43f5e" }}
                        >
                          <X size={15} /> Rechazar
                        </button>
                        {t.phone && (
                          <a
                            href={`https://wa.me/${t.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hola " + t.name.split(" ")[0] + ", revisamos tu solicitud en TioJohnny.cl 🎉")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-2.5 rounded-xl flex items-center justify-center"
                            style={{ background: "#2a2a4a" }}
                          >
                            <MessageCircle size={16} color="#25D366" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ PROFILES TAB ═══ */}
        {adminTab === "profiles" && (
        <>
        <div className="px-4 py-3 flex gap-2">
          <button onClick={() => openEditor(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95" style={{ background: "#8B5CF6" }}>
            <Plus size={18} /> Nueva Modelo
          </button>
          <button onClick={() => { setCsvImportOpen((o) => !o); setCsvPreview([]); setCsvResult(null); }} className="py-3 px-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95" style={{ background: csvImportOpen ? "#2a2a4a" : "#1e1e3a", border: "1px solid #2a2a4a" }}>
            <FileSpreadsheet size={18} color="#8B5CF6" />
          </button>
        </div>

        {/* ── Registration link ── */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#1e1e3a", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white mb-0.5">Enlace de Registro</p>
              <p className="text-xs truncate" style={{ color: "#7878a0" }}>{window.location.origin}/#/registro</p>
            </div>
            <CopyLinkButton url={`${window.location.origin}/#/registro`} />
          </div>
        </div>

        {/* ── CSV Import ── */}
        {csvImportOpen && (
          <div className="px-4 pb-4">
            <div className="rounded-2xl p-4" style={{ background: "#1e1e3a" }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Upload size={14} color="#8B5CF6" /> Importar desde CSV
              </h3>
              <p className="text-xs mb-3" style={{ color: "#7878a0" }}>
                Sube un CSV exportado desde Google Sheets. Columnas aceptadas: nombre, especialidad, categorías (separadas por ;), tarifa, teléfono, ubicación, sobre, servicios, altura, peso, ojos, cabello, edad, talla, instagram.
              </p>

              {csvPreview.length === 0 && !csvResult && (
                <>
                  <button
                    onClick={() => csvFileRef.current?.click()}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                    style={{ border: "2px dashed #2a2a4a", background: "transparent", color: "#8B5CF6" }}
                  >
                    <Upload size={16} /> Seleccionar archivo CSV
                  </button>
                  <input ref={csvFileRef} type="file" accept=".csv,.txt" onChange={handleCsvFile} className="hidden" />
                </>
              )}

              {csvPreview.length > 0 && (
                <div>
                  <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid #2a2a4a", maxHeight: 200, overflowY: "auto" }}>
                    {csvPreview.map((row, i) => {
                      const p = mapCsvToProfile(row);
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2" style={{ borderBottom: "1px solid #2a2a4a" }}>
                          <span className="text-xs font-bold" style={{ color: "#4a4a6a", width: 20 }}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{p.name || "(sin nombre)"}</p>
                            <p className="text-xs truncate" style={{ color: "#7878a0" }}>{p.location} &middot; {p.specialty}</p>
                          </div>
                          {!p.name && <AlertCircle size={14} color="#f59e0b" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCsvImport}
                      disabled={csvImporting}
                      className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                      style={{ background: "#22c55e" }}
                    >
                      {csvImporting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {csvImporting ? "Importando..." : `Importar ${csvPreview.length} perfil${csvPreview.length !== 1 ? "es" : ""}`}
                    </button>
                    <button
                      onClick={() => setCsvPreview([])}
                      className="py-2.5 px-4 rounded-xl font-bold text-sm transition-transform active:scale-95"
                      style={{ background: "#2a2a4a", color: "#9898b0" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {csvResult && (
                <div className="rounded-xl p-3" style={{ background: "#12122a" }}>
                  <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
                    {csvResult.added} perfil{csvResult.added !== 1 ? "es" : ""} importado{csvResult.added !== 1 ? "s" : ""}
                  </p>
                  {csvResult.errors > 0 && (
                    <p className="text-xs mt-1" style={{ color: "#f59e0b" }}>
                      {csvResult.errors} fila{csvResult.errors !== 1 ? "s" : ""} con error (sin nombre o fallo)
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: "#7878a0" }}>
                    Ahora agrega fotos a cada perfil desde el editor.
                  </p>
                  <button onClick={() => { setCsvResult(null); setCsvImportOpen(false); }} className="mt-2 text-xs font-semibold" style={{ color: "#8B5CF6" }}>
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Category Manager ── */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-4" style={{ background: "#1e1e3a" }}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Tag size={14} color="#8B5CF6" /> Categorías
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#12122a", border: "1px solid #2a2a4a", color: "#9898b0" }}>
                  {cat.name}
                  <button onClick={() => handleDeleteCategory(cat.id)} className="ml-1 hover:opacity-70">
                    <X size={12} color="#f43f5e" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-xs" style={{ color: "#4a4a6a" }}>No hay categorías. Agrega una.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "#12122a", border: "1px solid #2a2a4a" }}
                placeholder="Nueva categoría..."
              />
              <button onClick={handleAddCategory} className="px-4 py-2 rounded-lg font-bold text-white text-xs transition-transform active:scale-95" style={{ background: "#8B5CF6" }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Talents ── */}
        <div className="px-4 pb-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>Activas ({activeTalents.length})</h3>
          {activeTalents.map((t, idx) => (
            <div key={t.id} className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: "#1e1e3a" }}>
              {/* Position & reorder arrows */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
                <button
                  onClick={() => handleReorder(t.id, -1)}
                  disabled={idx === 0 || reordering}
                  className="p-0.5 rounded transition-all active:scale-90"
                  style={{ opacity: idx === 0 ? 0.2 : 1 }}
                >
                  <ChevronUp size={14} color="#8B5CF6" />
                </button>
                <span className="text-xs font-bold" style={{ color: "#4a4a6a" }}>{idx + 1}</span>
                <button
                  onClick={() => handleReorder(t.id, 1)}
                  disabled={idx === activeTalents.length - 1 || reordering}
                  className="p-0.5 rounded transition-all active:scale-90"
                  style={{ opacity: idx === activeTalents.length - 1 ? 0.2 : 1 }}
                >
                  <ChevronDown size={14} color="#8B5CF6" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 56, height: 72 }}>
                <img src={getThumb(t)} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                <p className="text-xs truncate" style={{ color: "#8B5CF6" }}>{t.specialty}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {getTalentCategories(t).map((c) => (
                    <span key={c} className="text-white px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: "#8B5CF6" }}>{c}</span>
                  ))}
                  <span className="text-xs" style={{ color: "#7878a0" }}>&middot; {(t.photos || []).length} fotos</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEditor(t)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }}>
                  <Edit3 size={16} color="#8B5CF6" />
                </button>
                <button
                  onClick={() => generateStatsCard(t)}
                  disabled={statsCardLoading === t.id}
                  className="p-2 rounded-xl transition-all active:scale-90"
                  style={{ background: "#2a2a4a" }}
                  title="Generar tarjeta de stats"
                >
                  {statsCardLoading === t.id
                    ? <Loader2 size={16} color="#8B5CF6" className="animate-spin" />
                    : <TrendingUp size={16} color="#8B5CF6" />}
                </button>
                <button onClick={() => handleArchive(t.id, true)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }} title="Archivar">
                  <Archive size={16} color="#f59e0b" />
                </button>
                {confirmDeleteId === t.id ? (
                  <button
                    onClick={() => { handleDelete(t.id); setConfirmDeleteId(null); }}
                    className="px-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-90"
                    style={{ background: "#f43f5e", color: "#fff" }}
                    onBlur={() => setConfirmDeleteId(null)}
                  >
                    ¿Seguro?
                  </button>
                ) : (
                  <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }} title="Eliminar">
                    <Trash2 size={16} color="#f43f5e" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {activeTalents.length === 0 && (
            <div className="text-center py-16">
              <User size={48} style={{ color: "#2a2a4a" }} className="mx-auto" />
              <p className="mt-4 text-sm" style={{ color: "#6b6b90" }}>No hay perfiles. Agrega tu primera modelo.</p>
            </div>
          )}
        </div>

        {/* ── Archived Talents ── */}
        {archivedTalents.length > 0 && (
          <div className="px-4 pb-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f59e0b" }}>Archivadas ({archivedTalents.length})</h3>
            {archivedTalents.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#1e1e3a", opacity: 0.7 }}>
                <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 56, height: 72 }}>
                  <img src={getThumb(t)} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                  <p className="text-xs truncate" style={{ color: "#f59e0b" }}>Archivada</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {getTalentCategories(t).map((c) => (
                      <span key={c} className="text-white px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: "#4a4a6a" }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleArchive(t.id, false)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }} title="Restaurar">
                    <ArchiveRestore size={16} color="#22c55e" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }} title="Eliminar permanentemente">
                    <Trash2 size={16} color="#f43f5e" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>)}

        {/* ── Stats Card WhatsApp Toast ── */}
        {statsCardToast && (
          <div
            className="fixed bottom-6 left-4 right-4 z-50 rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "#1e1e3a", border: "1px solid #8B5CF6", boxShadow: "0 8px 32px rgba(139,92,246,0.3)" }}
          >
            <TrendingUp size={20} color="#8B5CF6" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Tarjeta descargada</p>
              <p className="text-xs mt-0.5" style={{ color: "#9898b0" }}>
                ¿Enviarla a {statsCardToast.name.split(" ")[0]} por WhatsApp?
              </p>
              <div className="flex gap-2 mt-3">
                <a
                  href={`https://wa.me/${(statsCardToast.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${statsCardToast.name.split(" ")[0]}! 🌟 Te mandamos tu tarjeta de estadísticas de TioJohnny.cl. ¡Ya la tienes en tu descarga!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  style={{ background: "#25D366" }}
                  onClick={() => setStatsCardToast(null)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Enviar por WhatsApp
                </a>
                <button
                  onClick={() => setStatsCardToast(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-95"
                  style={{ background: "#2a2a4a", color: "#9898b0" }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: DETAIL MODAL
  // ═════════════════════════════════════════════════════════════════════════
  const renderDetail = () => {
    if (!selectedTalent) return null;
    const t = selectedTalent;
    const images = getCarouselPhotos(t);      // 800px optimized for hero/carousel
    const rawImages = getPhotos(t);           // full-res for lightbox
    const imgCount = images.length;
    const experienceList = (t.experience || "").split("\n").filter(Boolean);

    const goToPhoto = (newIndex) => {
      setCarouselIndex(newIndex);
      setCarouselKey((k) => k + 1);
      if (rawImages[newIndex]) extractAmbientColor(rawImages[newIndex]);
      // Preload adjacent images
      [-1, 1].forEach((d) => {
        const idx = (newIndex + d + imgCount) % imgCount;
        if (idx !== newIndex) { const img = new Image(); img.src = images[idx]; }
      });
    };

    return (
      <>
      <div className={`fixed inset-0 z-50 flex flex-col md:items-center md:justify-center md:p-6 ${modalClosing ? "modal-exit" : "modal-enter"}`} style={{ background: "rgba(0,0,0,0.7)" }}>
        <div className="flex flex-col w-full h-full md:h-[92vh] md:max-w-2xl md:rounded-3xl md:overflow-hidden relative" style={{ background: "#12122a" }}>
        {/* ── Ambient color glow — radiates from behind the hero image ── */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "65vh", background: `radial-gradient(ellipse at 50% 30%, ${ambientColor} 0%, transparent 70%)`, transition: "background 0.8s ease", zIndex: 0 }} />

        <div ref={profileScrollRef} className="flex-1 overflow-y-auto" onScroll={handleProfileScroll} style={{ position: "relative", zIndex: 1 }}>
          {/* ── Hero image with parallax + blur reveal + crossfade ── */}
          <div
            ref={profileHeroRef}
            className="relative w-full overflow-hidden"
            style={{ height: "55vh", minHeight: 300 }}
            onTouchStart={(e) => { if (imgCount > 1) heroTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (heroTouchX.current === null || imgCount <= 1) return;
              const dx = e.changedTouches[0].clientX - heroTouchX.current;
              heroTouchX.current = null;
              if (Math.abs(dx) < 40) return;
              goToPhoto(dx < 0 ? (carouselIndex + 1) % imgCount : (carouselIndex - 1 + imgCount) % imgCount);
            }}
          >
            <img
              key={`hero-${carouselKey}`}
              src={images[carouselIndex]}
              alt={t.name}
              className="w-full h-full object-cover profile-blur-reveal profile-crossfade"
              style={{ objectPosition: "top", transform: "scale(1.05)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 40%, #12122a 100%)", cursor: "zoom-in" }}
              onClick={() => setLightboxIndex(carouselIndex)}
            />
            {/* Tap to zoom hint */}
            <div className="absolute bottom-14 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none" style={{ background: "rgba(0,0,0,0.55)", zIndex: 4, backdropFilter: "blur(4px)" }}>
              <ZoomIn size={11} color="#fff" />
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Toca para ver completo</span>
            </div>
            <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 5 }}>
              <button onClick={(e) => handleShare(t, e)} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
                {shareConfirm === t.id ? <Check size={22} color="#22c55e" /> : <Share2 size={22} color="#fff" />}
              </button>
              <button onClick={closeDetail} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
                <X size={22} color="#fff" />
              </button>
            </div>
            <button onClick={(e) => toggleFav(t.id, e)} className={`absolute top-4 left-4 p-2 rounded-full ${heartPopId === t.id ? "heart-pop" : ""}`} style={{ background: "rgba(0,0,0,0.5)", zIndex: 5 }}>
              <Heart size={22} color={favorites.includes(t.id) ? "#f43f5e" : "#fff"} fill={favorites.includes(t.id) ? "#f43f5e" : "none"} />
            </button>
            {imgCount > 1 && (
              <>
                <button onClick={() => goToPhoto((carouselIndex - 1 + imgCount) % imgCount)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.4)", zIndex: 5 }}>
                  <ChevronLeft size={20} color="#fff" />
                </button>
                <button onClick={() => goToPhoto((carouselIndex + 1) % imgCount)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.4)", zIndex: 5 }}>
                  <ChevronRight size={20} color="#fff" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 5 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => i !== carouselIndex && goToPhoto(i)} className="block rounded-full transition-all" style={{ width: i === carouselIndex ? 24 : 8, height: 8, background: i === carouselIndex ? "#8B5CF6" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }} />
              ))}
            </div>
          </div>

          <div className="px-5 pb-32" style={{ color: "#e2e2f0" }}>
          <div className="mt-2">
            <h2 className="text-2xl font-bold text-white">{t.name}</h2>
            <p className="text-sm mt-1" style={{ color: "#8B5CF6" }}>{t.specialty} &middot; {formatRate(t.rate)}</p>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#9898b0" }}>
            <span className="flex items-center gap-1"><MapPin size={12} /> {t.location}</span>
            {t.instagram && (
              <a href={`https://instagram.com/${t.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ color: "#E1306C" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                {t.instagram}
              </a>
            )}
          </div>
          {t.about && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B5CF6" }}>Sobre</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c4c4d8" }}>{t.about}</p>
            </div>
          )}
          {experienceList.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B5CF6" }}>Servicios</h3>
              <ul className="space-y-1">
                {experienceList.map((exp, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "#c4c4d8" }}>
                    <span style={{ color: "#8B5CF6" }}>•</span> {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(t.height || t.weight || t.eyes || t.hair || t.age || t.sizes || t.nationality) && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Medidas / Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Nacionalidad", value: t.nationality },
                  { label: "Edad", value: t.age },
                  { label: "Altura", value: t.height },
                  { label: "Peso", value: t.weight },
                  { label: "Ojos", value: t.eyes },
                  { label: "Cabello", value: t.hair },
                  { label: "Talla", value: t.sizes },
                ].filter((s) => s.value).map((s) => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#1e1e3a" }}>
                    <div className="text-xs mb-1" style={{ color: "#7878a0" }}>{s.label}</div>
                    <div className="text-sm font-semibold text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>{/* end scroll container */}

        <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-10 flex items-center justify-center gap-4" style={{ background: "linear-gradient(to top, #12122a 60%, transparent)", zIndex: 10 }}>
          {/* WhatsApp */}
          <a href={`https://wa.me/${(t.phone || "").replace("+", "")}?text=${encodeURIComponent("Hola, te vi en TioJohnny.cl y me gustaría saber más de ti")}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_whatsapp", t.id)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="w-13 h-13 rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "#25D366" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: "#25D366" }}>WhatsApp</span>
          </a>
          {/* Call */}
          <a href={`tel:${t.phone}`} onClick={() => trackEvent("contact_call", t.id)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "#8B5CF6" }}>
              <Phone size={20} color="#fff" />
            </div>
            <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Llamar</span>
          </a>
          {/* Instagram (only if they have one) */}
          {t.instagram && (
            <a href={`https://instagram.com/${t.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_instagram", t.id)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
              <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#E1306C" }}>Instagram</span>
            </a>
          )}
          {/* Tarjeta (share card image) */}
          <button onClick={() => generateShareCard(t)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "#1e1e3a", border: "2px solid #ec4899" }}>
              <ImageIcon size={18} color="#ec4899" />
            </div>
            <span className="text-xs font-semibold" style={{ color: "#ec4899" }}>Tarjeta</span>
          </button>
          {/* Share */}
          <button onClick={(e) => handleShare(t, e)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: shareConfirm === t.id ? "#22c55e" : "#2a2a4a", transition: "background 0.3s ease" }}>
              {shareConfirm === t.id ? <Check size={20} color="#fff" /> : <Share2 size={20} color="#fff" />}
            </div>
            <span className="text-xs font-semibold" style={{ color: shareConfirm === t.id ? "#22c55e" : "#9898b0", transition: "color 0.3s ease" }}>
              {shareConfirm === t.id ? "Copiado!" : "Compartir"}
            </span>
          </button>
        </div>
      </div>
      </div>

      {/* ── Lightbox: full-screen photo viewer ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "#12122a" }}
          onClick={() => setLightboxIndex(null)}
          onTouchStart={(e) => { lightboxTouchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (lightboxTouchX.current === null) return;
            const dx = e.changedTouches[0].clientX - lightboxTouchX.current;
            lightboxTouchX.current = null;
            if (Math.abs(dx) < 50) return;
            e.stopPropagation();
            setLightboxIndex(dx < 0 ? (lightboxIndex + 1) % imgCount : (lightboxIndex - 1 + imgCount) % imgCount);
          }}
        >
          {/* Ambient glow behind photo */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ambientColor} 0%, transparent 70%)` }} />

          {/* Swipe hint — plays once when lightbox opens, fades away */}
          {imgCount > 1 && (
            <div className="swipe-tutorial-hand absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 20 }}>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
                <ChevronLeft size={20} color="#fff" />
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Desliza para ver más</span>
                <ChevronRight size={20} color="#fff" />
              </div>
            </div>
          )}

          {/* Photo */}
          <img
            key={lightboxIndex}
            src={rawImages[lightboxIndex]}
            alt=""
            className="lightbox-zoom"
            style={{ maxWidth: "100vw", maxHeight: "100vh", objectFit: "contain", userSelect: "none", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1 }}
            onClick={() => setLightboxIndex(null)}
          >
            <X size={24} color="#fff" />
          </button>

          {/* Prev / Next */}
          {imgCount > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)" }}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + imgCount) % imgCount); }}
              >
                <ChevronLeft size={24} color="#fff" />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)" }}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % imgCount); }}
              >
                <ChevronRight size={24} color="#fff" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {imgCount > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  style={{ width: i === lightboxIndex ? 24 : 8, height: 8, borderRadius: 9999, background: i === lightboxIndex ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          {imgCount > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
              {lightboxIndex + 1} / {imgCount}
            </div>
          )}
        </div>
      )}
      </>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: PUBLIC DIRECTORY
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: "#12122a", color: "#fff" }}>
      <header className="sticky top-0 z-40" style={{ background: "rgba(18,18,42,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        {searchOpen ? (
          <div className="flex items-center gap-2 w-full relative">
            <Search size={18} style={{ color: "#8B5CF6" }} />
            <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nombre, ubicación, especialidad..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500" />
            {searchQuery.length > 1 && hasActiveFilters && (
              <span className="text-xs px-2 py-0.5 rounded-full ml-1 flex-shrink-0" style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6", whiteSpace: "nowrap" }}>✨ Filtros auto</span>
            )}
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
              <X size={18} color="#888" />
            </button>
            {/* Autocomplete dropdown */}
            {searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a", zIndex: 60, boxShadow: "0 12px 32px rgba(0,0,0,0.6)" }}>
                {searchSuggestions.map(({ t, matchField }) => (
                  <button
                    key={t.id}
                    onClick={() => { setSearchQuery(""); setSearchOpen(false); openProfile(t); }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-left"
                    style={{ borderBottom: "1px solid #2a2a4a" }}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={getThumb(t)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                      <p className="text-xs truncate" style={{ color: "#7878a0" }}>{t.specialty} · {t.location}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#12122a", color: "#8B5CF6", fontSize: 9 }}>{matchField}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#8B5CF6" }}>Tio</span><span style={{ color: "#fff" }}>Johnny</span>
              <span style={{ fontWeight: 400, fontSize: 11, color: "#6b6b90", marginLeft: 3 }}>.cl</span>
            </h1>
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2">
                <Search size={20} color="#8B5CF6" />
              </button>
              <button onClick={() => session ? setView("admin") : setView("login")} className="p-2">
                <Settings size={18} color="#4a4a6a" />
              </button>
            </div>
          </>
        )}
        </div>
      </header>

      {/* ── Animated entrance counters ── */}
      {countersShown && (
        <div className="flex items-center justify-center gap-6 px-4 py-2.5" style={{ background: "rgba(139,92,246,0.06)", borderBottom: "1px solid rgba(139,92,246,0.1)", animation: "counterSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
          {[
            { value: counterVals.models, label: "modelos" },
            { value: counterVals.cats, label: "categorías" },
            { value: counterVals.comunas, label: "comunas" },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <span className="text-base font-bold" style={{ color: "#8B5CF6", fontFamily: "'Sora', sans-serif" }}>{c.value}</span>
              <span className="text-xs ml-1" style={{ color: "#6b6b90" }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {session && view === "public" && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Admin activo</span>
          <button onClick={() => setView("admin")} className="text-xs px-3 py-1 rounded-full font-bold text-white" style={{ background: "#8B5CF6" }}>
            Panel Admin
          </button>
        </div>
      )}

      <div className="sticky z-30" style={{ top: 49, background: "rgba(18,18,42,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto max-w-screen-xl mx-auto md:flex-wrap md:overflow-x-visible" style={{ scrollbarWidth: "none" }}>
        {publicCategories.map((cat) => {
          const active = activeCategory === cat;
          const isFavPill = cat === "Favoritas";
          return (
            <button
              key={cat}
              ref={isFavPill ? favPillRef : null}
              onClick={() => switchCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 ${pillPopCat === cat ? "pill-pop" : ""}`}
              style={{
                background: active ? (isFavPill ? "#f43f5e" : "#8B5CF6") : "#1e1e3a",
                color: active ? "#fff" : "#9898b0",
                border: active ? "none" : "1px solid #2a2a4a",
                transition: "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
                boxShadow: active ? (isFavPill ? "0 0 16px rgba(244,63,94,0.4)" : "0 0 16px rgba(139,92,246,0.4)") : "none",
              }}
            >
              {isFavPill && <Heart size={10} fill={active ? "#fff" : "none"} />}
              {cat}
              {isFavPill && favorites.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-white ${badgeBounce ? "badge-bounce" : ""}`} style={{ fontSize: 9, background: active ? "rgba(255,255,255,0.25)" : "#f43f5e", minWidth: 18, textAlign: "center" }}>
                  {favorites.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      </div>

      <div className="max-w-screen-xl mx-auto">
      <div className="px-4 pb-2 flex items-center justify-between">
        {/* Left: Filtros + Cast + Currency dropdown */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{ background: hasActiveFilters ? "#8B5CF6" : filtersOpen ? "#2a2a4a" : "#1e1e3a", color: hasActiveFilters ? "#fff" : "#7878a0", border: hasActiveFilters ? "none" : "1px solid #2a2a4a" }}
          >
            <SlidersHorizontal size={11} /> Filtros{hasActiveFilters ? " ●" : ""}
          </button>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: "#f43f5e", background: "rgba(244,63,94,0.1)" }}>
              ✕
            </button>
          )}
          <button
            onClick={() => { const next = !castMode; setCastMode(next); setCastSelected(new Set()); if (next) { setCastToast(true); setTimeout(() => setCastToast(false), 3500); } }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{ background: castMode ? "#8B5CF6" : "#1e1e3a", color: castMode ? "#fff" : "#7878a0", border: castMode ? "none" : "1px solid #2a2a4a" }}
          >
            <Users size={11} /> Cast
          </button>
          {/* Currency dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(o => !o)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={{ background: "#1e1e3a", color: "#7878a0", border: "1px solid #2a2a4a" }}
            >
              {currency} <ChevronDown size={10} />
            </button>
            {currencyOpen && (
              <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                {["CLP", "USD", "EUR"].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                    className="block w-full px-4 py-2 text-xs font-semibold text-left transition-all"
                    style={{ color: currency === c ? "#8B5CF6" : "#9898b0", background: currency === c ? "rgba(139,92,246,0.1)" : "transparent" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right: Grid / Pasarela toggle */}
        <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a" }}>
          <button
            onClick={() => { setViewMode("grid"); setSwipeIndex(0); }}
            className="flex items-center justify-center px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: viewMode === "grid" ? "#8B5CF6" : "transparent" }}
          >
            <Grid3X3 size={12} color={viewMode === "grid" ? "#fff" : "#6b6b90"} />
          </button>
          <button
            onClick={() => { setViewMode("swipe"); setSwipeIndex(0); if (!swipeTutorialShown.current) { setShowSwipeTutorial(true); swipeTutorialShown.current = true; setTimeout(() => setShowSwipeTutorial(false), 2800); } }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: viewMode === "swipe" ? "linear-gradient(135deg, #8B5CF6, #ec4899)" : "transparent", color: viewMode === "swipe" ? "#fff" : "#6b6b90" }}
          >
            <Layers size={12} /> Pasarela
          </button>
        </div>
      </div>

      {/* ═══ FILTER PANEL ═══ */}
      {filtersOpen && (
        <div className="px-4 pb-3 relative" style={{ animation: "fadeSlideUp 0.2s ease both", zIndex: 20 }}>
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a", overflow: "visible" }}>
            {/* Domicilio toggle */}
            <button
              onClick={() => setFilterDomicilio((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: filterDomicilio ? "rgba(139,92,246,0.15)" : "#12122a", border: filterDomicilio ? "1px solid #8B5CF6" : "1px solid #2a2a4a", color: filterDomicilio ? "#fff" : "#7878a0" }}
            >
              <span>Domicilio</span>
              <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ background: filterDomicilio ? "#8B5CF6" : "transparent", border: filterDomicilio ? "none" : "1.5px solid #4a4a6a" }}>
                {filterDomicilio && <Check size={12} color="#fff" />}
              </div>
            </button>
            {/* Multi-select dropdowns */}
            <div className="grid grid-cols-2 gap-2" ref={filterDropRef}>
              {[
                { key: "location", label: "Comuna", options: filterOptions.location, selected: filterLocation, setSelected: setFilterLocation },
                { key: "nationality", label: "Nacionalidad", options: filterOptions.nationality, selected: filterNationality, setSelected: setFilterNationality },
                { key: "eyes", label: "Ojos", options: filterOptions.eyes, selected: filterEyes, setSelected: setFilterEyes },
                { key: "hair", label: "Cabello", options: filterOptions.hair, selected: filterHair, setSelected: setFilterHair },
              ].map((section) => {
                if (section.options.length === 0) return null;
                const count = section.selected.length;
                const isOpen = filterDropOpen === section.key;
                return (
                  <div key={section.key} className="relative">
                    <label className="block mb-1" style={{ fontSize: 9, color: "#7878a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{section.label}</label>
                    <button onClick={() => setFilterDropOpen(isOpen ? null : section.key)} className="w-full px-2 py-2 rounded-lg text-xs text-left flex items-center justify-between gap-1" style={{ background: "#12122a", border: count > 0 ? "1px solid #8B5CF6" : "1px solid #2a2a4a", color: count > 0 ? "#fff" : "#7878a0" }}>
                      <span className="truncate">{count > 0 ? `${count} sel.` : "Todas"}</span>
                      <ChevronDown size={11} style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                    {isOpen && (
                      <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-y-auto" style={{ background: "#1e1e3a", border: "1px solid #2a2a4a", zIndex: 50, maxHeight: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                        {section.options.map((opt) => {
                          const active = section.selected.includes(opt);
                          return (
                            <button key={opt} onClick={() => toggleFilter(section.selected, section.setSelected, opt)} className="w-full px-3 py-2.5 text-xs text-left flex items-center gap-2" style={{ color: active ? "#fff" : "#9898b0", background: active ? "rgba(139,92,246,0.12)" : "transparent" }}>
                              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center" style={{ border: active ? "none" : "1.5px solid #4a4a6a", background: active ? "#8B5CF6" : "transparent" }}>
                                {active && <Check size={10} color="#fff" />}
                              </div>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Age + Height range dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              {allAges.length > 0 && (
                <div>
                  <label className="block mb-1" style={{ fontSize: 9, color: "#7878a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Edad</label>
                  <div className="flex items-center gap-1">
                    <select value={filterAgeMin} onChange={(e) => setFilterAgeMin(e.target.value)} className="flex-1 px-1 py-2 rounded-lg text-xs text-white outline-none text-center appearance-none" style={{ background: "#12122a", border: "1px solid #2a2a4a" }}>
                      <option value="">Mín</option>
                      {allAges.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <span style={{ fontSize: 10, color: "#4a4a6a" }}>—</span>
                    <select value={filterAgeMax} onChange={(e) => setFilterAgeMax(e.target.value)} className="flex-1 px-1 py-2 rounded-lg text-xs text-white outline-none text-center appearance-none" style={{ background: "#12122a", border: "1px solid #2a2a4a" }}>
                      <option value="">Máx</option>
                      {allAges.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {allHeights.length > 0 && (
                <div>
                  <label className="block mb-1" style={{ fontSize: 9, color: "#7878a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Altura</label>
                  <div className="flex items-center gap-1">
                    <select value={filterHeightMin} onChange={(e) => setFilterHeightMin(e.target.value)} className="flex-1 px-1 py-2 rounded-lg text-xs text-white outline-none text-center appearance-none" style={{ background: "#12122a", border: "1px solid #2a2a4a" }}>
                      <option value="">Mín</option>
                      {allHeights.map((h) => <option key={h} value={h}>{h.toFixed(2)}m</option>)}
                    </select>
                    <span style={{ fontSize: 10, color: "#4a4a6a" }}>—</span>
                    <select value={filterHeightMax} onChange={(e) => setFilterHeightMax(e.target.value)} className="flex-1 px-1 py-2 rounded-lg text-xs text-white outline-none text-center appearance-none" style={{ background: "#12122a", border: "1px solid #2a2a4a" }}>
                      <option value="">Máx</option>
                      {allHeights.map((h) => <option key={h} value={h}>{h.toFixed(2)}m</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ GRID VIEW ═══ */}
      {viewMode === "grid" && (
        <>
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-3 pb-8 ${gridMorphing ? "grid-morph-out" : ""}`}>
            {filtered.map((t, idx) => {
              const isFav = favorites.includes(t.id);
              const isHeartbeat = heartbeatIds.includes(t.id);
              const lp = makeLongPress(t);
              const trendViews = trendingData[t.id] || 0;
              const allCounts = Object.values(trendingData).filter(c => c > 0);
              const trendRank = allCounts.filter(c => c > trendViews).length;
              const trendLimit = filtered.length >= 10 ? 3 : 2;
              const isTrending = trendViews >= 1 && trendRank < trendLimit;
              const isNew = t.created_at && (Date.now() - new Date(t.created_at).getTime()) < 30 * 86400000;
              return (
                <div
                  key={`${t.id}-${cardAnimKey}`}
                  onPointerDown={castMode ? undefined : lp.onPointerDown}
                  onPointerUp={castMode ? undefined : lp.onPointerUp}
                  onPointerCancel={castMode ? undefined : lp.onPointerCancel}
                  onPointerMove={castMode ? undefined : handleCardPointerMove}
                  onPointerLeave={castMode ? undefined : (e) => { try { lp.onPointerLeave(); handleCardPointerLeave(e); } catch(_){} }}
                  onClick={castMode ? (e) => { e.stopPropagation(); toggleCast(t.id); } : undefined}
                  className="grid-morph-in rounded-2xl cursor-pointer"
                  style={{ background: "#1e1e3a", animationDelay: `${idx * 0.05}s`, WebkitUserSelect: "none", userSelect: "none", willChange: "transform", transition: "box-shadow 0.4s ease, outline 0.4s ease", boxShadow: isHeartbeat ? "0 0 24px 10px rgba(244,63,94,0.5)" : isFav ? "0 0 12px 4px rgba(244,63,94,0.22)" : "none", outline: isHeartbeat ? "2px solid rgba(244,63,94,0.75)" : isFav ? "1.5px solid rgba(244,63,94,0.35)" : "none" }}
                >
                  <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: "130%" }}>
                    <img src={getThumb(t)} alt={t.name} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "top", animation: `kenBurns${(idx % 3) + 1} ${6 + (idx % 3) * 2}s ease-in-out infinite alternate`, willChange: "transform", transformOrigin: "center center" }} loading="lazy" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(18,18,42,0.95) 100%)" }} />
                    {castMode && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: castSelected.has(t.id) ? "rgba(139,92,246,0.5)" : "transparent", transition: "background 0.15s", zIndex: 3 }}>
                        {castSelected.has(t.id) && <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#8B5CF6" }}><Check size={22} color="#fff" /></div>}
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleFav(t.id, e)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      className={`absolute top-2 right-2 p-2 rounded-full ${heartPopId === t.id ? "heart-pop" : ""}`}
                      style={{ background: "rgba(0,0,0,0.35)", transition: "transform 0.2s ease" }}
                    >
                      <Heart size={16} color={isFav ? "#f43f5e" : "#fff"} fill={isFav ? "#f43f5e" : "none"} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex flex-wrap gap-1 mb-1">
                      {isTrending ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,0.2)", border: "1px solid rgba(251,146,60,0.4)" }}>
                          <span style={{ fontSize: 9, color: "#fb923c" }}>🔥 {trendViews} vistas</span>
                        </div>
                      ) : isNew ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }}>
                          <span style={{ fontSize: 9, color: "#22c55e" }}>✨ Nuevo</span>
                        </div>
                      ) : null}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">{t.name}</h3>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#b8b8d0" }}><MapPin size={10} />{t.location || "Sin ubicación"}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: "#8B5CF6" }}>{formatRate(t.rate)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Search size={48} style={{ color: "#2a2a4a" }} />
              <p className="mt-4 text-sm" style={{ color: "#6b6b90" }}>No se encontraron modelos.</p>
              <button onClick={() => { switchCategory("Todas"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#8B5CF6", color: "#fff" }}>
                Ver todas
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══ SWIPE VIEW ═══ */}
      {viewMode === "swipe" && (
        <div className="flex flex-col items-center" style={{ height: "calc(100dvh - 140px)", overflow: "hidden" }}>
          {swipeIndex < filtered.length ? (
            <>
              {/* Card stack — fills available space minus buttons */}
              <div className="relative mt-2 flex-1" style={{ width: "88vw", maxWidth: 400, minHeight: 0 }}>
                {/* 4th card shadow (static) */}
                {swipeIndex + 3 < filtered.length && (
                  <div className="absolute inset-0 rounded-3xl" style={{ transform: "scale(0.80) translateY(34px)", opacity: 0.1, background: "#2a2a4a", zIndex: 0 }} />
                )}
                {/* 3rd card (hint) */}
                {swipeIndex + 2 < filtered.length && (
                  <div ref={swipeThirdRef} className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: "scale(0.86) translateY(24px)", opacity: 0.25, background: "#1e1e3a", zIndex: 1 }}>
                    <img src={getThumb(filtered[swipeIndex + 2])} alt="" className="w-full h-full object-cover" style={{ objectPosition: "top", filter: "blur(2px) brightness(0.5)" }} />
                  </div>
                )}
                {/* 2nd card (next) */}
                {swipeIndex + 1 < filtered.length && (
                  <div ref={swipeBackRef} className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: "scale(0.93) translateY(12px)", opacity: 0.5, background: "#1e1e3a", zIndex: 2 }}>
                    <img src={getThumb(filtered[swipeIndex + 1])} alt="" className="w-full h-full object-cover" style={{ objectPosition: "top" }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(18,18,42,0.95) 100%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-xl font-bold text-white">{filtered[swipeIndex + 1].name}</h2>
                      <p className="text-xs mt-1" style={{ color: "#8B5CF6" }}>{filtered[swipeIndex + 1].specialty}</p>
                    </div>
                  </div>
                )}
                {/* Active card (top) — driven by refs, not state */}
                <div
                  ref={swipeCardRef}
                  className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab"
                  style={{
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                    userSelect: "none",
                    touchAction: "none",
                    zIndex: 3,
                  }}
                  onTouchStart={handleSwipeTouchStart}
                  onTouchMove={handleSwipeTouchMove}
                  onTouchEnd={handleSwipeTouchEnd}
                  onMouseDown={handleSwipeMouseDown}
                >
                  <img
                    src={getThumb(filtered[swipeIndex])}
                    alt={filtered[swipeIndex].name}
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: "top" }}
                    draggable={false}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(18,18,42,0.95) 100%)" }} />

                  {/* Green / Red glow overlay */}
                  <div ref={swipeGlowRef} className="absolute inset-0 pointer-events-none rounded-3xl" style={{ background: "none" }} />

                  {/* LIKE stamp */}
                  <div ref={swipeLikeRef} className="absolute top-6 left-6 px-5 py-2 rounded-xl font-extrabold text-2xl" style={{
                    display: "none", border: "4px solid #22c55e", color: "#22c55e", textShadow: "0 2px 12px rgba(34,197,94,0.4)",
                  }}>LIKE</div>
                  {/* NOPE stamp */}
                  <div ref={swipeNopeRef} className="absolute top-6 right-6 px-5 py-2 rounded-xl font-extrabold text-2xl" style={{
                    display: "none", border: "4px solid #f43f5e", color: "#f43f5e", textShadow: "0 2px 12px rgba(244,63,94,0.4)",
                  }}>NOPE</div>

                  {/* Swipe tutorial overlay */}
                  {showSwipeTutorial && !swipeAnim && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-6 text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                          <span className="flex items-center gap-1"><X size={14} color="#f43f5e" /> NOPE</span>
                          <span className="flex items-center gap-1">LIKE <Heart size={14} color="#22c55e" fill="#22c55e" /></span>
                        </div>
                        <div className="swipe-tutorial-hand" style={{ fontSize: 40 }}>
                          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13"/></svg>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Desliza para elegir</span>
                      </div>
                    </div>
                  )}

                  {/* Card info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="text-2xl font-bold text-white">{filtered[swipeIndex].name}</h2>
                    <p className="text-sm mt-1" style={{ color: "#8B5CF6" }}>{filtered[swipeIndex].specialty}</p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#b8b8d0" }}>
                      <MapPin size={12} /> {filtered[swipeIndex].location || "Sin ubicación"} &middot; {formatRate(filtered[swipeIndex].rate)}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); openProfile(filtered[swipeIndex]); }}
                      className="mt-3 text-xs font-semibold px-4 py-2 rounded-full"
                      style={{ background: "rgba(139,92,246,0.3)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }}
                    >
                      Ver perfil completo
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons — compact, no overflow */}
              <div className="flex items-center justify-center gap-5 py-3 flex-shrink-0">
                <button
                  onClick={undoSwipe}
                  disabled={swipeIndex === 0}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "#1e1e3a", border: "2px solid #2a2a4a", opacity: swipeIndex === 0 ? 0.3 : 1 }}
                >
                  <RotateCcw size={16} color="#f59e0b" />
                </button>
                <button
                  onClick={() => doSwipe("left")}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "#1e1e3a", border: "3px solid #f43f5e", boxShadow: "0 0 16px rgba(244,63,94,0.2)" }}
                >
                  <X size={24} color="#f43f5e" />
                </button>
                <button
                  onClick={() => doSwipe("right")}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "#1e1e3a", border: "3px solid #22c55e", boxShadow: "0 0 16px rgba(34,197,94,0.2)" }}
                >
                  <Heart size={24} color="#22c55e" fill="#22c55e" />
                </button>
                <button
                  onClick={(e) => handleShare(filtered[swipeIndex], e)}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "#1e1e3a", border: "2px solid #2a2a4a" }}
                >
                  <Share2 size={16} color="#60a5fa" />
                </button>
              </div>
              <p className="text-xs pb-2 flex-shrink-0" style={{ color: "#4a4a6a" }}>Pasarela &middot; {swipeIndex + 1} / {filtered.length}</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Heart size={48} style={{ color: "#8B5CF6" }} />
              <p className="mt-4 text-base font-bold text-white">
                {filtered.length === 0 ? "No hay modelos en esta categoría" : "Fin de la Pasarela!"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#6b6b90" }}>
                {favorites.length > 0 ? `${favorites.length} favorita${favorites.length !== 1 ? "s" : ""} guardada${favorites.length !== 1 ? "s" : ""}` : "Desliza a la derecha para guardar favoritas"}
              </p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setSwipeIndex(0)} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#8B5CF6", color: "#fff" }}>
                  Empezar de nuevo
                </button>
                {favorites.length > 0 && (
                  <button onClick={() => { switchCategory("Favoritas"); setViewMode("grid"); }} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#f43f5e", color: "#fff" }}>
                    Ver favoritas
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>{/* end max-w-screen-xl */}

      {renderDetail()}

      {/* ── Spotlight / Dark Room Mode ── */}
      {spotlightTalent && (() => {
        const st = spotlightTalent;
        const imgs = (st.photos && st.photos.length > 0) ? st.photos : [getMainPhoto(st)];
        return (
          <div
            className="fixed inset-0 z-[9998] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)", animation: "spotlightIn 0.3s ease both", cursor: "pointer" }}
            onClick={() => setSpotlightTalent(null)}
          >
            {/* Ambient glow behind photo */}
            <div className="absolute" style={{ width: "70vw", height: "70vw", maxWidth: 400, maxHeight: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(40px)", top: "50%", left: "50%", transform: "translate(-50%, -55%)" }} />
            {/* Photo */}
            <div className="relative" style={{ width: "75vw", maxWidth: 380, animation: "spotlightImgIn 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}>
              <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: "3/4", boxShadow: "0 0 80px rgba(139,92,246,0.2), 0 20px 60px rgba(0,0,0,0.5)" }}>
                <img src={getThumb(st)} alt={st.name} className="w-full h-full object-cover" style={{ objectPosition: "top" }} />
              </div>
            </div>
            {/* Name + info */}
            <div className="mt-6 text-center" style={{ animation: "spotlightImgIn 0.4s ease 0.2s both" }}>
              <h2 className="text-2xl font-bold text-white">{st.name}</h2>
              <p className="text-sm mt-1" style={{ color: "#8B5CF6" }}>{st.specialty}</p>
              <p className="text-xs mt-1" style={{ color: "#6b6b90" }}>{st.location}</p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4 mt-5" style={{ animation: "spotlightImgIn 0.4s ease 0.3s both" }}>
              <button onClick={(e) => { e.stopPropagation(); toggleFav(st.id, e); }} className="p-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <Heart size={22} color={favorites.includes(st.id) ? "#f43f5e" : "#fff"} fill={favorites.includes(st.id) ? "#f43f5e" : "none"} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setSpotlightTalent(null); openProfile(st); }} className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "#8B5CF6", color: "#fff" }}>
                Ver perfil
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleShare(st, e); }} className="p-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                {shareConfirm === st.id ? <Check size={22} color="#22c55e" /> : <Share2 size={22} color="#fff" />}
              </button>
            </div>
            {/* Hint */}
            <p className="mt-6 text-xs" style={{ color: "#4a4a6a" }}>Toca para cerrar</p>
          </div>
        );
      })()}

      {/* ── Cinematic Splash ── */}
      {showSplash && SPLASH_ENABLED && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center" style={{ background: "#12122a", animation: "splashBg 2.2s ease both" }}>
          {/* Lens flare */}
          <div className="absolute" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 60%)", animation: "splashFlare 2s ease both" }} />
          {/* Logo / Title */}
          <div className="text-center" style={{ animation: "splashLogo 2.2s cubic-bezier(0.22,1,0.36,1) both" }}>
            <h1 className="text-5xl font-black tracking-tight" style={{ fontFamily: "'Sora', sans-serif", background: "linear-gradient(135deg, #8B5CF6, #ec4899, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Tío Johnny
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: "#6b6b90" }}>Talento Chileno</p>
          </div>
        </div>
      )}

      {/* ── Cast mode toast ── */}
      {castToast && (
        <div className="fixed top-20 left-1/2 z-50 px-4 py-3 rounded-2xl text-sm text-center" style={{ transform: "translateX(-50%)", background: "#1e1e3a", border: "1px solid #8B5CF6", boxShadow: "0 8px 32px rgba(139,92,246,0.3)", maxWidth: "80vw", animation: "fadeSlideUp 0.3s ease both" }}>
          <p className="font-bold text-white mb-0.5">Modo Cast activado</p>
          <p style={{ color: "#9898b0", fontSize: 12 }}>Toca los perfiles que quieras incluir y luego envíalos juntos por WhatsApp.</p>
        </div>
      )}

      {/* ── Quick Cast floating bar ── */}
      {castMode && castSelected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3" style={{ background: "linear-gradient(to top, #12122a 60%, transparent)" }}>
          <button
            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #ec4899)" }}
            onClick={() => {
              const selected = talents.filter(t => castSelected.has(t.id));
              const origin = window.location.origin + window.location.pathname;
              const lines = selected.map(t => `• ${t.name} — ${formatRate(t.rate)}\n  ${origin}#/${toSlug(t.name)}`).join("\n\n");
              const msg = `Hola! Te comparto esta selección de talentos de TioJohnny.cl:\n\n${lines}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <Share2 size={18} /> Enviar {castSelected.size} perfil{castSelected.size !== 1 ? "es" : ""} por WhatsApp
          </button>
        </div>
      )}

      {/* ── Floating Hearts Overlay ── */}
      {floatingHearts.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {floatingHearts.map((h) => {
            const dx = h.tx - h.x;
            const dy = h.ty - h.y;
            return (
              <div
                key={h.id}
                style={{
                  position: "absolute",
                  left: h.x,
                  top: h.y,
                  "--fly-x1": `${dx * 0.2 + (Math.random() - 0.5) * 60}px`,
                  "--fly-y1": `${dy * 0.3 - 30}px`,
                  "--fly-x2": `${dx * 0.7 + (Math.random() - 0.5) * 40}px`,
                  "--fly-y2": `${dy * 0.7}px`,
                  "--fly-x3": `${dx}px`,
                  "--fly-y3": `${dy}px`,
                  animation: `flyHeart 0.9s cubic-bezier(0.22,1,0.36,1) ${h.delay}s both`,
                }}
              >
                <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}