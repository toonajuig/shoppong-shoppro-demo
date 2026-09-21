import { useState } from "react";

// ร่าง = ค่าที่ผู้ใช้พิมพ์ค้างไว้ในกล่อง เก็บไว้นอก React เพื่อให้รอดตอนกล่องถูกปิดและ unmount
// อยู่ในหน่วยความจำของแท็บเท่านั้น รีเฟรชแล้วหายตามที่ตั้งใจ (docs/adr/0005)
const draftBuckets = new Map();

// ใช้แทน useState ได้ตรง ๆ โค้ดที่เหลือในกล่องไม่ต้องเปลี่ยน
function useDraftState(draftKey, field, initialValue) {
  const [value, setValue] = useState(() => {
    const bucket = draftBuckets.get(draftKey);
    return bucket && field in bucket ? bucket[field] : initialValue;
  });

  function update(next) {
    setValue((previous) => {
      const resolved = typeof next === "function" ? next(previous) : next;
      let bucket = draftBuckets.get(draftKey);
      if (!bucket) {
        bucket = {};
        draftBuckets.set(draftKey, bucket);
      }
      bucket[field] = resolved;
      return resolved;
    });
  }

  return [value, update];
}

function hasDraft(draftKey) {
  return draftBuckets.has(draftKey);
}

function clearDraft(draftKey) {
  draftBuckets.delete(draftKey);
}

// จำ target ของ mousedown ล่าสุด — ทีละกล่องอยู่แล้ว จึงใช้ตัวเดียวร่วมกันได้
let lastMouseDownTarget = null;

// คลิกพื้นหลังปิดกล่อง แต่ต้องเริ่มกดที่พื้นหลังจริง ๆ
// ลากเลือกข้อความจากในกล่องแล้วปล่อยเลยขอบ เบราว์เซอร์ยิง click ที่พื้นหลังด้วย ซึ่งไม่ควรปิด
function closeOnBackdrop(onClose) {
  return {
    onMouseDown: (event) => {
      lastMouseDownTarget = event.target;
    },
    onClick: (event) => {
      if (event.target === event.currentTarget && lastMouseDownTarget === event.currentTarget) {
        onClose();
      }
    },
  };
}

export { useDraftState, hasDraft, clearDraft, closeOnBackdrop };
