import { useState, useRef, useEffect } from "react";
import {
  Search, Heart, X, ChevronLeft, ChevronRight, Phone, MessageCircle,
  MapPin, Filter, Lock, LogOut, Plus, Trash2, Edit3, Save, Eye, EyeOff,
  ArrowLeft, User, Camera, Settings, Loader2, AlertCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://ktnuedojmitfwoeugefx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnVlZG9qbWl0ZndvZXVnZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjYwMDcsImV4cCI6MjA5MTUwMjAwN30.x85014xsGKhIZji8GU4KqBA-8rPksgSJJBkRSkG4UPE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORIES = ["Todas", "Fashion", "Commercial", "Acting", "Extras"];
const CATEGORY_OPTIONS = ["Fashion", "Commercial", "Acting", "Extras"];

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER SVG (shown when no photos uploaded)
// ═══════════════════════════════════════════════════════════════════════════════
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

// Upload a photo to Supabase Storage and return its public URL
async function uploadPhoto(file, talentId) {
  const ext = file.name.split(".").pop();
  const fileName = `${talentId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("talent-photos")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

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
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function TioJohnny() {
  // ─── App state ─────────────────────────────────────────────────────────
  const [view, setView] = useState("public");
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

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
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

  // ─── Editor state ──────────────────────────────────────────────────────
  const [editorId, setEditorId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("");
  const [formCategory, setFormCategory] = useState("Fashion");
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
  const [formPhotos, setFormPhotos] = useState([]); // array of URLs (already uploaded)
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchRef = useRef(null);
  const fileRef = useRef(null);

  // ─── Load talents from Supabase on mount ───────────────────────────────
  useEffect(() => {
    fetchTalents();
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

  const fetchTalents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("talents")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setTalents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // ─── Helpers ───────────────────────────────────────────────────────────
  const getMainPhoto = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos[0] : generatePlaceholderSvg(t.id);
  };
  const getPhotos = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos : [generatePlaceholderSvg(t.id)];
  };

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const filtered = talents.filter((t) => {
    const matchCat = activeCategory === "Todas" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.specialty || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
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
      setFormCategory(talent.category || "Fashion");
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
      setFormPhotos(talent.photos || []);
    } else {
      setEditorId(null);
      setFormName(""); setFormSpecialty(""); setFormCategory("Fashion");
      setFormRate(""); setFormPhone(""); setFormLocation("");
      setFormAbout(""); setFormExperience("");
      setFormHeight(""); setFormWeight(""); setFormEyes("");
      setFormHair(""); setFormAge(""); setFormSizes("");
      setFormPhotos([]);
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

  const handleSaveProfile = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    const profileData = {
      name: formName,
      specialty: formSpecialty,
      category: formCategory,
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
      photos: formPhotos,
    };

    if (editorId) {
      // Update existing
      await supabase.from("talents").update(profileData).eq("id", editorId);
    } else {
      // Insert new
      await supabase.from("talents").insert([profileData]);
    }

    await fetchTalents();
    setSaving(false);
    setView("admin");
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

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="text-xs font-medium mb-2 block" style={{ color: "#9898b0" }}>Fotos del perfil</label>
            <div className="flex gap-3 flex-wrap">
              {formPhotos.map((photo, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ width: 72, height: 96 }}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFormPhoto(i)} className="absolute top-1 right-1 p-1 rounded-full" style={{ background: "rgba(244,63,94,0.9)" }}>
                    <X size={10} color="#fff" />
                  </button>
                  {i === 0 && (
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
            <p className="text-xs mt-2" style={{ color: "#4a4a6a" }}>Las fotos se suben directamente a la nube. La primera es la principal.</p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Nombre completo</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Ej: Valentina Rojas" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Especialidad</label>
                <input value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Fashion Model" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Categoría</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Tarifa</label>
                <input value={formRate} onChange={(e) => setFormRate(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="$80.000 / hr" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Teléfono</label>
                <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="+56912345678" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Ubicación</label>
              <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Santiago, RM" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Sobre (descripción)</label>
              <textarea value={formAbout} onChange={(e) => setFormAbout(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none" style={inputStyle} placeholder="Describe la trayectoria y especialidad..." />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Experiencia (una por línea)</label>
              <textarea value={formExperience} onChange={(e) => setFormExperience(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none" style={inputStyle} placeholder={"Vogue LATAM – Editorial 2025\nSantiago Fashion Week 2024"} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "#8B5CF6" }}>Medidas / Stats</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: formHeight, set: setFormHeight, label: "Altura", ph: "1.75m" },
                  { val: formWeight, set: setFormWeight, label: "Peso", ph: "58kg" },
                  { val: formEyes, set: setFormEyes, label: "Ojos", ph: "Café" },
                  { val: formHair, set: setFormHair, label: "Cabello", ph: "Castaño" },
                  { val: formAge, set: setFormAge, label: "Edad", ph: "24" },
                  { val: formSizes, set: setFormSizes, label: "Talla", ph: "S/M" },
                ].map((s) => (
                  <div key={s.label}>
                    <label className="block mb-1" style={{ fontSize: 10, color: "#7878a0" }}>{s.label}</label>
                    <input value={s.val} onChange={(e) => s.set(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none text-center" style={inputStyle} placeholder={s.ph} />
                  </div>
                ))}
              </div>
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
  if (view === "admin") {
    return (
      <div className="min-h-screen" style={{ background: "#12122a", color: "#fff" }}>
        <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock size={16} color="#8B5CF6" /> Admin Panel
            </h1>
            <p className="text-xs" style={{ color: "#7878a0" }}>{talents.length} perfiles &middot; {session?.user?.email}</p>
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

        <div className="px-4 py-3">
          <button onClick={() => openEditor(null)} className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95" style={{ background: "#8B5CF6" }}>
            <Plus size={18} /> Agregar Nueva Modelo
          </button>
        </div>

        <div className="px-4 pb-6 space-y-3">
          {talents.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#1e1e3a" }}>
              <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 56, height: 72 }}>
                <img src={getMainPhoto(t)} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                <p className="text-xs truncate" style={{ color: "#8B5CF6" }}>{t.specialty}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7878a0" }}>{t.rate} &middot; {(t.photos || []).length} fotos</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEditor(t)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }}>
                  <Edit3 size={16} color="#8B5CF6" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }}>
                  <Trash2 size={16} color="#f43f5e" />
                </button>
              </div>
            </div>
          ))}
          {talents.length === 0 && (
            <div className="text-center py-16">
              <User size={48} style={{ color: "#2a2a4a" }} className="mx-auto" />
              <p className="mt-4 text-sm" style={{ color: "#6b6b90" }}>No hay perfiles. Agrega tu primera modelo.</p>
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
    const images = getPhotos(t);
    const imgCount = images.length;
    const experienceList = (t.experience || "").split("\n").filter(Boolean);

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#12122a" }}>
        <div className="relative w-full" style={{ height: "55vh", minHeight: 300 }}>
          <img src={images[carouselIndex]} alt={t.name} className="w-full h-full object-cover" style={{ objectPosition: "top" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, #12122a 100%)" }} />
          <button onClick={() => setSelectedTalent(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
            <X size={22} color="#fff" />
          </button>
          <button onClick={(e) => toggleFav(t.id, e)} className="absolute top-4 left-4 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
            <Heart size={22} color={favorites.includes(t.id) ? "#f43f5e" : "#fff"} fill={favorites.includes(t.id) ? "#f43f5e" : "none"} />
          </button>
          {imgCount > 1 && (
            <>
              <button onClick={() => setCarouselIndex((i) => (i - 1 + imgCount) % imgCount)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.4)" }}>
                <ChevronLeft size={20} color="#fff" />
              </button>
              <button onClick={() => setCarouselIndex((i) => (i + 1) % imgCount)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.4)" }}>
                <ChevronRight size={20} color="#fff" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <span key={i} className="block rounded-full transition-all" style={{ width: i === carouselIndex ? 24 : 8, height: 8, background: i === carouselIndex ? "#8B5CF6" : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-32" style={{ color: "#e2e2f0" }}>
          <div className="mt-2">
            <h2 className="text-2xl font-bold text-white">{t.name}</h2>
            <p className="text-sm mt-1" style={{ color: "#8B5CF6" }}>{t.specialty} &middot; {t.rate}</p>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#9898b0" }}>
            <MapPin size={12} /> {t.location}
          </div>
          {t.about && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B5CF6" }}>Sobre</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c4c4d8" }}>{t.about}</p>
            </div>
          )}
          {experienceList.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B5CF6" }}>Experiencia</h3>
              <ul className="space-y-1">
                {experienceList.map((exp, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "#c4c4d8" }}>
                    <span style={{ color: "#8B5CF6" }}>•</span> {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(t.height || t.weight || t.eyes || t.hair || t.age || t.sizes) && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Medidas / Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Altura", value: t.height },
                  { label: "Peso", value: t.weight },
                  { label: "Ojos", value: t.eyes },
                  { label: "Cabello", value: t.hair },
                  { label: "Edad", value: t.age },
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

        <div className="fixed bottom-0 left-0 right-0 p-4 flex gap-3" style={{ background: "linear-gradient(to top, #12122a 70%, transparent)", paddingTop: 32 }}>
          <a href={`https://wa.me/${(t.phone || "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-transform active:scale-95" style={{ background: "#25D366" }}>
            <MessageCircle size={20} /> WhatsApp
          </a>
          <a href={`tel:${t.phone}`} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-transform active:scale-95" style={{ background: "#8B5CF6" }}>
            <Phone size={20} /> LLAMAR
          </a>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: PUBLIC DIRECTORY
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: "#12122a", color: "#fff" }}>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3" style={{ background: "rgba(18,18,42,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        {searchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <Search size={18} style={{ color: "#8B5CF6" }} />
            <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar modelo..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500" />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
              <X size={18} color="#888" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span style={{ color: "#8B5CF6" }}>Tio</span>Johnny
              <span className="text-xs font-normal ml-1" style={{ color: "#6b6b90" }}>.cl</span>
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
      </header>

      {session && view === "public" && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Admin activo</span>
          <button onClick={() => setView("admin")} className="text-xs px-3 py-1 rounded-full font-bold text-white" style={{ background: "#8B5CF6" }}>
            Panel Admin
          </button>
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all" style={{ background: active ? "#8B5CF6" : "#1e1e3a", color: active ? "#fff" : "#9898b0", border: active ? "none" : "1px solid #2a2a4a" }}>
              {cat}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-xs" style={{ color: "#6b6b90" }}>{filtered.length} modelo{filtered.length !== 1 ? "s" : ""}</p>
        <Filter size={14} style={{ color: "#6b6b90" }} />
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 pb-8">
        {filtered.map((t) => {
          const isFav = favorites.includes(t.id);
          return (
            <div key={t.id} onClick={() => { setSelectedTalent(t); setCarouselIndex(0); }} className="rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-95" style={{ background: "#1e1e3a" }}>
              <div className="relative" style={{ paddingBottom: "130%" }}>
                <img src={getMainPhoto(t)} alt={t.name} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "top" }} loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(18,18,42,0.95) 100%)" }} />
                <button onClick={(e) => toggleFav(t.id, e)} className="absolute top-2 right-2 p-2 rounded-full transition-all" style={{ background: "rgba(0,0,0,0.35)" }}>
                  <Heart size={16} color={isFav ? "#f43f5e" : "#fff"} fill={isFav ? "#f43f5e" : "none"} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-bold text-white leading-tight">{t.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#b8b8d0" }}>{t.specialty}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: "#8B5CF6" }}>{t.rate}</p>
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
          <button onClick={() => { setActiveCategory("Todas"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#8B5CF6", color: "#fff" }}>
            Ver todas
          </button>
        </div>
      )}

      {renderDetail()}
    </div>
  );
}