import { Icon } from "./icons.jsx";
import { AutomationStatus } from "./automation-status.jsx";

// แถบบนสุดของทุกหน้า ติดอยู่กับที่ตอนเลื่อน (ADR 0002)
// crumbs บอกตำแหน่งใน 3 ชั้น เพจ → โปรเจกต์ ส่วนการสลับโปรเจกต์ในชั้นเดียวกัน
// เป็นคนละการกระทำ จึงอยู่คนละที่และหน้าตาไม่เหมือนกัน (ดู .project-tabs)
// crumb ที่มี onClick กดขึ้นชั้นบนได้ ตัวสุดท้ายคือที่อยู่ปัจจุบันจึงไม่ต้องกด
function TopBar({ crumbs, children }) {
  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <div className="crumbs">
          <Icon name="home" size={16} className="crumb-home" />
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <span className="crumb-item" key={crumb.label}>
                {index > 0 ? <Icon name="chevronRight" size={14} className="crumb-sep" /> : null}
                {isLast || !crumb.onClick ? (
                  <span className="crumb here" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <button className="crumb" type="button" onClick={crumb.onClick}>
                    {crumb.label}
                  </button>
                )}
              </span>
            );
          })}
        </div>
        <div className="topbar-actions">
          <span className="demo-only-label">DEMO ONLY</span>
          <AutomationStatus />
          {children}
        </div>
      </div>
    </nav>
  );
}

export { TopBar };
