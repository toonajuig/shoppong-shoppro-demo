import { styleInstruction } from "./style-presets.js";

const DRAMA_PLATFORM_OPTIONS = {
  "flow-veo31-8s": {
    label: "Flow · Veo 3.1",
    detail: "8 วินาที/ฉาก • บทพูด 25–32 คำ",
    seconds: 8,
    minWords: 25,
    maxWords: 32,
  },
  "flow-omni-4s": {
    label: "Flow · Omni Flash",
    detail: "4 วินาที/ฉาก • บทพูด 12–16 คำ",
    seconds: 4,
    minWords: 12,
    maxWords: 16,
  },
  "flow-omni-6s": {
    label: "Flow · Omni Flash",
    detail: "6 วินาที/ฉาก • บทพูด 19–24 คำ",
    seconds: 6,
    minWords: 19,
    maxWords: 24,
  },
  "flow-omni-8s": {
    label: "Flow · Omni Flash",
    detail: "8 วินาที/ฉาก • บทพูด 25–32 คำ",
    seconds: 8,
    minWords: 25,
    maxWords: 32,
  },
  "flow-omni-10s": {
    label: "Flow · Omni Flash",
    detail: "10 วินาที/ฉาก • บทพูด 38–48 คำ",
    seconds: 10,
    minWords: 38,
    maxWords: 48,
  },
  "grok-6s": {
    label: "Grok",
    detail: "6 วินาที/ฉาก • บทพูด 19–24 คำ",
    seconds: 6,
    minWords: 19,
    maxWords: 24,
  },
  "grok-10s": {
    label: "Grok",
    detail: "10 วินาที/ฉาก • บทพูด 38–48 คำ",
    seconds: 10,
    minWords: 38,
    maxWords: 48,
  },
};

const DRAMA_ASPECT_RATIOS = {
  "9:16": { label: "แนวตั้ง", detail: "TikTok / Reels / Shorts" },
  "16:9": { label: "แนวนอน", detail: "YouTube" },
  "4:5": { label: "แนวตั้งสั้น", detail: "Facebook feed" },
  "1:1": { label: "จัตุรัส", detail: "โพสต์ทั่วไป" },
};

// ธีมความขัดแย้งสากล — ใช้ได้ทุกสไตล์ภาพ (ไทย/จีนโบราณ/เกาหลี ฯลฯ) ไม่ผูกยุค/วัฒนธรรม
const DRAMA_GENRES = [
  "ถูกดูถูก แล้วพลิกกลับมาเหนือกว่า",
  "ถูกใส่ร้าย/กล่าวหาผิด แล้วทวงความจริง",
  "ถูกทรยศ/หักหลัง แล้วแก้แค้น",
  "ตัวจริงปลอมตัว / ซ่อนตัวตน",
  "ความลับในอดีตถูกเปิดโปง",
  "เสียสละเพื่อคนที่รัก",
  "รักต้องห้าม / ต่างชนชั้น",
  "ครอบครัวแตกหัก แล้วคืนดี",
  "คนชั่วได้รับกรรม (สาแก่ใจ)",
  "ลูก/คนใกล้ตัวอกตัญญู",
];

const DRAMA_INTENSITY_LEVELS = [
  "คุณธรรมอบอุ่น",
  "ดราม่าจัด",
  "ตลกร้าย",
  "สะใจแรง",
  "หักมุมโหด",
];

const DRAMA_SCENE_COUNTS = [6, 8, 10, 12];

function isSurrealProject(value) {
  return value?.contentMode === "surreal";
}

// Story Engine: โครงเรื่องตายตัวตามจำนวนฉาก (ตรงกับตารางใน AGENTS.md)
function dramaBeats(sceneCount) {
  const table = {
    6: [
      "เปิดเรื่องด้วยหมัดฮุก",
      "จุดขัดแย้ง",
      "ขยี้อารมณ์",
      "จุดพลิกผัน",
      "จุดพีคสุดสะใจ",
      "บทสรุปข้อคิด",
    ],
    8: [
      "เปิดเรื่องด้วยหมัดฮุก",
      "จุดขัดแย้ง",
      "ขยี้อารมณ์",
      "ซ้ำเติม/กดดัน",
      "จุดพลิกผัน",
      "เปิดความจริง",
      "จุดพีคสุดสะใจ",
      "บทสรุปข้อคิด",
    ],
    10: [
      "เปิดเรื่องด้วยหมัดฮุก",
      "จุดขัดแย้ง",
      "ขยี้อารมณ์ (ยกแรก)",
      "ขยี้อารมณ์ (ยกสอง)",
      "ซ้ำเติม/กดดัน",
      "จุดพลิกผัน",
      "เปิดความจริง (ยกแรก)",
      "เปิดความจริง (ยกสอง)",
      "จุดพีคสุดสะใจ",
      "บทสรุปข้อคิด",
    ],
    12: [
      "เปิดเรื่องด้วยหมัดฮุก",
      "จุดขัดแย้ง (ยกแรก)",
      "จุดขัดแย้ง (ยกสอง)",
      "ขยี้อารมณ์ (ยกแรก)",
      "ขยี้อารมณ์ (ยกสอง)",
      "ซ้ำเติม/กดดัน (ยกแรก)",
      "ซ้ำเติม/กดดัน (ยกสอง)",
      "จุดพลิกผัน",
      "เปิดความจริง",
      "จุดพีคสุดสะใจ",
      "บทสรุปข้อคิด",
      "บทสรุปข้อคิด (ตอกย้ำ)",
    ],
  };
  return table[sceneCount] || table[8];
}

