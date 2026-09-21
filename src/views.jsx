import { useState, useMemo } from "react";
import {
  SLUG_INPUT_PATTERN,
  UPLOAD_IMAGE_TYPES,
  apiRequest,
  numberedSlug,
} from "./api.js";
import { Icon } from "./icons.jsx";
import { TopBar } from "./topbar.jsx";
import { OverflowMenu } from "./menu.jsx";
import {
  CalendarPanel,
  CharacterPanel,
  CopyButton,
  CopyImageButton,
  DownloadImageButton,
  PageFormModal,
  TrashModal,
  buildCharacterUsage,
} from "./components.jsx";
import {
  PAGES,
  charactersDocModules,
  parseCharacters,
  parseDramaScene,
} from "./content.js";
import { FORMAT_LABELS, FORMAT_OPTIONS, coverCommandFor, storyLabels } from "./formats.js";
import { clearDraft, closeOnBackdrop, useDraftState } from "./drafts.js";

function StoryOverviewSection({ page, onOpenStory, onOpenStudio }) {
  const [busyCoverDay, setBusyCoverDay] = useState(null);
  const [coverError, setCoverError] = useState("");
  const labels = storyLabels(page);

  const markdown = charactersDocModules[`../pages/${page.slug}/projects/${page.projectSlug}/characters/characters.md`] || "";
  const characters = parseCharacters(markdown);
  const usage = buildCharacterUsage(page, characters);
  const nextDay = Math.max(0, ...page.days.map((day) => day.day)) + 1;

  async function handleCoverDrop(day, event) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !UPLOAD_IMAGE_TYPES.includes(file.type)) {
      return;
    }

    setBusyCoverDay(day.day);
    setCoverError("");
    try {
      await apiRequest(`/api/pages/${page.pageSlug}/projects/${page.projectSlug}/covers/${day.day}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      window.location.reload();
    } catch (error) {
      setCoverError(error.message);
      setBusyCoverDay(null);
    }
  }

  return (
    <section className="story-overview">
      <div className="story-overview-header">
        <div>
          <p className="day-kicker">{labels.overviewKicker}</p>
          <h2>{labels.unitPlural} ({page.days.length})</h2>
        </div>
      </div>

      {page.days.length === 0 ? (
        <p className="helper-copy">
          เพจนี้ยังไม่มี{labels.sceneWord === "คลิป" ? "รีวิว" : "เรื่อง"} — กดการ์ด "สร้าง{labels.unitAt} 1"
          เพื่อเปิด {labels.studioName} แล้วเอาคำสั่งไปวางใน Codex ได้เลย
        </p>
      ) : null}

      {coverError ? <p className="message error">{coverError}</p> : null}

      <div className="story-cards">
        {page.days.map((day) => {
          const readyCount = day.posts.filter((post) => post.imageHref).length;
          const castCount = characters.filter((character) =>
            usage.get(character.name)?.has(day.day)
          ).length;
          const progress = day.posts.length ? Math.round((readyCount / day.posts.length) * 100) : 0;

          return (
            <article
              className="story-card"
              key={day.day}
              role="button"
              tabIndex={0}
              onClick={() => onOpenStory(day.day)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onOpenStory(day.day);
                }
              }}
            >
              <div
                className="story-cover"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleCoverDrop(day, event)}
              >
                {day.coverHref ? (
                  <img src={day.coverHref} alt={day.title || `${labels.unitAt} ${day.day}`} />
                ) : (
                  <div className="story-cover-placeholder">
                    {busyCoverDay === day.day ? "กำลังอัพโหลด..." : labels.coverHint}
                  </div>
                )}
                <span className="story-number">{labels.unitAt} {day.day}</span>
              </div>
              <div className="story-info">
                <strong>{day.title || `${labels.unitAt} ${day.day}`}</strong>
                <div className="story-progress">
                  <div className="story-progress-bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <span className="story-progress-label">
                    {readyCount}/{day.posts.length} สตอรี่บอร์ด
                  </span>
                </div>
                <div className="story-meta">
                  <span>
                    <Icon name="person" size={15} className="inline-icon" />
                    {castCount} {labels.castWord}</span>
                  <span>
                    <Icon name="film" size={15} className="inline-icon" />
                    {day.posts.length} {labels.sceneWord}</span>
                </div>
                {coverCommandFor(page) ? (
                  <span
                    className="story-cover-action"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <CopyButton
                      text={coverCommandFor(page)({ page, dayNumber: day.day, title: day.title })}
                      label={day.coverHref ? "คำสั่ง gen ปกใหม่" : "คัดลอกคำสั่งสร้างปก"}
                    />
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}

        <button className="story-card story-card-add" type="button" onClick={onOpenStudio}>
          <span className="story-add-plus">＋</span>
          <strong>สร้าง{labels.unitAt} {nextDay}</strong>
          <span>เปิด {labels.studioName} เพื่อสร้างคำสั่งใหม่</span>
        </button>
      </div>
    </section>
  );
}

// หน้ารายละเอียดเรื่องเดียว — ตัวละครเฉพาะเรื่องนี้ + ฉากทั้งหมดของเรื่อง
function StoryDetailSection({ page, dayEntry, onBack, onSelectPost }) {
  const readyCount = dayEntry.posts.filter((post) => post.imageHref).length;
  const labels = storyLabels(page);

  return (
    <>
      <section className="story-detail-header">
        <button className="button subtle" type="button" onClick={onBack}>
          <Icon name="chevronLeft" size={16} />
          {labels.backLabel}
        </button>
        <div className="story-detail-title">
          <p className="day-kicker">{labels.detailKicker}</p>
          <h2>
            {labels.unitAt} {dayEntry.day}
            {dayEntry.title ? ` — ${dayEntry.title}` : ""}
          </h2>
        </div>
        {coverCommandFor(page) ? (
          <CopyButton
            text={coverCommandFor(page)({ page, dayNumber: dayEntry.day, title: dayEntry.title })}
            label={dayEntry.coverHref ? "คำสั่ง gen ปกใหม่" : "คัดลอกคำสั่งสร้างปก"}
          />
        ) : null}
        <div className="day-badge">
          {readyCount}/{dayEntry.posts.length} สตอรี่บอร์ดพร้อม
        </div>
      </section>

      {dayEntry.coverHref ? (
        <section className="story-cover-panel">
          <img
            src={dayEntry.coverHref}
            alt={`ปก${labels.unitAt} ${dayEntry.day}`}
          />
          <div className="story-cover-panel-info">
            <p className="day-kicker">Cover</p>
            <h3>ปก{labels.unitAt} {dayEntry.day}</h3>
            <p className="helper-copy">
              ดาวน์โหลดไฟล์ปกลงเครื่อง หรือคัดลอกตัวภาพไปวางในแชท/เครื่องมืออื่นได้เลย
            </p>
            <div className="story-cover-panel-actions">
              <DownloadImageButton
                imageHref={dayEntry.coverHref}
                fileName={`day${dayEntry.day}-cover`}
                label="ดาวน์โหลดหน้าปก"
                className="primary"
              />
              <CopyImageButton imageHref={dayEntry.coverHref} label="คัดลอกภาพปก" />
            </div>
          </div>
        </section>
      ) : null}

      <CharacterPanel page={page} storyDay={dayEntry.day} />

      <article className="day-panel">
        <div className="day-header">
          <div>
            <p className="day-kicker">{labels.scenesKicker}</p>
            <h2>{labels.scenesHeading} ({dayEntry.posts.length})</h2>
          </div>
        </div>

        <div className="storyboard-grid">
          {dayEntry.posts.map((post) => {
            const scene = parseDramaScene(post.markdown || "");

            return (
              <button
                className="scene-card"
                type="button"
                key={post.id}
                onClick={() => onSelectPost(post)}
              >
                <div className="scene-cover">
                  {post.imageHref ? (
                    <img src={post.imageHref} alt={post.title} />
                  ) : (
                    <div className="scene-cover-placeholder">ยังไม่มีสตอรี่บอร์ด</div>
                  )}
                  <span className="scene-number">{labels.sceneWord} {post.contentNumber}</span>
                  {scene.shotList.length ? (
                    <span className="scene-shots-badge">{scene.shotList.length} shot</span>
                  ) : null}
                </div>
                <div className="scene-info">
                  <strong>{scene.beat || post.title}</strong>
                  <span>{scene.summary || post.summary || "ยังไม่มีบท"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </article>
    </>
  );
}


function Dashboard({ pages, settingsByPage, statusesByPage, onOpenPage }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState(null);
  const [busySlug, setBusySlug] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const totalPosts = pages.reduce((sum, page) => sum + page.totalPosts, 0);
  const totalImages = pages.reduce((sum, page) => sum + page.totalImages, 0);
  const connectedCount = pages.filter((page) => {
    const settings = settingsByPage[page.slug];
    return Boolean(settings?.accessToken && settings?.pageId);
  }).length;

  async function handleDelete(slug) {
    if (confirmDeleteSlug !== slug) {
      setConfirmDeleteSlug(slug);
      setErrorMessage("");
      return;
    }

    setBusySlug(slug);
    setErrorMessage("");

    try {
      await apiRequest(`/api/pages/${slug}`, { method: "DELETE" });
      window.location.href = "/";
    } catch (error) {
      setErrorMessage(error.message);
      setBusySlug("");
      setConfirmDeleteSlug(null);
    }
  }

  return (
    <>
      <TopBar crumbs={[{ label: "แดชบอร์ด" }]}>
        <button
          className="icon-button"
          type="button"
          onClick={() => setIsTrashOpen(true)}
          aria-label="ถังขยะ"
        >
          <Icon name="trash" size={17} />
        </button>
        <button className="button primary" type="button" onClick={() => setIsCreateOpen(true)}>
          <Icon name="plus" size={15} />
          สร้างเพจ
        </button>
      </TopBar>

      <main className="app-shell">
      <section className="hero">
        <div className="hero-panel">
          <span className="eyebrow">Facebook Auto Content</span>
          <div className="hero-topbar">
            <div>
              <h1>แดชบอร์ดเพจ</h1>
              <p className="hero-copy">
                จัดการทุกเพจได้จากที่เดียว คลิกการ์ดเพื่อเข้าไปดูคอนเทนต์ โพสต์ และตั้งเวลาโพสต์
                ของเพจนั้น การลบเพจจะย้ายไปเก็บที่ <code>_trash/</code> กู้คืนได้เสมอ
              </p>
            </div>
          </div>
        </div>

        <aside className="stats-panel dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">เพจทั้งหมด</div>
            <div className="stat-value">{pages.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">โพสต์ทุกเพจ</div>
            <div className="stat-value">{totalPosts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">ภาพพร้อมทุกเพจ</div>
            <div className="stat-value">{totalImages}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">เชื่อม FB แล้ว</div>
            <div className="stat-value">
              {connectedCount}/{pages.length}
            </div>
          </div>
        </aside>
      </section>

      {errorMessage ? <p className="message error">{errorMessage}</p> : null}

      <section className="dashboard-grid">
        {pages.map((page) => {
          const settings = settingsByPage[page.slug];
          const isConnected = Boolean(settings?.accessToken && settings?.pageId);
          // สถานะซ้อน 2 ชั้น: [pageSlug][projectSlug][postId] — ต้องแบนโปรเจกต์ออกก่อนนับ
          const pageStatuses = Object.values(statusesByPage[page.slug] || {}).flatMap((project) =>
            Object.values(project || {})
          );
          const publishedCount = pageStatuses.filter(
            (status) => status.state === "published"
          ).length;
          const scheduledCount = pageStatuses.filter(
            (status) => status.state === "scheduled"
          ).length;

          return (
            <article className="dash-card" key={page.slug}>
              <div className="dash-card-cover">
                {page.coverHref ? (
                  <img src={page.coverHref} alt="" />
                ) : page.logoHref ? (
                  <img className="dash-card-cover-logo" src={page.logoHref} alt={page.name} />
                ) : (
                  <div className="dash-cover-fallback">{page.shortName.slice(0, 2)}</div>
                )}
                {page.coverHref && page.logoHref ? (
                  <img className="dash-card-logo" src={page.logoHref} alt="" />
                ) : null}
              </div>

              <div className="dash-card-body">
                {/* ปุ่มนี้ยืด ::after คลุมทั้งใบ คลิกตรงไหนก็เข้าเพจ ส่วนเมนูยกขึ้นเหนือมันด้วย z-index */}
                <h3>
                  <button
                    className="card-open"
                    type="button"
                    onClick={() => onOpenPage(page.slug)}
                  >
                    {page.name}
                  </button>
                </h3>

                <p className="card-meta">
                  {page.projects.length} โปรเจกต์ · {page.totalPosts} คอนเทนต์
                  {page.totalImages ? ` · ${page.totalImages} ภาพพร้อม` : ""}
                </p>

                <div className="card-foot">
                  <span className="card-state">
                    <span className={`led ${isConnected ? "on" : ""}`} />
                    {isConnected ? "เชื่อม FB แล้ว" : "ยังไม่เชื่อม FB"}
                    {publishedCount ? <em className="ok">โพสต์แล้ว {publishedCount}</em> : null}
                    {scheduledCount ? <em className="warn">ตั้งเวลา {scheduledCount}</em> : null}
                  </span>

                  <OverflowMenu
                    label={`ตัวเลือกของเพจ ${page.name}`}
                    items={[
                      {
                        label: "แก้ไขเพจ",
                        icon: "edit",
                        onSelect: () => {
                          setConfirmDeleteSlug(null);
                          setEditingPage(page);
                        },
                      },
                      {
                        label:
                          busySlug === page.slug
                            ? "กำลังย้ายไป _trash..."
                            : confirmDeleteSlug === page.slug
                              ? "ยืนยันลบเพจ?"
                              : "ลบเพจ",
                        icon: "trash",
                        danger: true,
                        keepOpen: true,
                        onSelect: () => handleDelete(page.slug),
                      },
                    ]}
                  />
                </div>
              </div>
            </article>
          );
        })}

        <button className="dash-card create-card" type="button" onClick={() => setIsCreateOpen(true)}>
          <span className="create-card-plus">+</span>
          <span className="create-card-label">สร้างเพจใหม่</span>
          <span className="create-card-hint">brief, planner และโฟลเดอร์ภาพ ถูกสร้างให้อัตโนมัติ</span>
        </button>
      </section>

      <CalendarPanel pages={pages} statusesByPage={statusesByPage} onOpenPage={onOpenPage} />

      {isCreateOpen ? (
        <PageFormModal mode="create" pages={pages} onClose={() => setIsCreateOpen(false)} />
      ) : null}

      {isTrashOpen ? <TrashModal onClose={() => setIsTrashOpen(false)} /> : null}

      {editingPage ? (
        <PageFormModal
          mode="edit"
          page={editingPage}
          pages={pages}
          onClose={() => setEditingPage(null)}
        />
      ) : null}
      </main>
    </>
  );
}

// ตัวเลือกการเรียงการ์ดโปรเจกต์ — createdAt ว่าง (โปรเจกต์เก่าที่ไม่มีฟิลด์นี้) ถือว่าเก่าสุด
const PROJECT_SORTS = {
  newest: { label: "สร้างล่าสุดก่อน", compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  oldest: { label: "สร้างเก่าสุดก่อน", compare: (a, b) => a.createdAt.localeCompare(b.createdAt) },
  nameAsc: { label: "ชื่อ ก–ฮ", compare: (a, b) => a.name.localeCompare(b.name, "th") },
  nameDesc: { label: "ชื่อ ฮ–ก", compare: (a, b) => b.name.localeCompare(a.name, "th") },
};

// หน้าเพจ (แบรนด์) — แสดงรายการโปรเจกต์ + สร้างโปรเจกต์ใหม่ (เลือก format)
function PageView({ page, settings, onOpenProject, onBack, onOpenSettings }) {
  const [sortKey, setSortKey] = useState("newest");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);
  const [busyProject, setBusyProject] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isConfigured = Boolean(settings?.accessToken && settings?.pageId);
  const sortedProjects = useMemo(
    () => [...page.projects].sort(PROJECT_SORTS[sortKey].compare),
    [page.projects, sortKey]
  );

  // ลบโปรเจกต์ = ย้ายไป _trash/ ต้องกดสองครั้งเพื่อยืนยัน เหมือนการ์ดเพจบนแดชบอร์ด
  async function handleDeleteProject(projectSlug) {
    if (confirmDeleteProject !== projectSlug) {
      setConfirmDeleteProject(projectSlug);
      setErrorMessage("");
      return;
    }

    setBusyProject(projectSlug);
    setErrorMessage("");

    try {
      await apiRequest(`/api/pages/${page.slug}/projects/${projectSlug}`, { method: "DELETE" });
      // อยู่หน้าเพจเดิม แค่ reload ให้ glob ของ Vite อ่านโฟลเดอร์ใหม่ (PAGES เป็นค่าคงที่ตอน build)
      window.location.reload();
    } catch (error) {
      setErrorMessage(error.message);
      setBusyProject("");
      setConfirmDeleteProject(null);
    }
  }

  return (
    <>
      <TopBar crumbs={[{ label: "แดชบอร์ด", onClick: onBack }, { label: page.name }]}>
        <button
          className="icon-button"
          type="button"
          onClick={onOpenSettings}
          aria-label="ตั้งค่า Facebook"
        >
          <Icon name="settings" size={17} />
        </button>
        <button className="button primary" type="button" onClick={() => setIsCreateOpen(true)}>
          <Icon name="plus" size={15} />
          เพิ่มโปรเจกต์
        </button>
      </TopBar>

      <main className="app-shell">

        <section className="hero">
          <div className="hero-panel">
            <span className="eyebrow">เพจ</span>
            <div className="hero-topbar">
              <div>
                <h1>
                  {page.logoHref ? (
                    <img className="hero-logo" src={page.logoHref} alt={page.name} />
                  ) : null}
                  {page.name}
                </h1>
                <p className="hero-copy">
                  {page.description ||
                    "เพจนี้ทำได้หลายแนว — เพิ่มโปรเจกต์เพื่อทำอินโฟกราฟฟิก ละครสั้น หรือรีวิวสินค้า"}
                </p>
              </div>
            </div>

            <div className={`status-line ${isConfigured ? "ok" : "warn"}`}>
              {isConfigured
                ? `Facebook พร้อมโพสต์ (${settings.pageName || page.shortName})`
                : "ยังไม่ตั้งค่า Facebook — กดปุ่ม “Facebook Settings” เพื่อตั้งค่า (ใช้ร่วมทุกโปรเจกต์ในเพจนี้)"}
            </div>
          </div>

          <aside className="stats-panel">
            <div className="stat-card">
              <div className="stat-label">โปรเจกต์</div>
              <div className="stat-value">{page.projects.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">โพสต์รวม</div>
              <div className="stat-value">{page.totalPosts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ภาพพร้อม</div>
              <div className="stat-value">{page.totalImages}</div>
            </div>
          </aside>
        </section>

        {errorMessage ? <p className="message error">{errorMessage}</p> : null}

        {page.projects.length > 0 ? (
          <div className="grid-toolbar">
            <label className="sort-control">
              เรียง
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                {Object.entries(PROJECT_SORTS).map(([key, sort]) => (
                  <option key={key} value={key}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <section className="project-grid">
          {page.projects.length === 0 ? (
            <div className="empty-hint">
              ยังไม่มีโปรเจกต์ในเพจนี้ — กด “+ เพิ่มโปรเจกต์” เพื่อเริ่มงานแนวแรก
            </div>
          ) : (
            sortedProjects.map((project) => (
              <article className="project-card" key={project.projectSlug}>
                {project.coverHref ? (
                  <img className="project-card-cover" src={project.coverHref} alt="" />
                ) : (
                  <div className="project-card-cover project-card-cover-empty">
                    {FORMAT_LABELS[project.format] || project.format}
                  </div>
                )}

                <div className="project-card-body">
                  <span className="project-card-format">
                    {FORMAT_LABELS[project.format] || project.format}
                  </span>
                  <h3>
                    <button
                      className="card-open"
                      type="button"
                      onClick={() => onOpenProject(project.projectSlug)}
                    >
                      {project.name}
                    </button>
                  </h3>
                  <p className="card-meta">
                    {project.totalImages}/{project.totalPosts} ภาพพร้อม · {project.days.length} วัน
                  </p>

                  <div className="card-foot">
                    <span className="card-state">
                      <span className={`led ${project.totalImages ? "on" : ""}`} />
                      {project.totalImages ? "มีภาพพร้อมโพสต์" : "ยังไม่มีภาพ"}
                    </span>

                    <OverflowMenu
                      label={`ตัวเลือกของโปรเจกต์ ${project.name}`}
                      items={[
                        {
                          label:
                            busyProject === project.projectSlug
                              ? "กำลังย้ายไป _trash..."
                              : confirmDeleteProject === project.projectSlug
                                ? "ยืนยันลบโปรเจกต์?"
                                : "ลบโปรเจกต์",
                          icon: "trash",
                          danger: true,
                          keepOpen: true,
                          onSelect: () => handleDeleteProject(project.projectSlug),
                        },
                      ]}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {isCreateOpen ? (
        <CreateProjectModal page={page} onClose={() => setIsCreateOpen(false)} />
      ) : null}
    </>
  );
}

// สร้างโปรเจกต์ใหม่ในเพจ — เลือก format แล้ว POST /api/pages/:slug/projects
function CreateProjectModal({ page, onClose }) {
  const draftKey = `create-project:${page.slug}`;
  const [name, setName] = useDraftState(draftKey, "name", "");
  const [customSlug, setCustomSlug] = useDraftState(draftKey, "customSlug", null);
  const [format, setFormat] = useDraftState(draftKey, "format", "infographic");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ปิดโดยตั้งใจ (X / Cancel) = ทิ้งร่าง ส่วนคลิกพื้นหลังเก็บไว้ (docs/adr/0005)
  function handleDiscard() {
    clearDraft(draftKey);
    onClose();
  }

  function suggestSlug() {
    const ascii = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return ascii || numberedSlug(format, page.projects.map((project) => project.projectSlug));
  }

  // slug คิดจาก name + format ตอน render ไม่เก็บเป็น state เพราะต้องตามให้ทันทั้งสองค่า
  // customSlug เป็น null = ผู้ใช้ยังไม่ได้แก้ช่อง slug เอง
  const slug = customSlug ?? suggestSlug();

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName) {
      setErrorMessage("กรุณาตั้งชื่อโปรเจกต์");
      return;
    }
    if (!SLUG_INPUT_PATTERN.test(trimmedSlug)) {
      setErrorMessage("slug ต้องเป็น a-z, 0-9 หรือ - และขึ้นต้นด้วยตัวอักษร/ตัวเลข");
      return;
    }
    setIsBusy(true);
    setErrorMessage("");
    try {
      await apiRequest(`/api/pages/${page.slug}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: trimmedSlug, name: trimmedName, format }),
      });
      window.location.href = `/?page=${page.slug}&project=${trimmedSlug}`;
    } catch (error) {
      setErrorMessage(error.message);
      setIsBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" {...closeOnBackdrop(onClose)}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker">เพจ {page.name}</p>
            <h2>เพิ่มโปรเจกต์ใหม่</h2>
          </div>
          <button className="icon-button" type="button" onClick={handleDiscard} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="field">
          <span className="field-label">ประเภทงาน (format)</span>
          <div className="choice-chips">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`choice-chip ${format === option.id ? "active" : ""}`}
                type="button"
                onClick={() => setFormat(option.id)}
              >
                {option.label}
                <span>{option.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>ชื่อโปรเจกต์</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="เช่น ละครแนวเกษตร / รีวิวปุ๋ยยี่ห้อ X"
          />
        </label>

        <label className="field">
          <span>Slug (ชื่อโฟลเดอร์ ภาษาอังกฤษ)</span>
          <input
            type="text"
            value={slug}
            onChange={(event) => setCustomSlug(event.target.value)}
            placeholder="drama-kaset"
          />
        </label>

        {errorMessage ? <p className="message error">{errorMessage}</p> : null}

        <div className="modal-actions">
          <button className="button subtle" type="button" onClick={handleDiscard}>
            Cancel
          </button>
          <button className="button primary" type="button" onClick={handleSubmit} disabled={isBusy}>
            {isBusy ? "กำลังสร้าง..." : "สร้างโปรเจกต์"}
          </button>
        </div>
      </div>
    </div>
  );
}

export {
  StoryOverviewSection,
  StoryDetailSection,
  Dashboard,
  PageView,
  CreateProjectModal,
};
