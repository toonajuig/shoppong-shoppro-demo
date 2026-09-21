// Demo data layer: mirrors the original content shape without reading local files.

const pagePrefix = (pageSlug, projectSlug) => `../pages/${pageSlug}/projects/${projectSlug}`;

const pageConfigModules = {};
const logoModules = {};
const characterSheetModules = {};
const styleRefModules = {};
const coverRefModules = {};
const projectConfigModules = {};
const topicsModules = {};
const briefModules = {};
const imageModules = {};
const shotImageModules = {};
const characterImageModules = {};

const surrealCharacters = `## คนส่งของ
- เพศ/อายุ: ชายไทย อายุ 28 ปี
- จุดจำ: เสื้อแจ็กเก็ตส่งของสีส้มและหมวกกันน็อกสีดำ
- ภาพต้นแบบ: characters/delivery-man.png
- ย่อหน้าบรรยายมาตรฐาน: A Thai man in his late twenties with a lean build, short black hair, warm brown eyes, and a bright orange delivery jacket. He wears a black motorcycle helmet and carries a compact delivery bag.
- บรรยายย่อสำหรับวิดีโอ: Thai male delivery rider, late twenties, short black hair, orange delivery jacket, black helmet, focused but easily surprised expression.
`;

function getSection(markdown, sectionName) {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(markdown || "").match(new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i"));
  return match ? match[1].trim() : "";
}

function normalizeParagraphs(text) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join("\n\n");
}

function parseCharacters(markdown) {
  const characters = [];
  let current = null;
  let field = null;
  for (const line of String(markdown || "").split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = { name: heading[1].trim(), fields: {} };
      characters.push(current);
      field = null;
      continue;
    }
    const bullet = line.match(/^[-*]\s*([^:]+):\s*(.*)$/);
    if (current && bullet) {
      field = bullet[1].trim();
      current.fields[field] = bullet[2].trim();
    } else if (current && field && line.trim()) {
      current.fields[field] += `\n${line.trim()}`;
    }
  }
  return characters;
}

function parseDramaScene(markdown) {
  const text = String(markdown || "");
  const heading = text.match(/^#\s+[^\n]*?[—-]\s*(.+)$/m);
  const shotList = getSection(text, "Shot List").split(/\r?\n/).map((line) => line.replace(/^-+\s*/, "").trim()).filter(Boolean).map((line) => {
    const match = line.match(/^Shot\s+(\d+)\s*(?:\(([^)]*)\))?\s*:?:?\s*(.*)$/i);
    const description = match?.[3] || line;
    return { shotNumber: Number(match?.[1] || 1), meta: match?.[2] || "", description, action: description, detail: "", emotion: "", keyObject: "", sellingPoint: "", time: "", camera: "" };
  });
  const dialogue = getSection(text, "บทพูด") || getSection(text, "Voice Over");
  return {
    beat: heading?.[1]?.trim() || "Scene preview",
    summary: getSection(text, "สรุปฉาก"),
    characters: getSection(text, "ตัวละครในฉาก").split(/\r?\n/).map((line) => line.replace(/^-+\s*/, "").trim()).filter(Boolean),
    shotList,
    dialogue,
    dialogueByShot: {},
    dialogueRest: dialogue ? [dialogue] : [],
    soundByShot: {},
    overlayByShot: {},
    sound: getSection(text, "เสียง"),
    videoPrompt: getSection(text, "คำสั่งสร้างวิดีโอ"),
    storyboardPrompt: getSection(text, "คำสั่งสร้างภาพช็อต"),
    imagePrompts: shotList.map(() => "Demo storyboard image prompt"),
    raw: text,
  };
}

function buildSceneVideoPack(scene) {
  return scene?.videoPrompt || "Demo video prompt - no external generation is connected.";
}

function getImagePath() { return null; }
function getShotImagePath() { return null; }
function getPhotoPostImagePath() { return null; }
function getStoryCoverPath() { return null; }
function getCharacterImage(_pageSlug, _projectSlug, character, index) {
  const referenced = character?.fields?.["ภาพต้นแบบ"] || "";
  const baseName = referenced.split("/").pop()?.replace(/\.(png|jpe?g|webp)$/i, "") || `char-${index + 1}`;
  return { href: null, baseName };
}

function createPost(pageSlug, projectSlug, day, contentNumber, title, type, summary, caption, markdown = "", imageHref = null) {
  return {
    id: `day${day}-content-${contentNumber}`,
    pageSlug,
    projectSlug,
    contentMode: projectSlug === "surreal-clips" ? "surreal" : "",
    imageStyle: "",
    day,
    contentNumber,
    title,
    type,
    summary,
    caption,
    markdown,
    imageHref,
  };
}