function dramaWriteStepLines(page, nextDay, sceneCount, aspectRatio = "9:16") {
  return [
    `ก่อนสร้างหรือย้ายไฟล์ ให้รัน node scripts/preflight-content-workspace.mjs ${page.slug} ${page.projectSlug} จาก repository root และทำต่อเมื่อเห็น "[content-workspace] READY" เท่านั้น`,
    `1. สร้าง/อัพเดทตัวละครทุกตัวใน pages/${page.slug}/projects/${page.projectSlug}/characters/characters.md ให้ครบก่อน (จุดจำ + ภาพต้นแบบ + ย่อหน้าบรรยายมาตรฐาน + บรรยายย่อสำหรับวิดีโอ และคำสั่งสร้างภาพต้นแบบเป็นภาษาอังกฤษ)`,
    `2. เขียนไฟล์ฉาก day${nextDay}-content-1.md ถึง day${nextDay}-content-${sceneCount}.md ใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/ ตาม format ของ AGENTS.md — แต่ละฉากมี: Shot List (2–4 shot พร้อมช่วงเวลา มุมกล้อง แอ็กชันหลัก รายละเอียดภาพ อารมณ์ วัตถุสำคัญเฉพาะช็อตที่มี prop สำคัญจริง), คำสั่งสร้างภาพช็อต (### Shot K ละ 1 English prompt ภาพเดี่ยวของช็อตนั้น ห้ามมีตัวหนังสือทุกชนิดในภาพ), คำสั่งสร้างวิดีโอ (English prompt เดียวจบในตัว จัดเป็นบล็อกตาม AGENTS.md: บล็อกกันภาพแนบ "Use the attached storyboard only as a visual reference... do not show frame borders/panels/text" + บล็อกสั่งงานหลัก "Generate one continuous <N>-second <aspect> video. Follow the storyboard order strictly Shot 1→N" พร้อมสถานที่/โทน/lighting + "Main characters:" ใช้บรรยายย่อสำหรับวิดีโอจาก characters.md + บล็อกราย shot "Shot K: M:SS–M:SS" (เวลาจริงจาก Shot List) พร้อมบรรทัด Visual:, Action:, Camera Movement:, Dialogue (Thai): — **ผูกผู้พูดกับ visual anchor เช่น "the woman in the red robe on the right" ไม่ใช่ชื่อ กันพูดสลับบท, ตั้งเป้า 1 ช็อต 1 คนพูด**, ASMR/SFX: + "Overall mood:" + ปิดด้วย "Global rules:" (photorealistic, consistent character identity/wardrobe, diegetic sound only, no subtitles/text/logo/watermark/background music/split-screen/storyboard panels) — บทพูดไทยเว้นวรรคตามวลีธรรมชาติ ห้ามเว้นวรรคคั่นรายคำ), เสียง (ผูกราย shot), บทพูด (ผูกราย shot)`,
    `3. อัพเดท content-topics.md เพิ่มหัวข้อ ## Day ${nextDay} — <ชื่อเรื่อง> (ต้องมีชื่อเรื่องต่อท้ายเสมอ หน้าเว็บใช้แสดงบนการ์ดเรื่อง) พร้อมรายการฉากครบทุกฉาก`,
    `4. gen ภาพต้นแบบตัวละคร (reference sheet 4 มุม + ของประจำตัว ตาม format ใน AGENTS.md): สร้างภาพจาก "คำสั่งสร้างภาพต้นแบบ" ของแต่ละตัว (ถ้ามี pages/${page.slug}/assets/logo/charator-sheet.* ให้แนบเป็น style guide การจัดวางทุกใบ) เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/characters/<char-slug>.png — ตัวละครตัวไหนมีไฟล์ภาพอยู่แล้วห้าม gen ใหม่/ห้ามเขียนทับเด็ดขาด (หน้าตาถูกล็อกแล้ว)`,
    `5. gen ภาพช็อตทีละ shot: ใช้ prompt จาก "## คำสั่งสร้างภาพช็อต" ของแต่ละฉาก (### Shot K = 1 ภาพ) พร้อมแนบ image reference ทุกครั้ง: ภาพต้นแบบของตัวละครทุกตัวใน shot + style references 2–3 ไฟล์จาก pages/${page.slug}/assets/style-references/ (ถ้ามี — คุมโทนหนังเท่านั้น) เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/generated_posts/day${nextDay}/shots/day${nextDay}-content-<M>-shot-<K>.png แล้วรัน node scripts/compose-sheet.mjs ${page.slug} ${page.projectSlug} ${nextDay} เพื่อประกอบชีทสตอรี่บอร์ด 4:5 ของทุกฉาก (ตัวหนังสือไทยบนชีทมาจากสคริปต์ ห้ามให้โมเดลสร้างภาพวาดตัวหนังสือหรือชีทเอง)`,
    `6. gen ภาพปกเรื่อง (movie poster): ภาพเดียวสไตล์โปสเตอร์หนังไทย สัดส่วน ${aspectRatio} (ตาม aspect ratio วิดีโอของเรื่อง) — ชื่อเรื่องภาษาไทยตัวใหญ่อ่านชัดเด่นบนภาพ, ตัวละครหลักในโมเมนต์พีคของเรื่อง, โทนสี/อารมณ์ตรงกับเรื่อง, มีแท็กไลน์สั้น 1 บรรทัด แนบ reference: ภาพต้นแบบตัวละครหลัก + โปสเตอร์ตัวอย่าง 2–3 ไฟล์จาก pages/${page.slug}/assets/cover-references/ (ถ้ามี — ดู layout ชื่อเรื่อง/องค์ประกอบ/โทน ห้ามลอกข้อความหรือตัวละครจากตัวอย่าง) เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/generated_posts/day${nextDay}/day${nextDay}-cover.png (หน้าเว็บใช้เป็นปกการ์ดเรื่อง)`,
  ];
}

function surrealWriteStepLines(page, nextDay, aspectRatio = "9:16") {
  const base = `pages/${page.slug}/projects/${page.projectSlug}`;
  return [
    `ก่อนสร้างหรือย้ายไฟล์ ให้รัน node scripts/preflight-content-workspace.mjs ${page.slug} ${page.projectSlug} จาก repository root และทำต่อเมื่อเห็น "[content-workspace] READY" เท่านั้น`,
    `อ่าน $make-surreal-clip และ $content-automation-operator ร่วมกับ page-brief.md, project.config.json, project-brief.md และ topics ล่าสุดก่อนลงมือ`,
    `ใช้ $make-surreal-clip สร้าง brief/Flow prompt และใช้ $content-automation-operator ตรวจลำดับ Day กับสถานะคิวเท่านั้น; ขั้นเตรียมไฟล์นี้ห้ามเริ่มผลิต MP4 และห้ามเผยแพร่ Facebook`,
    `สร้าง/อัพเดท characters.md เฉพาะตัวละครที่เรื่องนี้ใช้; ถ้ามี user preference ใน project-brief.md ให้ใช้กับ master, shot, cover และ video prompt โดยคำสั่งล่าสุดของผู้ใช้ override ได้`,
    `เขียน ${base}/content_planner/day${nextDay}-content-1.md เป็นคลิปเดียวจบ 1 ฉาก ความยาวตาม platform (ค่าเริ่มต้น 10 วินาที) ใช้ 2–3 shots, ordinary opening → one surreal event → visual punchline`,
    `อัพเดท ${base}/content_planner/content-topics.md ด้วย ## Day ${nextDay} — <ชื่อคลิป> และ - Content 1: ... ให้ตรงกับ scene brief`,
    `สร้าง character master ก่อน แล้วสร้างภาพหนึ่งใบต่อหนึ่ง shot โดยแนบ master ของตัวละครที่อยู่ใน shot และ style references ตามบทบาท; ภาพช็อตห้ามมีข้อความ/โลโก้/watermark`,
    `ตรวจภาพจริงทุกใบ ถ้าสถานที่ ตัวละคร พร็อพ จำนวน หรือมุกไม่ตรง ให้ regenerate เฉพาะ asset ที่ผิด และ sync prompt/review ให้ตรงกับภาพที่เลือก`,
    `เมื่อภาพช็อตครบ รัน node scripts/compose-sheet.mjs ${page.slug} ${page.projectSlug} ${nextDay} 1 แล้วตรวจชีทด้วยสายตา`,
    `สร้างปก ${base}/generated_posts/day${nextDay}/day${nextDay}-cover.png จาก master ตัวละคร; ชื่อเรื่อง/แท็กไลน์เป็นข้อความที่ตั้งใจเท่านั้น และต้องตรวจไม่ให้มีข้อความพื้นหลังเกิน`,
    `ก่อนส่งมอบ ตรวจ cross-file consistency: topics → scene brief → flow prompt → cover prompt → review → ไฟล์จริง และแยกสถานะบท/ภาพ/วิดีโอ/เสียง/เผยแพร่ตามจริง`,
  ];
}

