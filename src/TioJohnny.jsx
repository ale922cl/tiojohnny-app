import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, Heart, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Phone, MessageCircle,
  MapPin, Filter, Lock, LogOut, Plus, Trash2, Edit3, Save, Eye, EyeOff,
  ArrowLeft, User, Camera, Settings, Loader2, AlertCircle, Tag, GripVertical, Archive, ArchiveRestore, Share2, Check,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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
.card-enter { animation: fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
.modal-enter { animation: modalSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
.modal-exit  { animation: modalSlideDown 0.25s cubic-bezier(0.55,0,1,0.45) both; }
.heart-pop   { animation: heartPop 0.4s cubic-bezier(0.22,1,0.36,1); }
.pill-pop    { animation: pillPop 0.3s cubic-bezier(0.22,1,0.36,1); }
.badge-bounce { animation: favBadgeBounce 0.4s cubic-bezier(0.22,1,0.36,1); }
`;

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
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

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
  const [formPhotos, setFormPhotos] = useState([]); // array of URLs (already uploaded)
  const [formInstagram, setFormInstagram] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Animation state ────────────────────────────────────────────────
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [heartPopId, setHeartPopId] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [pillPopCat, setPillPopCat] = useState(null);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [cardAnimKey, setCardAnimKey] = useState(0); // triggers re-entrance animation
  const favPillRef = useRef(null);

  const searchRef = useRef(null);
  const fileRef = useRef(null);

  // Inject CSS animations once
  useEffect(() => { injectAnimStyles(); }, []);

  // ─── Load data from Supabase on mount ───────────────────────────────
  useEffect(() => {
    fetchTalents();
    fetchCategories();
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
      const hash = window.location.hash; // e.g. #/modelo/5
      const match = hash.match(/^#\/modelo\/(\d+)$/);
      if (match) {
        const id = parseInt(match[1]);
        const t = talentsRef.current.find((x) => x.id === id);
        if (t && !t.archived) {
          setSelectedTalent(t);
          setCarouselIndex(0);
          setView("public");
        }
      } else {
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

  // ─── Helpers ───────────────────────────────────────────────────────────
  const getMainPhoto = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos[0] : generatePlaceholderSvg(t.id);
  };
  const getPhotos = (t) => {
    const photos = t.photos || [];
    return photos.length > 0 ? photos : [generatePlaceholderSvg(t.id)];
  };

  const toggleFav = useCallback((id, e) => {
    e.stopPropagation();
    const adding = !favorites.includes(id);
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

    // Heart pop animation on the button
    setHeartPopId(id);
    setTimeout(() => setHeartPopId(null), 450);

    if (adding) {
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

  // Helper: get categories array from a talent (supports old string format + new array format)
  const getTalentCategories = (t) => {
    if (Array.isArray(t.category)) return t.category;
    if (typeof t.category === "string" && t.category) return [t.category];
    return [];
  };

  const filtered = talents.filter((t) => {
    if (t.archived) return false; // never show archived in public
    const talentCats = getTalentCategories(t);
    const matchCat = activeCategory === "Todas" || (activeCategory === "Favoritas" ? favorites.includes(t.id) : talentCats.includes(activeCategory));
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
      setFormPhotos(talent.photos || []);
      setFormInstagram(talent.instagram || "");
    } else {
      setEditorId(null);
      setFormName(""); setFormSpecialty(""); setFormCategories([]);
      setFormRate(""); setFormPhone(""); setFormLocation("");
      setFormAbout(""); setFormExperience("");
      setFormHeight(""); setFormWeight(""); setFormEyes("");
      setFormHair(""); setFormAge(""); setFormSizes("");
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

  // Animated category switching
  const switchCategory = useCallback((cat) => {
    setActiveCategory(cat);
    setCardAnimKey((k) => k + 1); // re-trigger entrance animations
    setPillPopCat(cat);
    setTimeout(() => setPillPopCat(null), 350);
  }, []);

  // Open profile with URL update
  const openProfile = useCallback((t) => {
    setSelectedTalent(t);
    setCarouselIndex(0);
    window.history.pushState(null, "", `#/modelo/${t.id}`);
  }, []);

  // Animated modal close
  const closeDetail = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedTalent(null);
      setModalClosing(false);
      // Clear hash without triggering hashchange reload
      window.history.pushState(null, "", window.location.pathname);
    }, 250);
  }, []);

  // ─── Share handler ──────────────────────────────────────────────────
  const [shareConfirm, setShareConfirm] = useState(null); // talent id that just got "copied" feedback
  const handleShare = useCallback(async (t, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/modelo/${t.id}`;
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

  // Split talents into active and archived for admin
  const activeTalents = talents.filter((t) => !t.archived);
  const archivedTalents = talents.filter((t) => t.archived);

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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Especialidad</label>
                <input value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Fashion Model" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Categorías</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categoryNames.map((c) => {
                    const isSelected = formCategories.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => setFormCategories((prev) => isSelected ? prev.filter((x) => x !== c) : [...prev, c])} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{ background: isSelected ? "#8B5CF6" : "#12122a", color: isSelected ? "#fff" : "#9898b0", border: isSelected ? "2px solid #8B5CF6" : "1px solid #2a2a4a" }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Ubicación</label>
                <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="Santiago, RM" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#9898b0" }}>Instagram (opcional)</label>
                <input value={formInstagram} onChange={(e) => setFormInstagram(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={inputStyle} placeholder="@valentina.rojas" />
              </div>
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
                <img src={getMainPhoto(t)} alt={t.name} className="w-full h-full object-cover" />
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
                <button onClick={() => handleArchive(t.id, true)} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: "#2a2a4a" }} title="Archivar">
                  <Archive size={16} color="#f59e0b" />
                </button>
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
                  <img src={getMainPhoto(t)} alt={t.name} className="w-full h-full object-cover" />
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
      <div className={`fixed inset-0 z-50 flex flex-col ${modalClosing ? "modal-exit" : "modal-enter"}`} style={{ background: "#12122a" }}>
        <div className="relative w-full" style={{ height: "55vh", minHeight: 300 }}>
          <img src={images[carouselIndex]} alt={t.name} className="w-full h-full object-cover" style={{ objectPosition: "top" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, #12122a 100%)" }} />
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={(e) => handleShare(t, e)} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
              {shareConfirm === t.id ? <Check size={22} color="#22c55e" /> : <Share2 size={22} color="#fff" />}
            </button>
            <button onClick={closeDetail} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
              <X size={22} color="#fff" />
            </button>
          </div>
          <button onClick={(e) => toggleFav(t.id, e)} className={`absolute top-4 left-4 p-2 rounded-full ${heartPopId === t.id ? "heart-pop" : ""}`} style={{ background: "rgba(0,0,0,0.5)" }}>
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

        <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-10 flex items-center justify-center gap-4" style={{ background: "linear-gradient(to top, #12122a 60%, transparent)" }}>
          {/* WhatsApp */}
          <a href={`https://wa.me/${(t.phone || "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="w-13 h-13 rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "#25D366" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: "#25D366" }}>WhatsApp</span>
          </a>
          {/* Call */}
          <a href={`tel:${t.phone}`} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
            <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "#8B5CF6" }}>
              <Phone size={20} color="#fff" />
            </div>
            <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Llamar</span>
          </a>
          {/* Instagram (only if they have one) */}
          {t.instagram && (
            <a href={`https://instagram.com/${t.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 transition-transform active:scale-90">
              <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#E1306C" }}>Instagram</span>
            </a>
          )}
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

      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-xs" style={{ color: "#6b6b90" }}>{filtered.length} modelo{filtered.length !== 1 ? "s" : ""}</p>
        <Filter size={14} style={{ color: "#6b6b90" }} />
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 pb-8">
        {filtered.map((t, idx) => {
          const isFav = favorites.includes(t.id);
          return (
            <div
              key={`${t.id}-${cardAnimKey}`}
              onClick={() => openProfile(t)}
              className="card-enter rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: "#1e1e3a", animationDelay: `${idx * 0.06}s` }}
            >
              <div className="relative" style={{ paddingBottom: "130%" }}>
                <img src={getMainPhoto(t)} alt={t.name} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "top" }} loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(18,18,42,0.95) 100%)" }} />
                <button
                  onClick={(e) => toggleFav(t.id, e)}
                  className={`absolute top-2 right-2 p-2 rounded-full ${heartPopId === t.id ? "heart-pop" : ""}`}
                  style={{ background: "rgba(0,0,0,0.35)", transition: "transform 0.2s ease" }}
                >
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
          <button onClick={() => { switchCategory("Todas"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#8B5CF6", color: "#fff" }}>
            Ver todas
          </button>
        </div>
      )}

      {renderDetail()}

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