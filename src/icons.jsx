// ไอคอนทั้งแอปอยู่ไฟล์เดียว วาดบน grid 20 เส้นหนา 1.5 และสืบสีจาก currentColor
// จึงเปลี่ยนสีตามบริบทที่วางเองได้ ต่างจาก emoji ที่สีตายตัวและขนาดขึ้นกับฟอนต์ของเครื่อง
const PATHS = {
  home: <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z" />,
  chevronRight: <path d="M7.5 4.5 13 10l-5.5 5.5" />,
  chevronLeft: <path d="M12.5 4.5 7 10l5.5 5.5" />,
  close: <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />,
  check: <path d="M4.5 10.5 8 14l7.5-8" />,
  plus: <path d="M10 4v12M4 10h12" />,
  trash: <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5.5 5.5 6 16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l.5-10.5" />,
  download: <path d="M10 3v9M6.5 8.5 10 12l3.5-3.5M4 14.5v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5" />,
  edit: <path d="M13.2 3.8a1.9 1.9 0 0 1 2.7 2.7L7.4 15 4 16l1-3.4z" />,
  // เฟือง 8 แฉกอ่านเป็นดวงอาทิตย์ตอนย่อเหลือ 17px ใช้สไลเดอร์แทน อ่านออกชัดกว่าในขนาดเล็ก
  settings: (
    <>
      <path d="M3 6h9M15 6h2M3 14h2M8 14h9" />
      <circle cx="13.5" cy="6" r="2" />
      <circle cx="6.5" cy="14" r="2" />
    </>
  ),
  person: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3 2.7-4.8 6-4.8s6 1.8 6 4.8" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4.5" width="14" height="11" rx="1.6" />
      <path d="M7 4.5v11M13 4.5v11M3 10h14" />
    </>
  ),
  bag: <path d="M5 6.5h10l.8 9.5a1 1 0 0 1-1 1.1H5.2a1 1 0 0 1-1-1.1zM7.5 8V5.5a2.5 2.5 0 0 1 5 0V8" />,
  palette: (
    <>
      <path d="M10 3a7 7 0 0 0 0 14c1 0 1.6-.7 1.6-1.5 0-.9-.7-1.3-.7-2 0-.6.5-1 1.2-1H14a3 3 0 0 0 3-3c0-3.6-3.1-6.5-7-6.5z" />
      <circle cx="7" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="11" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  pin: (
    <>
      <path d="M10 17s5-4.6 5-8a5 5 0 0 0-10 0c0 3.4 5 8 5 8z" />
      <circle cx="10" cy="9" r="1.8" />
    </>
  ),
  chat: <path d="M17 11.5a2 2 0 0 1-2 2H8l-4 3v-3H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  sound: <path d="M4 8v4h2.5L10 15V5L6.5 8zM12.8 7.6a3.4 3.4 0 0 1 0 4.8M15 5.4a6.5 6.5 0 0 1 0 9.2" />,
  text: (
    <>
      <rect x="3" y="4" width="14" height="12" rx="1.6" />
      <path d="M6.5 8h7M6.5 11h4.5" />
    </>
  ),
  more: (
    <>
      <circle cx="4.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  refresh: <path d="M16 8a6 6 0 0 0-10.8-2L4 8M4 8V4M4 8h4M4 12a6 6 0 0 0 10.8 2L16 12M16 12v4M16 12h-4" />,
};

// อยู่ในปุ่มที่มีข้อความอยู่แล้วเกือบทุกที่ จึงซ่อนจาก screen reader เป็นค่าเริ่มต้น
// ปุ่มที่มีแต่ไอคอนต้องใส่ aria-label ที่ตัวปุ่มเอง
function Icon({ name, size = 18, className }) {
  const path = PATHS[name];
  if (!path) {
    return null;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}

export { Icon };