const SURREAL_IRON_RULES_LINE = `กฎคลิปเหนือจริง: ภาพสมจริงแต่เหตุการณ์ผิดคาดหนึ่งแกน, หนึ่งคลิปหนึ่งฉาก 2–3 shots, จังหวะสั้นกระชับ, ภาพช็อตไม่มีข้อความทุกชนิด, video prompt ใช้เสียง diegetic เท่านั้น, ห้ามอ้างว่าได้ MP4/เสียง/เผยแพร่ถ้ายังไม่ได้ทำ, และต้องระบุว่าเป็นเรื่องสมมติสร้างด้วย AI`;

function surrealAspectRatioLine(aspectRatio) {
  const ratio = aspectRatio || "9:16";
  return `- สัดส่วนวิดีโอ: ${ratio} — คลิปเดียวจบ ความยาวตาม platform, ภาพช็อตและปกลงท้ายด้วย "${ratio} aspect ratio"`;
}

function buildSurrealEpisodeCommand({ page, platform, aspectRatio, topicLine, nextDay, imageStyle }) {
  const platformInfo = DRAMA_PLATFORM_OPTIONS[platform] || DRAMA_PLATFORM_OPTIONS["flow-omni-10s"];
  const styleLine = styleInstruction(imageStyle);
  return [
    `อ่านกติกา make-surreal-clip และ AGENTS.md แล้วทำตาม workflow คลิปเหนือจริง`,
    ``,
    `สร้างคลิปเหนือจริงเรื่องใหม่ของเพจ pages/${page.slug}/ (บันทึกเป็น Day ${nextDay} = คลิปที่ ${nextDay})`,
    `- โจทย์/พล็อต: ${topicLine || "ให้คิดมุกใหม่ที่ไม่ซ้ำหัวข้อใน topics"}`,
    `- แพลตฟอร์ม: ${platformInfo.label} — ${platformInfo.seconds} วินาทีต่อคลิป`,
    surrealAspectRatioLine(aspectRatio),
    ...(styleLine ? [styleLine] : []),
    `- ต้องมี ordinary opening, ความผิดปกติหลักเพียงหนึ่งอย่าง และ punchline ที่อ่านออกจากภาพภายในคลิปเดียว`,
    ``,
    `ขั้นตอน:`,
    ...surrealWriteStepLines(page, nextDay, aspectRatio),
    ``,
    SURREAL_IRON_RULES_LINE,
  ].join("\n");
}

const DRAMA_IRON_RULES_LINE = `กฎเหล็กห้ามลืม: prompt ภาพ/วิดีโอทั้งหมดเป็นภาษาอังกฤษ แต่ชื่อเรื่อง/แท็กไลน์บนปกและบทพูดเป็นภาษาไทยในเครื่องหมายคำพูด (เนื้อหาไฟล์ส่วนอื่นยังเป็นไทย), ภาพช็อตห้ามมีตัวหนังสือทุกชนิด — ตัวหนังสือไทยบนชีทมาจาก scripts/compose-sheet.mjs เท่านั้น ห้ามให้โมเดลสร้างภาพ gen หรือแก้ตัวชีท, คำสั่งสร้างภาพช็อต/ปกเรื่องลงท้ายด้วย aspect ratio ของเรื่องตามที่ระบุข้างบน ส่วนคำสั่งสร้างวิดีโอระบุ aspect ต้นบล็อกเปิดแทน (เช่น "Vertical 9:16"), ภาพต้นแบบตัวละครลงท้าย "9:16 aspect ratio", ห้ามใส่แค่ชื่อตัวละครใน prompt — prompt ภาพวางย่อหน้าบรรยายมาตรฐาน (ภาษาอังกฤษ) เต็มก้อน ส่วนคำสั่งสร้างวิดีโอใช้ "บรรยายย่อสำหรับวิดีโอ" ในบล็อก Main characters: (วางเหมือนกันทุกฉาก), ไม่มีดนตรี/เพลงประกอบ — เสียง diegetic เท่านั้น (ASMR เสียงการกระทำ ธรรมชาติ ร้องไห้ หัวเราะ) และเขียน "no background music, no songs" ในคำสั่งสร้างวิดีโอทุกฉาก`;

function dramaAspectRatioLine(aspectRatio) {
  const info = DRAMA_ASPECT_RATIOS[aspectRatio] || DRAMA_ASPECT_RATIOS["9:16"];
  const orientation = aspectRatio === "16:9" ? "Horizontal 16:9" : `Vertical ${aspectRatio}`;
  return `- สัดส่วนวิดีโอของเรื่องนี้: ${aspectRatio} (${info.label}) — คำสั่งสร้างภาพช็อตทุก shot ลงท้าย "${aspectRatio} aspect ratio" ส่วนคำสั่งสร้างวิดีโอเปิดบล็อกแรกด้วย "${orientation}, ..." และปกเรื่องเป็น ${aspectRatio} เช่นกัน (ตัวชีทที่ประกอบโดยสคริปต์เป็น 4:5 อัตโนมัติ, ภาพต้นแบบตัวละครยังเป็น 9:16)`;
}

