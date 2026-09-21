// Format Registry (ฝั่ง frontend) — ความรู้เฉพาะแต่ละ "ประเภทงาน" อยู่ที่นี่ที่เดียว
// กติกาเหล็ก: ห้ามมี if (format === "drama"/"review"/...) นอกไฟล์นี้ — เพิ่มแนวใหม่ = เพิ่ม entry ที่นี่
// คู่ขนานกับ server/formats.mjs (ฝั่ง scaffold/API)
import {
  buildDramaShotGenCommand,
  buildReviewShotGenCommand,
  buildDramaCoverCommand,
  buildReviewCoverCommand,
} from "./builders.js";

// ป้ายคำของ view แบบ "เรื่องเป็นหน่วย" (drama/review ใช้ story view ร่วมกัน ต่างแค่คำ)
const DRAMA_LABELS = {
  pill: "ละครสั้น",
  studioButton: "Drama Studio",
  studioName: "Drama Studio",
  unitAt: "เรื่องที่",
  unitPlural: "เรื่องทั้งหมด",
  overviewKicker: "Stories",
  detailKicker: "Story",
  backLabel: "กลับหน้ารวมเรื่อง",
  sceneWord: "ฉาก",
  scenesHeading: "ฉากทั้งหมด",
  scenesKicker: "Scenes",
  castWord: "ตัวละคร",
  castAll: "ตัวละครทั้งหมด",
  castInStory: "ตัวละครในเรื่องนี้",
  castMain: "ตัวละครหลัก",
  coverHint: "ยังไม่มีปก — ลากภาพโปสเตอร์มาวาง",
};

const SURREAL_LABELS = {
  pill: "คลิปเหนือจริง",
  studioButton: "Surreal Clip Studio",
  studioName: "Surreal Clip Studio",
  unitAt: "คลิปที่",
  unitPlural: "คลิปทั้งหมด",
  overviewKicker: "Surreal Clips",
  detailKicker: "Clip",
  backLabel: "กลับหน้ารวมคลิป",
  sceneWord: "ฉาก",
  scenesHeading: "ช็อต/ฉาก",
  scenesKicker: "Scenes",
  castWord: "ตัวละคร",
  castAll: "ตัวละครทั้งหมด",
  castInStory: "ตัวละครในคลิปนี้",
  castMain: "ตัวละครหลัก",
  coverHint: "ยังไม่มีปก — ลากภาพปกคลิปมาวาง",
};

const REVIEW_LABELS = {
  pill: "รีวิวสินค้า",
  studioButton: "Review Studio",
  studioName: "Review Studio",
  unitAt: "รีวิวที่",
  unitPlural: "รีวิวทั้งหมด",
  overviewKicker: "Reviews",
  detailKicker: "Review",
  backLabel: "← กลับหน้ารวมรีวิว",
  sceneWord: "คลิป",
  scenesHeading: "คลิปทั้งหมด",
  scenesKicker: "Clips",
  castWord: "พรีเซนเตอร์",
  castAll: "พรีเซนเตอร์ทั้งหมด",
  castInStory: "พรีเซนเตอร์ในรีวิวนี้",
  castMain: "พรีเซนเตอร์ของเพจ",
  coverHint: "ยังไม่มีปก — ลากภาพสินค้า/ชีทมาวาง",
};

// registry หลัก
//   isStory      ใช้ story/scene view ไหม (drama/review = true, infographic = false)
//   labels       ป้ายคำของ story view (null ถ้าไม่ใช่ story)
//   shotGen      ฟังก์ชันสร้างคำสั่ง gen ภาพช็อต (null ถ้าไม่มี)
//   coverCmd     ฟังก์ชันสร้างคำสั่ง gen ภาพปกเรื่อง/รีวิว (null ถ้าไม่มีปก)
//   studioKey    key ของ studio modal (ใช้ map ใน App); null = ไม่มี studio
//   shopLink     มี "พิกัดสินค้า" (ลิงก์ซื้อ) ไหม — งานขายเท่านั้น
export const FORMATS = {
  infographic: {
    id: "infographic",
    label: "อินโฟกราฟฟิก",
    isStory: false,
    labels: null,
    shotGen: null,
    coverCmd: null,
    studioKey: null,
    shopLink: false,
  },
  drama: {
    id: "drama",
    label: "ละครสั้น",
    isStory: true,
    labels: DRAMA_LABELS,
    shotGen: buildDramaShotGenCommand,
    coverCmd: buildDramaCoverCommand,
    studioKey: "drama",
    shopLink: false,
  },
  review: {
    id: "review",
    label: "รีวิวสินค้า UGC",
    isStory: true,
    labels: REVIEW_LABELS,
    shotGen: buildReviewShotGenCommand,
    coverCmd: buildReviewCoverCommand,
    studioKey: "review",
    shopLink: true,
  },
};

export function getFormat(id) {
  return FORMATS[id] || FORMATS.infographic;
}

// normalize ค่า format ที่อ่านจาก config (ค่าที่ไม่รู้จัก → infographic)
export function normalizeFormat(raw) {
  return FORMATS[raw] ? raw : "infographic";
}

// เพจ/โปรเจกต์นี้เป็นแนว "เรื่องเป็นหน่วย" ไหม (ใช้แทน isStoryPage เดิม)
export function isStoryPage(page) {
  return getFormat(page?.type).isStory;
}

