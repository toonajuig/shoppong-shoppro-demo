import { useState, useEffect, useRef } from "react";
import { Icon } from "./icons.jsx";

// เมนูสามจุดสำหรับของที่ไม่ควรอยู่ใต้นิ้วตลอดเวลา (แก้ไข/ลบ)
// items: [{ label, icon?, danger?, keepOpen?, onSelect }]
// keepOpen ใช้กับปุ่มที่ต้องกดสองครั้งยืนยัน — กดครั้งแรกแล้วเมนูต้องไม่ปิด ไม่งั้นกดยืนยันไม่ได้
function OverflowMenu({ label = "ตัวเลือกเพิ่มเติม", items }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    // pointerdown ไม่ใช่ click — ปิดตั้งแต่กดลง ไม่ต้องรอปล่อยนิ้ว
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="overflow-menu" ref={wrapRef}>
      <button
        className="icon-button overflow-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="more" size={18} />
      </button>

      {isOpen ? (
        <div className="overflow-list" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`overflow-item ${item.danger ? "danger" : ""}`}
              type="button"
              role="menuitem"
              onClick={() => {
                if (!item.keepOpen) {
                  setIsOpen(false);
                }
                item.onSelect();
              }}
            >
              {item.icon ? <Icon name={item.icon} size={16} /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { OverflowMenu };
