import { supabase } from "./supabaseClient";

// Burn "tiojohnny.cl" watermark onto a photo via Canvas, resize to max
// 1500px on the longest side, and return a JPEG File (~300-500KB).
export async function applyWatermark(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX = 1500;
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const shortSide = Math.min(canvas.width, canvas.height);
      const fontSize = Math.round(shortSide * 0.052);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = Math.round(fontSize * 0.55);
      ctx.shadowOffsetX = Math.round(fontSize * 0.06);
      ctx.shadowOffsetY = Math.round(fontSize * 0.06);
      ctx.font = `700 ${fontSize}px 'Sora', 'Arial', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("tiojohnny.cl", canvas.width / 2, canvas.height * 0.72);
      ctx.restore();

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], file.name, { type: "image/jpeg" }))
            : reject(new Error("Canvas toBlob failed")),
        "image/jpeg",
        0.82
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function validateImageFile(file) {
  if (!file) throw new Error("No se seleccionó ningún archivo.");
  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("image/") || !ALLOWED_IMAGE_TYPES.includes(type)) {
    throw new Error("Formato no permitido. Sube una imagen JPG, PNG o WebP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`La imagen es muy grande (máx ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`);
  }
}

// Upload one photo to the talent's storage folder; return its public URL.
export async function uploadPhoto(file, talentId) {
  validateImageFile(file);
  const watermarked = await applyWatermark(file);
  const fileName = `${talentId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const { data, error } = await supabase.storage
    .from("talent-photos")
    .upload(fileName, watermarked, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("talent-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase default per-file limit)
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function validateVideoFile(file) {
  if (!file) throw new Error("No se seleccionó ningún archivo.");
  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("video/") || !ALLOWED_VIDEO_TYPES.includes(type)) {
    throw new Error("Formato no permitido. Sube un video MP4, MOV o WebM.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`El video es muy grande (máx ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} MB).`);
  }
}

// Upload one video to the talent's storage folder; return its public URL.
// (No watermark/transform — videos are stored as-is.)
export async function uploadVideo(file, talentId) {
  validateVideoFile(file);
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const fileName = `${talentId}/video_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("talent-photos")
    .upload(fileName, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("talent-photos").getPublicUrl(data.path);
  return urlData.publicUrl;
}