// ป้ายคำของ story view (fallback = drama labels เพื่อความปลอดภัย)
export function storyLabels(page) {
  if (page?.contentMode === "surreal") return SURREAL_LABELS;
  return getFormat(page?.type).labels || DRAMA_LABELS;
}

// ฟังก์ชันสร้างคำสั่ง gen ปกของ format นี้ (null ถ้าไม่มีปก)
export function coverCommandFor(page) {
  return getFormat(page?.type).coverCmd;
}

// ฟังก์ชันสร้างคำสั่ง gen ภาพช็อตของ format นี้ (null ถ้าไม่มี)
export function shotGenFor(page) {
  return getFormat(page?.type).shotGen;
}

// format นี้มีพิกัดสินค้าไหม (รีวิวมี ละคร/อินโฟไม่มี)
export function hasShopLink(page) {
  return getFormat(page?.type).shopLink;
}

// พิกัดสินค้าต้องเป็นลิงก์ — กันเผลอวางชื่อสินค้า/แคปชั่นลงช่องลิงก์
export function isShopLink(value) {
  return /^https?:\/\/\S+$/.test(value.trim());
}

// บรรทัดพิกัดสินค้าที่เอาไปวางท้ายแคปชั่นได้เลย (ไม่มีคำเรียกสินค้าก็เว้นไว้)
export function shopLinkCaption(link, label) {
  const word = label.trim();
  return `📌พิกัด ${word ? `${word} ` : ""}: ${link.trim()}`;
}

// แคปชั่นพร้อมโพสต์ = บรรทัดพิกัดขึ้นบนสุด แล้วตามด้วยแคปชั่นจากไฟล์ฉากทั้งก้อน
// (ขาดอย่างใดอย่างหนึ่งก็คืนเท่าที่มี — ไม่ต้องมีครบถึงจะคัดลอกได้)
export function captionWithShopLink(caption, link, label) {
  const body = caption.trim();
  if (!link.trim()) {
    return body;
  }
  const line = shopLinkCaption(link, label);
  return body ? `${line}\n\n${body}` : line;
}

// ---------- โพสต์ภาพ (ดู docs/adr/0004-photo-post-derived-only.md) ----------
// ภาพไม่มีตัวหนังสือ (FB ครอบหายในตารางอัลบั้ม) ข้อความทั้งหมดจึงอยู่ในแคปชั่น
// ซึ่งถอดจาก "## Overlay" กับแคปชั่นของคลิป ไม่เจนใหม่ — บรรทัดพิกัดสินค้าเติมด้วย
// captionWithShopLink เหมือนแคปชั่นคลิป ตรรกะพิกัดจึงอยู่ที่เดียว
const PHOTO_POST_CTA = "กดพิกัดด้านบน ดูราคาล่าสุด";

// ช็อตที่โพสต์ภาพใช้: ตัดช็อตแรก (ซ้ำกับภาพนำ) กับช็อตปิด lifestyle แล้วเอา 3 ใบแรกที่เหลือ
// กฎนี้ต้องตรงกับ photoPostShotNumbers ใน scripts/compose-sheet.mjs
export function photoPostShotNumbers(shotNumbers) {
  return shotNumbers.slice(1, -1).slice(0, 3);
}

// จำนวนภาพของโพสต์ภาพ = ภาพนำ + ช็อตที่เลือก
export function photoPostCount(shotNumbers) {
  return shotNumbers.length ? photoPostShotNumbers(shotNumbers).length + 1 : 0;
}

// Overlay ในไฟล์ฉากเขียนคร่อมด้วยเครื่องหมายคำพูด — เอาออกก่อนใช้เป็นข้อความจริง
function overlayText(lines) {
  const line = (lines || [])[0] || "";
  return line.trim().replace(/^["“]/, "").replace(/["”]$/, "").trim();
}

// แคปชั่นโพสต์ภาพ = พาดหัว + จุดขายจาก Overlay + CTA + แฮชแท็กของแคปชั่นคลิป
export function photoPostCaption(shotNumbers, overlayByShot, caption) {
  const headline = overlayText(overlayByShot[shotNumbers[0]]);
  if (!headline) {
    return "";
  }
  const bullets = photoPostShotNumbers(shotNumbers)
    .map((number) => overlayText(overlayByShot[number]))
    .filter(Boolean)
    .map((text) => `• ${text}`)
    .join("\n");
  const lines = caption
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lastLine = lines[lines.length - 1] || "";
  const hashtags = lastLine.startsWith("#") ? lastLine : "";
  return [headline, bullets, PHOTO_POST_CTA, hashtags].filter(Boolean).join("\n\n");
}

// ป้ายชื่อ format สั้น ๆ (ใช้บนการ์ด/แท็บ)
export const FORMAT_LABELS = Object.fromEntries(
  Object.values(FORMATS).map((f) => [f.id, f.label])
);

// ตัวเลือกตอนสร้างโปรเจกต์ใหม่
export const FORMAT_OPTIONS = [
  { id: "infographic", label: "อินโฟกราฟฟิก", hint: "โพสต์ภาพความรู้ + แคปชั่น ตั้งเวลาโพสต์ FB" },
  { id: "drama", label: "ละครสั้น", hint: "คลิปวิดีโอเป็นเรื่อง/ตอน มีตัวละคร" },
  { id: "review", label: "รีวิวสินค้า UGC", hint: "คลิปรีวิวสินค้าแนวผู้ใช้จริง" },
];