function buildDramaEpisodeCommand({ page, platform, aspectRatio, topicLine, sceneCount, intensityIndex, nextDay, imageStyle }) {
  if (isSurrealProject(page)) {
    return buildSurrealEpisodeCommand({ page, platform, aspectRatio, topicLine, nextDay, imageStyle });
  }
  const platformInfo = DRAMA_PLATFORM_OPTIONS[platform];
  const beats = dramaBeats(sceneCount);
  const styleLine = styleInstruction(imageStyle);

  return [
    `อ่านกติกา "Drama Pages" ใน AGENTS.md แล้วทำตามอย่างเคร่งครัดทุกข้อ`,
    ``,
    `สร้างละครคุณธรรมสั้นเรื่องใหม่ของเพจ pages/${page.slug}/ (บันทึกเป็น Day ${nextDay} = เรื่องที่ ${nextDay})`,
    `- โจทย์/พล็อต: ${topicLine}`,
    `- ตั้งชื่อเรื่องใหม่ตามกติกา "ชื่อเรื่อง" ใน AGENTS.md — บรรทัดข้างบนคือโจทย์ ไม่ใช่ชื่อเรื่อง ห้ามใช้ตรง ๆ`,
    `- แพลตฟอร์ม: ${platformInfo.label} — ${platformInfo.seconds} วินาที/ฉาก บทพูดรวมต่อฉาก ${platformInfo.minWords}–${platformInfo.maxWords} คำ (ห้ามเกิน)`,
    dramaAspectRatioLine(aspectRatio),
    ...(styleLine ? [styleLine] : []),
    `- ระดับความแรงดราม่า: ${intensityIndex + 1}/5 (${DRAMA_INTENSITY_LEVELS[intensityIndex]})`,
    `- จำนวนฉาก: ${sceneCount} ฉาก ตามโครงนี้เป๊ะ ๆ:`,
    ...beats.map((beat, index) => `  ฉากที่ ${index + 1}: ${beat}`),
    ``,
    `ขั้นตอน:`,
    ...dramaWriteStepLines(page, nextDay, sceneCount, aspectRatio),
    ``,
    DRAMA_IRON_RULES_LINE,
  ].join("\n");
}

function buildDramaPitchCommand({ page, topicLine, sceneCount, intensityIndex, nextDay }) {
  if (isSurrealProject(page)) {
  return [
    `อ่าน $make-surreal-clip และ $content-automation-operator ก่อน — นี่คือจังหวะที่ 1 (เสนอไอเดีย/เรื่องย่อเท่านั้น ห้ามสร้างภาพหรือแก้ไฟล์อื่น)`,
      ``,
      `สร้าง pitch คลิปเหนือจริงสำหรับ Day ${nextDay} ของ pages/${page.slug}/projects/${page.projectSlug}/`,
      `- โจทย์/พล็อต: ${topicLine || "ให้คิดมุกใหม่ที่ไม่ซ้ำ topics"}`,
      `- เสนอชื่อเรื่อง 5 ตัวเลือก, เรื่องย่อ 4–6 ประโยค, ตัวละครที่จำเป็น และโครง 2–3 shots`,
      `- สร้างเฉพาะไฟล์ pages/${page.slug}/projects/${page.projectSlug}/content_planner/day${nextDay}-pitch.md แล้วหยุดรอผู้ใช้ตรวจ`,
    ].join("\n");
  }
  const beats = dramaBeats(sceneCount);

  return [
    `อ่านกติกา "Drama Pages" ใน AGENTS.md ก่อน — นี่คือจังหวะที่ 1 (เสนอเรื่องย่อ) ห้ามเขียนบทเต็ม`,
    ``,
    `เสนอเรื่องย่อละครคุณธรรมสั้นเรื่องใหม่ของเพจ pages/${page.slug}/ (เตรียมเป็น Day ${nextDay} = เรื่องที่ ${nextDay})`,
    `- โจทย์/พล็อต: ${topicLine}`,
    `- ระดับความแรงดราม่า: ${intensityIndex + 1}/5 (${DRAMA_INTENSITY_LEVELS[intensityIndex]})`,
    `- จำนวนฉาก: ${sceneCount} ฉาก ตามโครงนี้เป๊ะ ๆ:`,
    ...beats.map((beat, index) => `  ฉากที่ ${index + 1}: ${beat}`),
    ``,
    `สร้างไฟล์เดียวเท่านั้น: pages/${page.slug}/projects/${page.projectSlug}/content_planner/day${nextDay}-pitch.md ตาม format "Two-step pitch" ใน AGENTS.md:`,
    `- # เรื่องที่ ${nextDay} — <ชื่อเรื่อง>`,
    `- ## ชื่อเรื่องตัวเลือก — เสนอ 5 ชื่อตามกติกา "ชื่อเรื่อง" ใน AGENTS.md (ห้ามใช้โจทย์เป็นชื่อตรง ๆ) ชื่อที่ดีที่สุดใส่หัวไฟล์ ผู้ใช้จะเลือก/แก้ตอนรีวิว`,
    `- ## เรื่องย่อ — 4–6 ประโยค: ใครโดนอะไร หักมุมยังไง จบสะใจยังไง`,
    `- ## ตัวละคร — รายชื่อทุกตัว: ชื่อ, บทบาทในเรื่อง, นิสัย, จุดจำที่มองเห็นได้ 1–2 อย่าง (ยังไม่ต้องเขียนย่อหน้าบรรยายมาตรฐาน)`,
    `- ## โครงฉาก — ฉากที่ 1–${sceneCount} ตาม beat ข้างบน ฉากละ 1 ประโยค`,
    ``,
    `ห้ามสร้างหรือแก้ไฟล์อื่นเด็ดขาด (characters.md, ไฟล์ฉาก, content-topics.md ยังห้ามแตะ) เสร็จแล้วสรุปเรื่องย่อให้ผู้ใช้อ่านตรวจ แล้วรอคำสั่งจังหวะที่ 2`,
  ].join("\n");
}

function buildDramaScenesFromPitchCommand({ page, platform, aspectRatio, sceneCount, intensityIndex, nextDay, imageStyle }) {
  if (isSurrealProject(page)) {
    return [
      `อ่าน $make-surreal-clip และ $content-automation-operator แล้วอ่าน pitch ล่าสุดใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/day${nextDay}-pitch.md`,
      `เขียนบทเต็มของ Day ${nextDay} ตาม pitch ล่าสุดเป๊ะ ๆ เป็นคลิปเดียว 1 ฉาก 2–3 shots ความยาวตาม platform; ห้ามเพิ่มพล็อตหรือตัวละครใหม่เอง`,
      `จากนั้นทำตามขั้นตอนสร้าง characters.md, scene brief, topics, ภาพ master, ภาพ shots, compose sheet, cover และ review ใน workflow surreal`,
      `รักษาโครงคลิปเหนือจริงแบบสั้น กระชับ และจบด้วยภาพ punchline`,
    ].join("\n");
  }
  const platformInfo = DRAMA_PLATFORM_OPTIONS[platform];
  const styleLine = styleInstruction(imageStyle);

  return [
    `อ่านกติกา "Drama Pages" ใน AGENTS.md แล้วทำตามอย่างเคร่งครัดทุกข้อ — นี่คือจังหวะที่ 2 (เขียนบทเต็มจากเรื่องย่อที่อนุมัติแล้ว)`,
    ``,
    `อ่านเรื่องย่อใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/day${nextDay}-pitch.md แล้วเขียนบทเต็มของ Day ${nextDay} ตามไฟล์นั้นเป๊ะ ๆ (ผู้ใช้อาจแก้ไขไฟล์ pitch ไปแล้ว — ยึดเนื้อหาล่าสุดในไฟล์เสมอ ห้ามคิดพล็อต/ตัวละครใหม่เอง และใช้ชื่อเรื่องจากหัวไฟล์ pitch ล่าสุดเท่านั้น)`,
    `- แพลตฟอร์ม: ${platformInfo.label} — ${platformInfo.seconds} วินาที/ฉาก บทพูดรวมต่อฉาก ${platformInfo.minWords}–${platformInfo.maxWords} คำ (ห้ามเกิน)`,
    dramaAspectRatioLine(aspectRatio),
    ...(styleLine ? [styleLine] : []),
    `- ระดับความแรงดราม่า: ${intensityIndex + 1}/5 (${DRAMA_INTENSITY_LEVELS[intensityIndex]})`,
    `- จำนวนฉาก: ${sceneCount} ฉาก ตามโครงฉากในไฟล์ pitch`,
    ``,
    `ขั้นตอน:`,
    ...dramaWriteStepLines(page, nextDay, sceneCount, aspectRatio),
    ``,
    DRAMA_IRON_RULES_LINE,
  ].join("\n");
}