function createProject(page, config, days) {
  const totalPosts = days.reduce((total, day) => total + day.posts.length, 0);
  const totalImages = days.reduce(
    (total, day) => total + day.posts.filter((post) => post.imageHref).length,
    0,
  );
  return {
    pageSlug: page.slug,
    projectSlug: config.projectSlug,
    slug: page.slug,
    shortName: page.shortName,
    name: config.name,
    createdAt: config.createdAt || "",
    type: config.format,
    format: config.format,
    platform: config.platform || "flow-omni-10s",
    aspectRatio: config.aspectRatio || "",
    imageStyle: "",
    contentMode: config.contentMode || "",
    shopLink: config.shopLink || "",
    shopLabel: config.shopLabel || "",
    days,
    totalPosts,
    totalImages,
    coverHref: config.coverHref || null,
    brandName: page.name,
    description: page.description,
    logoHref: page.logoHref,
    characterSheetHref: null,
    styleRefCount: 0,
    coverRefCount: 0,
  };
}

const brand = {
  slug: "page-1",
  name: "ช้อปปง ช้อปโปร",
  shortName: "ช้อปปง ช้อปโปร",
  description: "เพจรีวิวสินค้า Shopee แบบ UGC คลิปสั้น 10 วินาที สำหรับคนวัยทำงาน — เห็นของจริงก่อนกดสั่ง พร้อมพิกัดสินค้าท้ายโพสต์",
  logoHref: "/demo-assets/page-1/logo.png",
  characterSheetHref: null,
  styleRefCount: 0,
  coverRefCount: 0,
};

const surrealScene = `# เรื่องที่ 25 ฉากที่ 1 — สิ่งที่ไม่ควรอยู่ในกล่อง

## สรุปฉาก
คนส่งของเปิดกล่องพัสดุธรรมดา แล้วพบว่าฝนกำลังตกอยู่ข้างในกล่องเท่านั้น

## ตัวละครในฉาก
- คนส่งของ

## Shot List
- Shot 1 (0.0-3.0 วิ, มุมกว้าง): คนส่งของวางกล่องบนโต๊ะและเปิดฝา
- Shot 2 (3.0-6.0 วิ, โคลสอัพ): ฝนตกลงในกล่องเล็ก ๆ อย่างจริงจัง
- Shot 3 (6.0-10.0 วิ, มุมต่ำ): คนส่งของเงยหน้ามองกล้องด้วยสีหน้าตกใจ

## คำสั่งสร้างวิดีโอ
Create one continuous photorealistic cinematic Thai comedy clip. Keep the event impossible but visually believable.

## เสียง
Cardboard opening, tiny rain, surprised gasp.
`;

const reviewBrief = `# Day 2 Content 1

## Content Type
รีวิวสินค้า UGC

## Title
โซฟาขี้เกียจ Bean Bag นั่งแล้วลุกยากจริงไหม

## Objective
แสดงให้เห็นความนุ่มและรูปทรงของสินค้าในสถานการณ์ใช้งานจริง

## Key Message
นั่งสบาย เหมาะกับมุมพักผ่อน และเห็นขนาดจริงก่อนตัดสินใจซื้อ

## Caption + Hashtags
ลองนั่งจริงให้ดู เหมาะกับมุมพักผ่อนในห้องมาก\n#รีวิวสินค้า #ของใช้ในบ้าน #ช้อปปงช้อปโปร
`;

const infographicBrief = `# Day 3 Content 1

## Content Type
อินโฟกราฟฟิก

## Title
เลือกเสื้อกันฝนให้เหมาะกับการใช้งาน

## Objective
สรุปจุดสังเกตที่ควรดูตอนเลือกเสื้อกันฝน

## Key Message
ดูวัสดุ ขนาด และการปิดรอยต่อก่อนซื้อ

## Caption + Hashtags
เช็ก 3 จุดนี้ก่อนซื้อเสื้อกันฝน จะได้ใช้งานคุ้มกว่า\n#รีวิวของใช้ #เสื้อกันฝน #ช้อปปงช้อปโปร
`;

