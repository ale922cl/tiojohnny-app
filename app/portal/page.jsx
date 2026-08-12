"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadPhoto, uploadVideo, uploadStory } from "@/lib/photos";
import {
  COMUNAS, NATIONALITIES, EYE_COLORS, HAIR_COLORS, HEIGHTS, AGES, WEIGHTS,
  matchOption, optionsForValue,
} from "@/lib/options";

const BG = "#12122a";
const CARD = "#1e1e3a";
const ACCENT = "#8B5CF6";
const inputStyle = {
  background: BG,
  border: "1px solid rgba(139,92,246,0.25)",
  borderRadius: 12,
  color: "#fff",
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span style={{ fontSize: 12, color: "#9898b0", display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, textarea }) {
  return (
    <Field label={label}>
      {textarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      )}
    </Field>
  );
}

function SelectField({ label, value, onChange, options }) {
  const opts = optionsForValue(options, value);
  return (
    <Field label={label}>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
        <option value="">Seleccionar…</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export default function PortalPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [talent, setTalent] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "forgot"
  const [resetSent, setResetSent] = useState(false);
  const [forcePw, setForcePw] = useState(false); // must set a new password before continuing

  // editor form
  const [form, setForm] = useState({});
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef(null);
  const [vidUploading, setVidUploading] = useState(false);
  const [vidErr, setVidErr] = useState("");
  const videoRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyErr, setStoryErr] = useState("");
  const storyRef = useRef(null);

  // change password
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleChangePassword = async () => {
    setPwMsg("");
    if (newPass.length < 6) { setPwMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    if (newPass !== newPass2) { setPwMsg("Las contraseñas no coinciden."); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPwBusy(false);
    if (error) { setPwMsg("Error: " + error.message); return; }
    setNewPass(""); setNewPass2("");
    setPwMsg("¡Contraseña actualizada! ✅");
    setTimeout(() => setPwMsg(""), 3000);
  };

  const refreshStories = useCallback(async (tid) => {
    // RLS returns only non-expired stories (that's what makes them expire).
    const { data } = await supabase.from("stories").select("*").eq("talent_id", tid).order("created_at", { ascending: false });
    setStories(data || []);
  }, []);

  const loadTalent = useCallback(async (userId) => {
    const { data } = await supabase.from("talents").select("*").eq("owner_id", userId).limit(1).maybeSingle();
    if (data) {
      setTalent(data);
      setForm({
        name: data.name || "",
        specialty: data.specialty || "",
        rate: data.rate || "",
        phone: data.phone || "",
        instagram: data.instagram || "",
        about: data.about || "",
        experience: data.experience || "",
        sizes: data.sizes || "",
        // categorical — canonicalize on load so saving cleans old free-text
        location: matchOption(data.location, COMUNAS) || data.location || "",
        nationality: matchOption(data.nationality, NATIONALITIES) || data.nationality || "",
        eyes: matchOption(data.eyes, EYE_COLORS) || data.eyes || "",
        hair: matchOption(data.hair, HAIR_COLORS) || data.hair || "",
        height: matchOption(data.height, HEIGHTS) || data.height || "",
        age: matchOption(data.age, AGES) || data.age || "",
        weight: matchOption(data.weight, WEIGHTS) || data.weight || "",
      });
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
      setVideos(Array.isArray(data.videos) ? data.videos : []);
      setCategories(Array.isArray(data.category) ? data.category : []);
      refreshStories(data.id);
    } else {
      setTalent(null);
    }
    setLoading(false);
  }, [refreshStories]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        if (s.user?.user_metadata?.must_change_password) setForcePw(true);
        loadTalent(s.user.id);
      } else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setForcePw(true);
      if (s) {
        if (s.user?.user_metadata?.must_change_password) setForcePw(true);
        setLoading(true); loadTalent(s.user.id);
      } else { setTalent(null); setForcePw(false); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [loadTalent]);

  useEffect(() => {
    supabase.from("categories").select("name").order("name").then(({ data }) => {
      if (data) setAllCategories(data.map((c) => c.name).filter(Boolean));
    });
  }, []);

  const handleLogin = async () => {
    setLoginErr("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setLoginErr("Email o contraseña incorrectos.");
    setLoggingIn(false);
  };

  const handleForgot = async () => {
    setLoginErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setLoginErr("Ingresa un email válido."); return; }
    setLoggingIn(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/portal`,
    });
    setLoggingIn(false);
    if (error) setLoginErr(error.message);
    else setResetSent(true);
  };

  // Set a new password (used for first-login and recovery). Clears the flag.
  const handleForcedChange = async () => {
    setPwMsg("");
    if (newPass.length < 6) { setPwMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    if (newPass !== newPass2) { setPwMsg("Las contraseñas no coinciden."); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPass, data: { must_change_password: false } });
    setPwBusy(false);
    if (error) { setPwMsg("Error: " + error.message); return; }
    setNewPass(""); setNewPass2(""); setForcePw(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setForm({}); setPhotos([]); setCategories([]); setForcePw(false);
  };

  // ── photos ──
  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !talent) return;
    setUploadErr(""); setUploading(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadPhoto(f, talent.id));
      setPhotos((prev) => [...prev, ...urls]);
    } catch (e) {
      setUploadErr(e.message || "No se pudo subir la imagen.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };
  const removePhoto = (i) => setPhotos((p) => p.filter((_, idx) => idx !== i));
  const setPrimary = (i) => setPhotos((p) => (i === 0 ? p : [p[i], ...p.filter((_, idx) => idx !== i)]));
  const movePhoto = (i, dir) => setPhotos((p) => {
    const j = i + dir;
    if (j < 0 || j >= p.length) return p;
    const c = [...p]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });

  // ── videos (max 3 per profile) ──
  const MAX_VIDEOS = 3;
  const addVideos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !talent) return;
    const remaining = MAX_VIDEOS - videos.length;
    if (remaining <= 0) { setVidErr(`Máximo ${MAX_VIDEOS} videos por perfil.`); return; }
    const toUpload = files.slice(0, remaining);
    setVidErr(""); setVidUploading(true);
    try {
      const urls = [];
      for (const f of toUpload) urls.push(await uploadVideo(f, talent.id));
      setVideos((prev) => [...prev, ...urls]);
      if (files.length > remaining) setVidErr(`Solo se agregaron ${remaining} — el máximo es ${MAX_VIDEOS} videos.`);
    } catch (e) {
      setVidErr(e.message || "No se pudo subir el video.");
    }
    setVidUploading(false);
    if (videoRef.current) videoRef.current.value = "";
  };
  const removeVideo = (i) => setVideos((v) => v.filter((_, idx) => idx !== i));
  const moveVideo = (i, dir) => setVideos((v) => {
    const j = i + dir;
    if (j < 0 || j >= v.length) return v;
    const c = [...v]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });

  // ── stories (max 5 per 24h, expire after 24h — saved immediately) ──
  const MAX_STORIES = 5;
  const addStories = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !talent) return;
    const remaining = MAX_STORIES - stories.length;
    if (remaining <= 0) { setStoryErr(`Máximo ${MAX_STORIES} historias cada 24 horas.`); return; }
    setStoryErr(""); setStoryBusy(true);
    try {
      for (const f of files.slice(0, remaining)) {
        const { url, media_type } = await uploadStory(f, talent.id);
        const { error } = await supabase.from("stories").insert([{ talent_id: talent.id, media_url: url, media_type }]);
        if (error) throw new Error(error.message.includes("STORY_LIMIT") ? `Máximo ${MAX_STORIES} historias cada 24 horas.` : error.message);
      }
      if (files.length > remaining) setStoryErr(`Solo se agregaron ${remaining} — el máximo es ${MAX_STORIES} cada 24 h.`);
      await refreshStories(talent.id);
    } catch (e) {
      setStoryErr(e.message || "No se pudo subir la historia.");
    }
    setStoryBusy(false);
    if (storyRef.current) storyRef.current.value = "";
  };
  const deleteStory = async (id) => {
    await supabase.from("stories").delete().eq("id", id);
    if (talent) refreshStories(talent.id);
  };
  const hoursLeft = (expires) => Math.max(0, Math.round((new Date(expires).getTime() - Date.now()) / 3600000));

  const toggleCategory = (name) =>
    setCategories((c) => (c.includes(name) ? c.filter((x) => x !== name) : [...c, name]));

  const handleSave = async () => {
    if (!talent) return;
    setSaving(true); setSavedMsg("");
    const payload = { ...form, category: categories, photos, videos };
    const { error } = await supabase.from("talents").update(payload).eq("id", talent.id);
    setSaving(false);
    setSavedMsg(error ? `Error al guardar: ${error.message}` : "¡Guardado! ✅");
    if (!error) setTimeout(() => setSavedMsg(""), 3000);
  };

  // ── render ──
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin" style={{ width: 28, height: 28, border: `3px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 380, background: CARD, borderRadius: 20, padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            <span style={{ color: ACCENT }}>Tio</span>Johnny <span style={{ color: "#6b6b90", fontSize: 14 }}>· Portal</span>
          </h1>
          {authMode === "forgot" ? (
            resetSent ? (
              <div>
                <p style={{ color: "#c4c4d8", fontSize: 14, marginTop: 12, marginBottom: 6 }}>📧 Te enviamos un correo con un enlace para restablecer tu contraseña.</p>
                <p style={{ color: "#7878a0", fontSize: 12, marginBottom: 18 }}>Revisa tu bandeja (y spam). Abre el enlace desde este teléfono.</p>
                <button onClick={() => { setAuthMode("login"); setResetSent(false); }} style={{ color: ACCENT, fontSize: 14 }}>← Volver a ingresar</button>
              </div>
            ) : (
              <>
                <p style={{ color: "#9898b0", fontSize: 13, marginBottom: 20 }}>Ingresa tu email y te enviamos un enlace para crear una nueva contraseña.</p>
                <div className="space-y-3">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle}
                    onKeyDown={(e) => e.key === "Enter" && handleForgot()} />
                  {loginErr && <p style={{ color: "#f87171", fontSize: 13 }}>{loginErr}</p>}
                  <button onClick={handleForgot} disabled={loggingIn}
                    style={{ width: "100%", background: ACCENT, color: "#fff", fontWeight: 700, padding: "11px", borderRadius: 12, opacity: loggingIn ? 0.6 : 1 }}>
                    {loggingIn ? "Enviando…" : "Enviar enlace"}
                  </button>
                  <button onClick={() => { setAuthMode("login"); setLoginErr(""); }} style={{ color: "#9898b0", fontSize: 13, width: "100%" }}>← Volver</button>
                </div>
              </>
            )
          ) : (
            <>
              <p style={{ color: "#9898b0", fontSize: 13, marginBottom: 20 }}>Ingresa para administrar tu perfil.</p>
              <div className="space-y-3">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                {loginErr && <p style={{ color: "#f87171", fontSize: 13 }}>{loginErr}</p>}
                <button onClick={handleLogin} disabled={loggingIn}
                  style={{ width: "100%", background: ACCENT, color: "#fff", fontWeight: 700, padding: "11px", borderRadius: 12, opacity: loggingIn ? 0.6 : 1 }}>
                  {loggingIn ? "Ingresando…" : "Ingresar"}
                </button>
                <button onClick={() => { setAuthMode("forgot"); setLoginErr(""); }} style={{ color: "#9898b0", fontSize: 13, width: "100%" }}>¿Olvidaste tu contraseña?</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (forcePw) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 380, background: CARD, borderRadius: 20, padding: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Crea tu contraseña 🔒</h1>
          <p style={{ color: "#9898b0", fontSize: 13, marginBottom: 20 }}>Por seguridad, elige una contraseña nueva para continuar.</p>
          <div className="space-y-3">
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nueva contraseña (mín. 6)" style={inputStyle} />
            <input type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} placeholder="Repite la contraseña" style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && handleForcedChange()} />
            {pwMsg && <p style={{ fontSize: 13, color: pwMsg.startsWith("Error") || pwMsg.includes("no coinciden") || pwMsg.includes("al menos") ? "#f87171" : "#22c55e" }}>{pwMsg}</p>}
            <button onClick={handleForcedChange} disabled={pwBusy || !newPass}
              style={{ width: "100%", background: ACCENT, color: "#fff", fontWeight: 700, padding: "11px", borderRadius: 12, opacity: pwBusy || !newPass ? 0.6 : 1 }}>
              {pwBusy ? "Guardando…" : "Guardar y continuar"}
            </button>
            <button onClick={handleLogout} style={{ color: "#9898b0", fontSize: 13, width: "100%" }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <p style={{ fontSize: 15, marginBottom: 6 }}>Tu cuenta aún no está vinculada a un perfil.</p>
          <p style={{ color: "#9898b0", fontSize: 13, marginBottom: 18 }}>Contacta al administrador para que active tu perfil.</p>
          <button onClick={handleLogout} style={{ color: ACCENT, fontSize: 14 }}>Cerrar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(18,18,42,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(139,92,246,0.15)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>
          <span style={{ color: ACCENT }}>Tio</span>Johnny <span style={{ color: "#6b6b90", fontSize: 13, fontWeight: 400 }}>· Mi perfil</span>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 13, color: "#9898b0" }}>Cerrar sesión</button>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 120px" }}>
        {/* Stories */}
        <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>
            Historias <span style={{ fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#6b6b90" }}>· duran 24 h</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {stories.map((s) => (
              <div key={s.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                {s.media_type === "video"
                  ? <video src={s.media_url} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <img src={s.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>
                  {s.media_type === "video" ? "▶ " : ""}{hoursLeft(s.expires_at)}h
                </span>
                <button onClick={() => deleteStory(s.id)} title="Eliminar" style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#f87171", fontSize: 13, width: 22, height: 22, borderRadius: "50%" }}>✕</button>
              </div>
            ))}
            {stories.length < MAX_STORIES && (
              <button onClick={() => storyRef.current?.click()} disabled={storyBusy}
                style={{ aspectRatio: "3/4", borderRadius: 12, border: "1.5px dashed rgba(139,92,246,0.5)", color: ACCENT, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {storyBusy ? "Subiendo…" : <><span style={{ fontSize: 24 }}>＋</span>Agregar</>}
              </button>
            )}
          </div>
          <input ref={storyRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" multiple className="hidden" onChange={(e) => addStories(e.target.files)} />
          {storyErr && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>{storyErr}</p>}
          <p style={{ color: "#6b6b90", fontSize: 11, marginTop: 8 }}>Foto o video · desaparecen a las 24 h · máximo {MAX_STORIES} cada 24 h.</p>
        </section>

        {/* Photos */}
        <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>Fotos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {photos.map((url, i) => (
              <div key={url + i} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", border: i === 0 ? `2px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)" }}>
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {i === 0 && (
                  <span style={{ position: "absolute", top: 4, left: 4, background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>PRINCIPAL</span>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.55)", padding: "4px 6px" }}>
                  <button onClick={() => movePhoto(i, -1)} disabled={i === 0} title="Mover" style={{ color: i === 0 ? "#555" : "#fff", fontSize: 14 }}>◀</button>
                  {i !== 0 && <button onClick={() => setPrimary(i)} title="Hacer principal" style={{ color: "#fbbf24", fontSize: 13 }}>★</button>}
                  <button onClick={() => movePhoto(i, 1)} disabled={i === photos.length - 1} title="Mover" style={{ color: i === photos.length - 1 ? "#555" : "#fff", fontSize: 14 }}>▶</button>
                  <button onClick={() => removePhoto(i)} title="Eliminar" style={{ color: "#f87171", fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ aspectRatio: "3/4", borderRadius: 12, border: "1.5px dashed rgba(139,92,246,0.5)", color: ACCENT, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {uploading ? "Subiendo…" : <><span style={{ fontSize: 24 }}>＋</span>Agregar</>}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          {uploadErr && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>{uploadErr}</p>}
          <p style={{ color: "#6b6b90", fontSize: 11, marginTop: 8 }}>La primera foto es la principal. Usa ◀ ▶ para ordenar y ★ para elegir la principal.</p>
        </section>

        {/* Videos */}
        <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>Videos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {videos.map((url, i) => (
              <div key={url + i} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                <video src={url} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>▶ VIDEO</div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.55)", padding: "4px 6px" }}>
                  <button onClick={() => moveVideo(i, -1)} disabled={i === 0} title="Mover" style={{ color: i === 0 ? "#555" : "#fff", fontSize: 14 }}>◀</button>
                  <button onClick={() => moveVideo(i, 1)} disabled={i === videos.length - 1} title="Mover" style={{ color: i === videos.length - 1 ? "#555" : "#fff", fontSize: 14 }}>▶</button>
                  <button onClick={() => removeVideo(i)} title="Eliminar" style={{ color: "#f87171", fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}
            {videos.length < MAX_VIDEOS && (
              <button onClick={() => videoRef.current?.click()} disabled={vidUploading}
                style={{ aspectRatio: "3/4", borderRadius: 12, border: "1.5px dashed rgba(139,92,246,0.5)", color: ACCENT, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {vidUploading ? "Subiendo…" : <><span style={{ fontSize: 24 }}>＋</span>Agregar</>}
              </button>
            )}
          </div>
          <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" multiple className="hidden" onChange={(e) => addVideos(e.target.files)} />
          {vidErr && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>{vidErr}</p>}
          <p style={{ color: "#6b6b90", fontSize: 11, marginTop: 8 }}>Máximo {MAX_VIDEOS} videos · MP4, MOV o WebM · hasta 50 MB cada uno.</p>
        </section>

        {/* Details */}
        <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>Mis datos</h2>
          <div className="space-y-3">
            <TextField label="Nombre" value={form.name} onChange={(v) => setF("name", v)} />
            <TextField label="Especialidad" value={form.specialty} onChange={(v) => setF("specialty", v)} placeholder="Ej: Modelo, animadora…" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SelectField label="Comuna" value={form.location} onChange={(v) => setF("location", v)} options={COMUNAS} />
              <SelectField label="Nacionalidad" value={form.nationality} onChange={(v) => setF("nationality", v)} options={NATIONALITIES} />
              <SelectField label="Edad" value={form.age} onChange={(v) => setF("age", v)} options={AGES} />
              <SelectField label="Estatura" value={form.height} onChange={(v) => setF("height", v)} options={HEIGHTS} />
              <SelectField label="Peso" value={form.weight} onChange={(v) => setF("weight", v)} options={WEIGHTS} />
              <SelectField label="Color de ojos" value={form.eyes} onChange={(v) => setF("eyes", v)} options={EYE_COLORS} />
              <SelectField label="Color de pelo" value={form.hair} onChange={(v) => setF("hair", v)} options={HAIR_COLORS} />
              <TextField label="Medidas" value={form.sizes} onChange={(v) => setF("sizes", v)} placeholder="90-60-90" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <TextField label="Tarifa" value={form.rate} onChange={(v) => setF("rate", v)} placeholder="$80.000" />
              <TextField label="WhatsApp" value={form.phone} onChange={(v) => setF("phone", v)} placeholder="+56 9…" />
            </div>
            <TextField label="Instagram" value={form.instagram} onChange={(v) => setF("instagram", v)} placeholder="@usuario" />
            <TextField label="Sobre mí" value={form.about} onChange={(v) => setF("about", v)} textarea />
            <TextField label="Experiencia" value={form.experience} onChange={(v) => setF("experience", v)} textarea />
          </div>
        </section>

        {/* Categories */}
        {allCategories.length > 0 && (
          <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>Categorías</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allCategories.map((name) => {
                const on = categories.includes(name);
                return (
                  <button key={name} onClick={() => toggleCategory(name)}
                    style={{ padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: on ? ACCENT : "transparent", color: on ? "#fff" : "#9898b0", border: `1px solid ${on ? ACCENT : "rgba(255,255,255,0.15)"}` }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Change password */}
        <section style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 12 }}>Seguridad</h2>
          <div className="space-y-3">
            <Field label="Nueva contraseña">
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />
            </Field>
            <Field label="Repetir contraseña">
              <input type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} placeholder="Repite la contraseña" style={inputStyle} />
            </Field>
            {pwMsg && <p style={{ fontSize: 13, color: pwMsg.startsWith("Error") || pwMsg.includes("no coinciden") || pwMsg.includes("al menos") ? "#f87171" : "#22c55e" }}>{pwMsg}</p>}
            <button onClick={handleChangePassword} disabled={pwBusy || !newPass}
              style={{ background: "rgba(139,92,246,0.15)", color: ACCENT, border: "1px solid rgba(139,92,246,0.4)", borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 600, opacity: pwBusy || !newPass ? 0.5 : 1 }}>
              {pwBusy ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </div>
        </section>
      </main>

      {/* Save bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(18,18,42,0.95)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(139,92,246,0.2)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 13, color: savedMsg.startsWith("Error") ? "#f87171" : "#22c55e" }}>{savedMsg}</span>
        <button onClick={handleSave} disabled={saving}
          style={{ background: ACCENT, color: "#fff", fontWeight: 700, padding: "11px 28px", borderRadius: 12, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