// คำสั่งสั่ง Codex gen ภาพช็อตของฉาก/คลิปเดียว + ประกอบชีทด้วย compose-sheet
// path/คำสั่งร่วมของ shot-gen command (ใช้ทั้ง drama/review)
function shotGenPaths(post) {
  const base = `pages/${post.pageSlug}/projects/${post.projectSlug}`;
  return {
    base,
    // style-references เป็น asset ระดับเพจ (แบรนด์) — ไม่อยู่ในโปรเจกต์
    styleRefs: `pages/${post.pageSlug}/assets/style-references/`,
    composeCmd: `node scripts/compose-sheet.mjs ${post.pageSlug} ${post.projectSlug} ${post.day} ${post.contentNumber}`,
    photoPostCmd: `node scripts/compose-sheet.mjs --photo-post ${post.pageSlug} ${post.projectSlug} ${post.day} ${post.contentNumber}`,
    sceneFile: `${base}/content_planner/day${post.day}-content-${post.contentNumber}.md`,
  };
}

// คำสั่ง gen ภาพช็อตของ "รีวิวสินค้า" (format: review)
function buildReviewShotGenCommand(post) {
  const { base, styleRefs, composeCmd, photoPostCmd, sceneFile } = shotGenPaths(post);
  return [
    `อ่านกติกา "Review Pages" ใน AGENTS.md แล้ว gen ภาพช็อตของ Day ${post.day} (รีวิวที่ ${post.day}) คลิปที่ ${post.contentNumber} ของ ${base}/`,
    `- ใช้ prompt จากหัวข้อ "## คำสั่งสร้างภาพช็อต" ใน ${sceneFile} (### Shot K = 1 ภาพ ห้ามมีตัวหนังสือในภาพ)`,
    `- แนบ image reference ทุกภาพ: รูปสินค้าต้นฉบับ 1–3 รูปจากโฟลเดอร์ ${base}/products/ ที่ระบุใน "## สินค้า" (Product Lock ห้ามข้าม) + ภาพต้นแบบพรีเซนเตอร์จาก ${base}/characters/ (เฉพาะช็อตที่มีตัวพรีเซนเตอร์) + style references จาก ${styleRefs} (ถ้ามี)`,
    styleInstruction(post.imageStyle),
    `- เซฟเป็น ${base}/generated_posts/day${post.day}/shots/day${post.day}-content-${post.contentNumber}-shot-<K>.png`,
    `- เสร็จแล้วรัน: ${composeCmd} (ประกอบชีทรีวิว — ตัวหนังสือไทย/Overlay บนชีทมาจากสคริปต์ ห้ามให้โมเดลวาด)`,
    `- แล้วรัน: ${photoPostCmd} (ประกอบโพสต์ภาพ 4 ใบใหม่ให้ตรงกับภาพช็อตชุดล่าสุด)`,
  ]
    .filter(Boolean)
    .join("\n");
}