const page1Projects = [
  createProject(brand, { projectSlug: "surreal-clips", name: "คลิปเหนือจริง", format: "drama", contentMode: "surreal", aspectRatio: "9:16", createdAt: "2026-09-10T09:16:40.930Z", coverHref: "/demo-assets/page-1/projects/surreal-clips/cover.png" }, [
    { day: 25, title: "สิ่งที่ไม่ควรอยู่ในกล่อง", coverHref: "/demo-assets/page-1/projects/surreal-clips/cover.png", posts: [createPost("page-1", "surreal-clips", 25, 1, "สิ่งที่ไม่ควรอยู่ในกล่อง", "คลิปเหนือจริง", "คลิปสมจริงแต่เหตุการณ์ผิดคาดหนึ่งแกน", "เรื่องธรรมดาที่จบไม่ธรรมดา", surrealScene, "/demo-assets/page-1/projects/surreal-clips/content-1.png")] },
  ]),
  createProject(brand, { projectSlug: "bean-bag", name: "โซฟาขี้เกียจ Bean Bag", format: "review", platform: "flow-omni-10s", shopLink: "", shopLabel: "โซฟา", createdAt: "2026-09-03T12:45:44.322Z", coverHref: "/demo-assets/page-1/projects/bean-bag/cover.png" }, [
    { day: 2, title: "รีวิวโซฟาขี้เกียจ", coverHref: "/demo-assets/page-1/projects/bean-bag/cover.png", posts: [createPost("page-1", "bean-bag", 2, 1, "โซฟาขี้เกียจ Bean Bag นั่งแล้วลุกยากจริงไหม", "รีวิวสินค้า UGC", "ทดลองนั่งจริงและเล่าจุดเด่นของสินค้า", "ลองนั่งจริงให้ดู เหมาะกับมุมพักผ่อนในห้องมาก", reviewBrief, "/demo-assets/page-1/projects/bean-bag/content-1.png")] },
  ]),
  createProject(brand, { projectSlug: "review-1", name: "Aimi เสื้อกันฝน", format: "review", platform: "flow-omni-10s", createdAt: "2026-08-20T18:40:57.320Z", coverHref: "/demo-assets/page-1/projects/review-1/cover.png" }, [
    { day: 3, title: "เลือกเสื้อกันฝนให้เหมาะกับการใช้งาน", coverHref: "/demo-assets/page-1/projects/review-1/cover.png", posts: [createPost("page-1", "review-1", 3, 1, "เลือกเสื้อกันฝนให้เหมาะกับการใช้งาน", "รีวิวสินค้า UGC", "สรุปจุดสังเกตที่ควรดูก่อนเลือกซื้อ", "เช็ก 3 จุดนี้ก่อนซื้อเสื้อกันฝน", infographicBrief, "/demo-assets/page-1/projects/review-1/content-1.png")] },
  ]),
];

const PAGES = [{
  ...brand,
  projects: page1Projects,
  totalPosts: page1Projects.reduce((sum, project) => sum + project.totalPosts, 0),
  totalImages: 0,
  coverHref: null,
}];

const charactersDocModules = {
  "../pages/page-1/projects/surreal-clips/characters/characters.md": surrealCharacters,
};

function buildProject(pageSlug, projectSlug) {
  return PAGES.find((entry) => entry.slug === pageSlug)?.projects.find((project) => project.projectSlug === projectSlug) || null;
}

function buildPages() { return PAGES; }
function buildDaysForProject(pageSlug, projectSlug) { return buildProject(pageSlug, projectSlug)?.days || []; }
function getSlugFromUrl() {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("page");
  return PAGES.some((page) => page.slug === value) ? value : null;
}
function getProjectFromUrl() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const page = PAGES.find((entry) => entry.slug === params.get("page"));
  const project = page?.projects.find((entry) => entry.projectSlug === params.get("project"));
  return project?.projectSlug || null;
}
function getStoryFromUrl() {
  if (typeof window === "undefined") return null;
  const value = Number(new URLSearchParams(window.location.search).get("story"));
  return Number.isInteger(value) && value > 0 ? value : null;
}

const VIDEO_REF_GUARD = "Demo mode: attached assets are visual references only and no external generation is connected.";

export {
  pageConfigModules,
  logoModules,
  characterSheetModules,
  styleRefModules,
  coverRefModules,
  projectConfigModules,
  topicsModules,
  briefModules,
  imageModules,
  shotImageModules,
  charactersDocModules,
  characterImageModules,
  pagePrefix as projectPrefix,
  getSection,
  normalizeParagraphs,
  getImagePath,
  getShotImagePath,
  getPhotoPostImagePath,
  getStoryCoverPath,
  parseDramaScene,
  VIDEO_REF_GUARD,
  buildSceneVideoPack,
  parseCharacters,
  getCharacterImage,
  buildDaysForProject,
  buildProject,
  buildPages,
  PAGES,
  getSlugFromUrl,
  getProjectFromUrl,
  getStoryFromUrl,
};
