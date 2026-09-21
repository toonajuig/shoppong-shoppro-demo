import { useEffect, useState } from "react";
import { apiRequest } from "./api.js";
import { Icon } from "./icons.jsx";

const STATUS_LABELS = {
  ready: "พร้อม",
  degraded: "ต้องตรวจสอบ",
  down: "ไม่พร้อม",
  needs_config: "ยังไม่ตั้งค่า",
  needs_user_action: "ต้องล็อกอิน",
  unknown: "ตรวจไม่ได้",
};

function formatCheckedAt(value) {
  if (!value) return "ยังไม่ได้ตรวจ";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatNextProduction(value) {
  if (!value) return "ยังไม่กำหนดเวลา";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function formatContentLabel(contentRef) {
  const match = String(contentRef || "").match(/^day(\d+)-content-(\d+)$/i);
  return match ? `คลิปที่ ${match[1]}` : contentRef || "งานถัดไป";
}

function formatBangkokInput(value) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value)).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function bangkokInputToIso(value) {
  return new Date(`${value}:00+07:00`).toISOString();
}

function AutomationStatus() {
  const [status, setStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [busyTarget, setBusyTarget] = useState("");
  const [queueEdit, setQueueEdit] = useState(null);
  const [isQueueSaving, setIsQueueSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadStatus() {
    setIsLoading(true);
    try {
      const next = await apiRequest("/api/automation-status");
      setStatus(next);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = window.setInterval(loadStatus, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) loadStatus();
  }, [isOpen]);

  async function handleReconnect(target) {
    setBusyTarget(target);
    setErrorMessage("");
    try {
      const response = await apiRequest("/api/automation-status/reconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      setStatus(response.status);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyTarget("");
    }
  }

  function startQueueEdit(item) {
    setErrorMessage("");
    setQueueEdit({
      workerKey: item.key,
      selectedJobId: item.nextJob.id,
      productionAt: formatBangkokInput(item.nextJob.productionAt),
    });
  }

  async function handleQueueSave(item) {
    if (!queueEdit?.selectedJobId || !queueEdit.productionAt) return;
    setIsQueueSaving(true);
    setErrorMessage("");
    try {
      await apiRequest(`/api/pages/page-1/projects/surreal-clips/automation-jobs/${queueEdit.selectedJobId}/promote-production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionAt: bangkokInputToIso(queueEdit.productionAt),
          previousJobId: item.nextJob?.id,
        }),
      });
      setQueueEdit(null);
      await loadStatus();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsQueueSaving(false);
    }
  }

  const summaryState = status?.summary?.state || "unknown";
  const summaryLabel = status ? STATUS_LABELS[summaryState] || summaryState : "กำลังตรวจ";

  return (
    <div className="automation-status">
      <button
        className={`automation-status-trigger state-${summaryState}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="automation-status-panel"
      >
        <span className="automation-status-dot" />
        <span>ระบบอัตโนมัติ</span>
        <span className="automation-status-label">{summaryLabel}</span>
      </button>

      {isOpen ? (
        <section className="automation-status-panel" id="automation-status-panel" aria-label="สถานะระบบอัตโนมัติ">
          <div className="automation-status-header">
            <div>
              <p className="automation-status-kicker">AUTOMATION STATUS</p>
              <h2>สถานะการเชื่อมต่อ</h2>
            </div>
            <button className="icon-button" type="button" onClick={loadStatus} disabled={isLoading} aria-label="ตรวจสถานะใหม่">
              <Icon name="refresh" size={17} />
            </button>
          </div>

          {errorMessage ? <p className="message error">{errorMessage}</p> : null}

          <div className="automation-status-list">
            {(status?.items || []).map((item) => (
              <div className="automation-status-row" key={item.key}>
                <div className="automation-status-row-main">
                  <span className={`automation-status-dot state-${item.state}`} />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.message}</p>
                    {item.key === "worker" && item.nextJob ? (
                      <>
                        <p className="automation-status-next-job">
                          คิวถัดไป: {formatContentLabel(item.nextJob.contentRef)} — {item.nextJob.title}
                          <br />
                          สร้าง: {formatNextProduction(item.nextJob.productionAt)} น.
                        </p>
                        {item.nextJob.status === "queued" ? (
                          queueEdit?.workerKey === item.key ? (
                            <div className="automation-queue-editor">
                              <label>
                                งานที่จะให้ Worker ทำก่อน
                                <select
                                  value={queueEdit.selectedJobId}
                                  onChange={(event) => {
                                    const selected = (item.queue || []).find((job) => job.id === event.target.value);
                                    setQueueEdit((current) => ({
                                      ...current,
                                      selectedJobId: event.target.value,
                                      productionAt: formatBangkokInput(selected?.productionAt),
                                    }));
                                  }}
                                >
                                  {(item.queue || []).map((job) => (
                                    <option key={job.id} value={job.id}>
                                      {formatContentLabel(job.contentRef)} — {job.title}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                วันเวลาเริ่มสร้าง (Asia/Bangkok)
                                <input
                                  type="datetime-local"
                                  value={queueEdit.productionAt}
                                  onChange={(event) => setQueueEdit((current) => ({ ...current, productionAt: event.target.value }))}
                                />
                              </label>
                              <div className="automation-queue-editor-actions">
                                <button
                                  className="button subtle"
                                  type="button"
                                  onClick={() => handleQueueSave(item)}
                                  disabled={isQueueSaving}
                                >
                                  {isQueueSaving ? "กำลังบันทึก..." : "บันทึกคิว"}
                                </button>
                                <button className="button subtle" type="button" onClick={() => setQueueEdit(null)} disabled={isQueueSaving}>
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button className="button subtle automation-queue-edit" type="button" onClick={() => startQueueEdit(item)} disabled={Boolean(busyTarget) || isQueueSaving}>
                              แก้ไขคิวถัดไป
                            </button>
                          )
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="automation-status-row-side">
                  <span className={`automation-status-badge state-${item.state}`}>
                    {STATUS_LABELS[item.state] || item.state}
                  </span>
                  {item.canReconnect ? (
                    <button
                      className="button subtle automation-reconnect"
                      type="button"
                      onClick={() => handleReconnect(item.key)}
                      disabled={Boolean(busyTarget) || isQueueSaving}
                    >
                      {busyTarget === item.key ? "กำลังเชื่อมต่อ..." : "Reconnect"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <p className="automation-status-checked">ตรวจล่าสุด: {formatCheckedAt(status?.checkedAt)}</p>
        </section>
      ) : null}
    </div>
  );
}

export { AutomationStatus };