// คำสั่ง gen ภาพช็อตของ "ละครสั้น" (format: drama)
function buildDramaShotGenCommand(post) {
  if (isSurrealProject(post)) {
    return buildSurrealShotGenCommand(post);
  }
  const { base, styleRefs, composeCmd, sceneFile } = shotGenPaths(post);
  return [
    `อ่านกติกา "Drama Pages" ใน AGENTS.md แล้ว gen ภาพช็อตของ Day ${post.day} ฉากที่ ${post.contentNumber} ของ ${base}/`,
    `- ใช้ prompt จากหัวข้อ "## คำสั่งสร้างภาพช็อต" ใน ${sceneFile} (### Shot K = 1 ภาพ ห้ามมีตัวหนังสือในภาพ)`,
    `- แนบ image reference ทุกภาพ: ภาพต้นแบบตัวละครทุกตัวใน shot จาก ${base}/characters/ + style references 2–3 ไฟล์จาก ${styleRefs} (ถ้ามี — คุมโทนหนังเท่านั้น)`,
    styleInstruction(post.imageStyle),
    `- เซฟเป็น ${base}/generated_posts/day${post.day}/shots/day${post.day}-content-${post.contentNumber}-shot-<K>.png`,
    `- เสร็จแล้วรัน: ${composeCmd} (ประกอบชีท 4:5 — ตัวหนังสือไทยบนชีทมาจากสคริปต์ ห้ามให้โมเดลวาด)`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSurrealShotGenCommand(post) {
  const { base, styleRefs, composeCmd, sceneFile } = shotGenPaths(post);
  return [
    `อ่านกติกา make-surreal-clip และ scene brief ${sceneFile}`,
    `- ใช้ prompt จากหัวข้อ "## คำสั่งสร้างภาพช็อต" (### Shot K = 1 ภาพ) และสร้างภาพหนึ่งใบต่อหนึ่ง shot`,
    `- แนบ character master ของทุกตัวละครที่อยู่ใน shot จาก ${base}/characters/ + style references จาก ${styleRefs} (ถ้ามี) เท่านั้น`,
    `- เซฟเป็น ${base}/generated_posts/day${post.day}/shots/day${post.day}-content-${post.contentNumber}-shot-<K>.png; ห้ามมีข้อความ/โลโก้/watermark`,
    `- ตรวจภาพจริงทุกใบเทียบ prompt; ถ้าผิดให้ regenerate เฉพาะ shot ที่ผิด แล้วรัน ${composeCmd}`,
    `- หลัง compose ให้ตรวจชีทด้วยสายตาและบันทึกสิ่งที่แก้/ข้อจำกัดจริงใน day${post.day}-review.md`,
  ].filter(Boolean).join("\n");
}

// คำสั่งสั่ง Codex gen ปกเรื่อง (movie poster) แบบสั่งแยก — ใช้ได้ทั้งปกใหม่และ gen ทับปกเดิม
// ปก/ธัมบ์เนลของรีวิวสินค้า — สินค้าเป็นพระเอก จัดตาม mood/tone ของคลิป (แนบรูปสินค้าต้นฉบับ = Product Lock)
function buildReviewCoverCommand({ page, dayNumber, title, imageStyle }) {
  const base = `pages/${page.slug}/projects/${page.projectSlug}`;
  const styleId = imageStyle !== undefined ? imageStyle : page.imageStyle;
  return [
    `อ่านกติกา "Review Pages" ใน AGENTS.md แล้ว gen ภาพปก/ธัมบ์เนลของรีวิว Day ${dayNumber} (${title || `อ่านชื่อสินค้าจาก "## Day ${dayNumber}" ใน ${base}/content_planner/content-topics.md`}) ของ ${base}/`,
    `- คอนเซ็ปต์: ภาพเดียวสไตล์ธัมบ์เนลรีวิว — สินค้าเป็นพระเอกวางเด่นกลางเฟรม จัดฉาก/แสงตาม mood & tone ของคลิป (ค่าเริ่มต้นตาม page-brief.md: cozy minimal Thai home, soft natural daylight) ให้ดูน่าซื้อและสะดุดตาบนฟีด`,
    `- แนบ reference (บังคับ Product Lock): รูปสินค้าต้นฉบับ 1–3 รูปจาก ${base}/products/<product-slug>/ (ห้าม gen สินค้าโดยไม่แนบรูปต้นฉบับ ห้ามแก้/รีทัชรูปต้นฉบับ) + style references จาก pages/${page.slug}/assets/style-references/ (ถ้ามี — คุมโทนเท่านั้น)`,
    `- สัดส่วนปก: ใช้ aspect ratio เดียวกับวิดีโอรีวิว (ดูท้าย "คำสั่งสร้างวิดีโอ" ในไฟล์ day${dayNumber}-content-1.md เช่น "9:16 aspect ratio")`,
    `- ข้อความบนปก (optional): ใส่ฮุกไทยสั้น 3–6 คำตัวใหญ่อ่านชัดได้ (เช่น "รีวิวจริง!") ถ้าใส่ให้คมชัด — ถ้ากลัวตัวหนังสือเพี้ยนเว้นว่างไว้ก็ได้ · หลีกเลี่ยงช็อตซูมฉลาก/โลโก้บนตัวสินค้า (โมเดลมักทำตัวหนังสือบนแพ็กเกจเพี้ยน)`,
    styleInstruction(styleId),
    `- เซฟเป็น ${base}/generated_posts/day${dayNumber}/day${dayNumber}-cover.png (หน้าเว็บใช้เป็นปกการ์ดรีวิว)`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDramaCoverCommand({ page, dayNumber, title, imageStyle }) {
  if (isSurrealProject(page)) {
    return buildSurrealCoverCommand({ page, dayNumber, title, imageStyle });
  }
  const styleId = imageStyle !== undefined ? imageStyle : page.imageStyle;
  return [
    `อ่านกติกา "Story cover (movie poster)" ใน AGENTS.md แล้ว gen ภาพปกของเรื่อง Day ${dayNumber} ของเพจ pages/${page.slug}/`,
    `- ชื่อเรื่อง: ${title || `อ่านจากหัวข้อ "## Day ${dayNumber}" ใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/content-topics.md`}`,
    `- สัดส่วนปก: ใช้ aspect ratio เดียวกับวิดีโอของเรื่องนี้ (ดูจากท้าย "คำสั่งสร้างวิดีโอ" ในไฟล์ฉากของ Day ${dayNumber} เช่น "9:16 aspect ratio")`,
    `- แนบ reference: ภาพต้นแบบตัวละครหลักจาก pages/${page.slug}/projects/${page.projectSlug}/characters/ + โปสเตอร์ตัวอย่าง 2–3 ไฟล์จาก pages/${page.slug}/assets/cover-references/ (ถ้ามี — ดู layout/โทนเท่านั้น ห้ามลอกข้อความหรือตัวละครจากตัวอย่าง)`,
    styleInstruction(styleId),
    `- เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/generated_posts/day${dayNumber}/day${dayNumber}-cover.png`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSurrealCoverCommand({ page, dayNumber, title, imageStyle }) {
  const styleId = imageStyle !== undefined ? imageStyle : page.imageStyle;
  const base = `pages/${page.slug}/projects/${page.projectSlug}`;
  return [
    `อ่านกติกา make-surreal-clip แล้วสร้างปกคลิป Day ${dayNumber} ของ ${base}/`,
    `- ชื่อเรื่อง: ${title || `อ่านจากหัวข้อ "## Day ${dayNumber}" ใน ${base}/content_planner/content-topics.md`}`,
    `- ใช้ตัวละครหลักจาก ${base}/characters/ เป็น identity reference และใช้ aspect ratio เดียวกับคลิป`,
    `- ชื่อเรื่องและแท็กไลน์ภาษาไทยบนปกต้องเป็นข้อความที่ตั้งใจเท่านั้น; ห้ามมีป้ายร้าน เมนู โลโก้ หรือตัวหนังสือพื้นหลังเกิน`,
    styleInstruction(styleId),
    `- เซฟเป็น ${base}/generated_posts/day${dayNumber}/day${dayNumber}-cover.png แล้วตรวจข้อความและภาพจริงก่อนส่งมอบ`,
  ].filter(Boolean).join("\n");
}

function buildDramaIdeasCommand({ page, genre }) {
  if (isSurrealProject(page)) {
    return [
      `อ่านกติกา make-surreal-clip ก่อน`,
      ``,
      `คิดไอเดียคลิปเหนือจริง 5 เรื่องสำหรับ pages/${page.slug}/projects/${page.projectSlug}/`,
      `- แนว: ${genre || "คละแนว"}`,
      `- แต่ละข้อมี ordinary opening, ความผิดปกติหลัก, punchline และข้อท้าทายในการ gen`,
      `- เทียบกับหัวข้อใน content_planner/content-topics.md และห้ามซ้ำเหตุการณ์เดิม`,
      `- ยังไม่สร้างภาพหรือแก้ไฟล์ production จนกว่าผู้ใช้จะเลือก`,
    ].join("\n");
  }
  return [
    `อ่านกติกา "Drama Pages" ใน AGENTS.md ก่อน`,
    ``,
    `คิดเรื่องละครคุณธรรมสั้นใหม่ 30 เรื่อง สำหรับเพจ pages/${page.slug}/`,
    `- แนวเรื่อง: ${genre || "คละแนวจากหมวดละครคุณธรรม"}`,
    `- ห้ามซ้ำกับเรื่องที่มีอยู่แล้วใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/story-ideas.md (ถ้ามีไฟล์นี้)`,
    `- เขียนต่อท้ายไฟล์ pages/${page.slug}/projects/${page.projectSlug}/content_planner/story-ideas.md (สร้างไฟล์ถ้ายังไม่มี ห้ามลบของเก่า)`,
    `- รูปแบบต่อเรื่อง: - <ชื่อเรื่องดึงดูดคนดู> — <พล็อตย่อ 1 ประโยค: ใครโดนอะไร แล้วหักมุม/สะใจยังไง>`,
  ].join("\n");
}

// ---------- Review Studio (เพจรีวิวสินค้า type: "review") ----------

const REVIEW_PRESENTER_OPTIONS = [
  { key: "none", label: "ไม่มี", detail: "สินค้าล้วนทุกช็อต" },
  { key: "hands", label: "มือเท่านั้น", detail: "เห็นแค่มือ+แขน (ค่าเริ่มต้นสไตล์ UGC)" },
  { key: "openClose", label: "นางแบบ/นายแบบ เปิด+ปิด", detail: "โผล่ช็อตแรก+ช็อตสุดท้าย ช็อตกลางเป็นมือ" },
];

// จำนวนช็อตตามความยาวคลิป (โครงช็อตรีวิวใน AGENTS.md)
function reviewShotCount(seconds) {
  const table = { 4: 2, 6: 3, 8: 4, 10: 5 };
  return table[seconds] || 5;
}

function reviewAspectRatioLine(aspectRatio) {
  const info = DRAMA_ASPECT_RATIOS[aspectRatio] || DRAMA_ASPECT_RATIOS["9:16"];
  const orientation = aspectRatio === "16:9" ? "Horizontal 16:9" : `Vertical ${aspectRatio}`;
  return `- สัดส่วนวิดีโอ: ${aspectRatio} (${info.label}) — คำสั่งสร้างภาพช็อตทุก shot ลงท้าย "${aspectRatio} aspect ratio" ส่วนคำสั่งสร้างวิดีโอเปิดบล็อกแรกด้วย "${orientation}, ..."`;
}

function reviewPresenterLine(presenterMode, presenterName) {
  if (presenterMode === "none") {
    return `- พรีเซนเตอร์: ไม่มี — สินค้าล้วนทุกช็อต`;
  }
  if (presenterMode === "openClose") {
    return `- พรีเซนเตอร์: เปิด+ปิด — ใช้พรีเซนเตอร์ชื่อ "${presenterName}" จาก pages ของเพจนี้ characters/characters.md (ถ้ายังไม่มีให้สร้างตาม format ตัวละครครบทุก field รวมบรรยายย่อสำหรับวิดีโอ แล้ว gen reference sheet ก่อน) — โผล่เฉพาะช็อตแรก (กำลังแกะ/วาง/ใช้สินค้า ห้ามยืนถือสินค้าหันหน้ากล้อง) และช็อตสุดท้าย (lifestyle) ช็อตกลางเป็นมือของคนเดิม มือ/แขนเสื้อตรงกับชุดพรีเซนเตอร์เป๊ะ ๆ ห้ามพูดออกกล้อง`;
  }
  return `- พรีเซนเตอร์: มือเท่านั้น (UGC) — กำหนดสเปกมือ/แขนเสื้อใน "## พรีเซนเตอร์" หนึ่งบรรทัด (เช่น the same young Thai woman's hands, cream long-sleeve knit sweater) แล้ววางซ้ำทุก prompt ที่มีมือ ให้ดูเป็นคนเดียวกันทั้งคลิป`;
}

function buildReviewEpisodeCommand({ page, platform, aspectRatio, productName, productSlug, presenterMode, presenterName, sellingPoints, nextDay, imageStyle }) {
  const platformInfo = DRAMA_PLATFORM_OPTIONS[platform];
  const shotCount = reviewShotCount(platformInfo.seconds);
  const productDir = `pages/${page.slug}/projects/${page.projectSlug}/products/${productSlug}/`;
  const styleLine = styleInstruction(imageStyle);

  return [
    `อ่านกติกา "Review Pages" ใน AGENTS.md แล้วทำตามอย่างเคร่งครัดทุกข้อ`,
    `ก่อนสร้างหรือย้ายไฟล์ ให้ cd ไปที่ repository root แล้วรัน node scripts/preflight-content-workspace.mjs ${page.slug} ${page.projectSlug}. ต้องเห็น "[content-workspace] READY" ก่อนเสมอ; หากคำสั่งไม่ผ่าน ห้ามสร้างโฟลเดอร์ pages/ ใหม่หรือเขียนไฟล์ใด ๆ ให้หา workspace ที่มี AGENTS.md, package.json, src/content.js และ pages/ ก่อน`,
    ``,
    `สร้างคลิปรีวิวสินค้าใหม่ของเพจ pages/${page.slug}/ (บันทึกเป็น Day ${nextDay} = รีวิวที่ ${nextDay})`,
    `- สินค้า: ${productName}`,
    `- รูปสินค้าต้นฉบับ: แนบรูปสินค้ามากับข้อความนี้ได้เลย (ไม่ต้องเปิดโฟลเดอร์วางเอง) — Codex จะเซฟลง ${productDir} ให้ · หรือถ้าวางไฟล์ไว้ในโฟลเดอร์นั้นแล้วก็ใช้ได้`,
    sellingPoints
      ? `- ข้อมูล/จุดขายจากผู้ใช้ (ยึดเป็นหลัก): ${sellingPoints}`
      : `- ข้อมูลจากผู้ใช้: ไม่มี — วิเคราะห์จุดขายที่มองเห็นได้จากรูปเท่านั้น ห้ามแต่งราคา/สเปกเอง`,
    `- แพลตฟอร์ม: ${platformInfo.label} — คลิปเดียว ${platformInfo.seconds} วินาที Voice Over รวมทั้งคลิป ${platformInfo.minWords}–${platformInfo.maxWords} คำ (ห้ามเกิน)`,
    reviewAspectRatioLine(aspectRatio),
    ...(styleLine ? [styleLine] : []),
    `- จำนวนช็อต: ${shotCount} ช็อต ตาม "โครงช็อตรีวิว" ใน AGENTS.md (เปิดตัวสินค้า → จุดขายทีละข้อ → ปิด lifestyle)`,
    reviewPresenterLine(presenterMode, presenterName),
    ``,
    `ขั้นตอน:`,
    `1. รูปสินค้า: ถ้า ${productDir} มีไฟล์รูปอยู่แล้ว → ใช้เลย · ถ้าโฟลเดอร์ว่าง/ยังไม่มี แต่มีรูปแนบมากับข้อความนี้ → สร้างโฟลเดอร์แล้วเซฟรูปที่แนบทั้งหมดลงไปก่อน (ตั้งชื่อ product-1.<ext>, product-2.<ext>, ... — คงไฟล์ต้นฉบับไว้ ห้ามแก้/รีทัช) · ถ้าไม่มีทั้งรูปในโฟลเดอร์และรูปแนบ → หยุดแล้วขอรูปสินค้า (ห้ามเดาหน้าตาสินค้าเอง). จากนั้นเปิดดูรูปทุกไฟล์ (Read เป็นภาพ) แล้ววิเคราะห์: สินค้าคืออะไร วัสดุ/สี จุดขายที่มองเห็นได้ 3–5 ข้อ — ถ้าสินค้ามีฉลาก/โลโก้เด่น ให้เลี่ยงช็อตซูมฉลาก และเตือนผู้ใช้ตอนสรุปงาน`,
    `2. เขียนไฟล์ day${nextDay}-content-1.md ใน pages/${page.slug}/projects/${page.projectSlug}/content_planner/ ตาม "Review file format" ใน AGENTS.md ครบทุก section: ## สินค้า / ## พรีเซนเตอร์ / ## Shot List (ช่วงเวลา + มุมกล้อง + การเคลื่อนกล้อง) / ## คำสั่งสร้างภาพช็อต (### Shot K ละ 1 English prompt ห้ามมีตัวหนังสือในภาพ) / ## คำสั่งสร้างวิดีโอ (โครงบล็อก: guard line + บล็อกเปิด UGC + "Product:" + "Presenter:" (ถ้ามี) + "Important directing rule:" + บล็อก SHOT K พร้อม action, Camera:, Voice-over ไทย, SFX: + "Overall mood:") / ## Voice Over (ผูกราย shot เว้นวรรคตามวลีธรรมชาติ ห้ามเว้นวรรคคั่นรายคำ) / ## Overlay (ช็อตละ 1 วลี 3–6 คำ) / ## Caption + Hashtags (แคปชั่นสำหรับโพสต์ลงเพจ คนละชิ้นกับ VO: hook 1 บรรทัด → เนื้อหา 1–2 ย่อหน้าจากจุดขายจริง → CTA/คำเตือน → แฮชแท็ก 4–6 ตัวบรรทัดสุดท้าย — ห้ามใส่ลิงก์ร้านหรือบรรทัด 📌พิกัด เด็ดขาด หน้าเว็บแทรกให้เองจากพิกัดสินค้าของโปรเจกต์)`,
    `3. อัพเดท content-topics.md: ## Day ${nextDay} — ${productName} + - Content 1: <ความยาว/เวอร์ชัน> — <สรุปสั้น>`,
    `4. gen ภาพช็อตทีละช็อต แนบ image reference เสมอ: รูปสินค้าต้นฉบับ 1–3 รูปจาก ${productDir} (Product Lock ห้ามข้าม) + ภาพต้นแบบพรีเซนเตอร์ (เฉพาะช็อตที่มีตัว) + style references จาก pages/${page.slug}/assets/style-references/ (ถ้ามี) เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/generated_posts/day${nextDay}/shots/day${nextDay}-content-1-shot-<K>.png`,
    `5. รัน node scripts/compose-sheet.mjs ${page.slug} ${page.projectSlug} ${nextDay} (ประกอบชีทรีวิว — ตัวหนังสือไทย/Overlay บนชีทมาจากสคริปต์ ห้ามให้โมเดลสร้างภาพวาดชีทหรือตัวหนังสือเอง)`,
    `6. gen ภาพปก/ธัมบ์เนลรีวิว: ภาพเดียว สินค้าเป็นพระเอกกลางเฟรม จัดฉาก/แสงตาม mood & tone ของคลิป (page-brief.md) ให้สะดุดตาน่าซื้อ — แนบรูปสินค้าต้นฉบับจาก ${productDir} (Product Lock ห้ามข้าม) + style refs (ถ้ามี) สัดส่วนเท่าวิดีโอ เซฟเป็น pages/${page.slug}/projects/${page.projectSlug}/generated_posts/day${nextDay}/day${nextDay}-cover.png (หน้าเว็บใช้เป็นปกการ์ดรีวิว)`,
    `7. รัน node scripts/compose-sheet.mjs --photo-post ${page.slug} ${page.projectSlug} ${nextDay} (ประกอบโพสต์ภาพ 4 ใบที่ลงฟีดคู่กับคลิป — ถอดจากภาพปก ภาพช็อต และ Overlay ที่ทำไว้แล้ว ห้ามเขียนเนื้อหาใหม่ ตัวหนังสือไทยมาจากสคริปต์ ห้ามให้โมเดลวาด)`,
    ``,
    `กฎเหล็ก review ห้ามลืม: ห้าม gen ภาพสินค้าโดยไม่แนบรูปต้นฉบับ และห้ามแก้รูปต้นฉบับของผู้ใช้, เสียงทั้งคลิปเป็น Voice Over เท่านั้น ไม่มีใครพูดออกกล้อง ไม่มีบทสนทนา, Overlay อยู่บนชีทและไฟล์ .md เท่านั้น ห้ามอยู่ในภาพ gen หรือ video prompt, ข้อมูลที่มองไม่เห็นจากรูปและผู้ใช้ไม่ได้บอกห้ามแต่งเอง, ไม่มีดนตรี/เพลงประกอบ — เสียงเป็น Voice Over + product ASMR/SFX เท่านั้น และเขียน "no background music, no songs" ในคำสั่งสร้างวิดีโอ, โทนภาพตาม page-brief.md ของเพจ (ค่าเริ่มต้น cozy minimal Thai home, soft natural daylight)`,
  ].join("\n");
}

export {
  DRAMA_PLATFORM_OPTIONS,
  DRAMA_ASPECT_RATIOS,
  DRAMA_GENRES,
  DRAMA_INTENSITY_LEVELS,
  DRAMA_SCENE_COUNTS,
  dramaBeats,
  dramaWriteStepLines,
  DRAMA_IRON_RULES_LINE,
  dramaAspectRatioLine,
  buildDramaEpisodeCommand,
  buildDramaPitchCommand,
  buildDramaScenesFromPitchCommand,
  buildReviewShotGenCommand,
  buildDramaShotGenCommand,
  buildDramaCoverCommand,
  buildReviewCoverCommand,
  buildDramaIdeasCommand,
  REVIEW_PRESENTER_OPTIONS,
  reviewShotCount,
  reviewAspectRatioLine,
  reviewPresenterLine,
  buildReviewEpisodeCommand,
};
