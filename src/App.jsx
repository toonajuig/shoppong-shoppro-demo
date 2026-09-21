import { useState, useEffect } from "react";
import {
  apiRequest,
} from "./api.js";
import { Icon } from "./icons.jsx";
import { TopBar } from "./topbar.jsx";
import {
  AddPostModal,
  BriefEditorModal,
  CalendarPanel,
  CharacterPanel,
  ContentModal,
  SceneModal,
  ScheduleModal,
  SettingsModal,
} from "./components.jsx";
import {
  PAGES,
  charactersDocModules,
  getProjectFromUrl,
  getSlugFromUrl,
  getStoryFromUrl,
  parseCharacters,
} from "./content.js";
import { getFormat, isStoryPage, storyLabels } from "./formats.js";
import {
  DEFAULT_SETTINGS,
  fetchCalendar,
  fetchFbSettings,
  formatScheduledLabel,
  loadSettingsByPage,
  loadStatusesByPage,
  normalizeSettings,
  publishPostToFacebook,
  resolvePostPermalink,
  saveCalendar,
  saveFbSettings,
  schedulePostToFacebook,
  toUnixSeconds,
} from "./facebook.js";
import {
  DramaStudioModal,
  ReviewStudioModal,
} from "./studios.jsx";
import {
  Dashboard,
  PageView,
  StoryDetailSection,
  StoryOverviewSection,
} from "./views.jsx";

// studio modal ต่อ format (dispatch แบบ data-driven ไม่ใช่ if format===)
const STUDIO_MODALS = {
  drama: DramaStudioModal,
  review: ReviewStudioModal,
};

function App() {
  const [activeSlug, setActiveSlug] = useState(getSlugFromUrl);
  const [activeProjectSlug, setActiveProjectSlug] = useState(getProjectFromUrl);
  const [activeStory, setActiveStory] = useState(getStoryFromUrl);
  const [settingsByPage, setSettingsByPage] = useState(loadSettingsByPage);
  const [statusesByPage, setStatusesByPage] = useState(loadStatusesByPage);
  const [publishStateByPage, setPublishStateByPage] = useState({});
  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dragOverPostId, setDragOverPostId] = useState(null);
  const [addPostDay, setAddPostDay] = useState(null);
  const [editingBriefPost, setEditingBriefPost] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [projectOverrides, setProjectOverrides] = useState({});
  const [workspaceTab, setWorkspaceTab] = useState("content");
  const [scheduleModalState, setScheduleModalState] = useState({
    isOpen: false,
    post: null,
    scheduledAt: "",
    errorMessage: "",
    isScheduling: false,
  });

  // 3 ชั้น: brandPage (เพจ/แบรนด์) → activeProject (โปรเจกต์) → พื้นที่ทำงาน
  // activeProject มี shape เดียวกับ page เดิม จึงตั้ง activePage = activeProject ให้ view เดิมใช้ได้
  const brandPage = PAGES.find((page) => page.slug === activeSlug) || null;
  const activeProjectBase =
    brandPage && activeProjectSlug
      ? brandPage.projects.find((pr) => pr.projectSlug === activeProjectSlug) || null
      : null;
  const activeProjectKey = activeSlug && activeProjectSlug ? `${activeSlug}/${activeProjectSlug}` : "";
  const activeProject = activeProjectBase
    ? { ...activeProjectBase, ...(projectOverrides[activeProjectKey] || {}) }
    : null;
  const activePage = activeProject;
  const StudioModal = activePage ? STUDIO_MODALS[getFormat(activePage.type).studioKey] : null;
  const activeStoryEntry =
    isStoryPage(activeProject) && activeStory
      ? activeProject.days.find((day) => day.day === activeStory) || null
      : null;
  // FB settings / publish status เป็นระดับเพจ (แบรนด์) — ใช้ร่วมทุกโปรเจกต์
  const settings = normalizeSettings(brandPage ? settingsByPage[brandPage.slug] : null);
  const contentStatuses =
    (brandPage && activeProjectSlug && statusesByPage[brandPage.slug]?.[activeProjectSlug]) || {};
  const publishState =
    (brandPage && activeProjectSlug && publishStateByPage[brandPage.slug]?.[activeProjectSlug]) || {};

  // แท็บ "ตัวละคร" โผล่เฉพาะโปรเจกต์ที่มี characters.md จริง — แท็บว่างแย่กว่าไม่มีแท็บ
  const projectCharacters = activePage
    ? parseCharacters(
        charactersDocModules[
          `../pages/${activePage.slug}/projects/${activePage.projectSlug}/characters/characters.md`
        ] || ""
      )
    : [];
  const workspaceTabs = [
    { id: "content", label: "คอนเทนต์" },
    ...(projectCharacters.length
      ? [
          {
            id: "characters",
            // รีวิวเรียก "พรีเซนเตอร์" ละครเรียก "ตัวละคร" — ใช้คำตาม format เหมือนที่อื่นในหน้า
            label: `${isStoryPage(activePage) ? storyLabels(activePage).castWord : "ตัวละคร"} (${projectCharacters.length})`,
          },
        ]
      : []),
    { id: "calendar", label: "ปฏิทิน" },
  ];

  useEffect(() => {
    function handlePopState() {
      setActiveSlug(getSlugFromUrl());
      setActiveProjectSlug(getProjectFromUrl());
      setActiveStory(getStoryFromUrl());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // โหลด FB settings + สถานะจากไฟล์ (canonical) ทับ localStorage ตอน mount
  // ถ้าไฟล์ว่างแต่ localStorage มีข้อมูล → push ขึ้นไฟล์ (migrate ครั้งแรก)
  // ทุกอย่าง fail เงียบ → API ล่มก็ยังใช้ localStorage ต่อได้ (ไม่ regression)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fileSettings = {};
      const fileStatuses = {};
      await Promise.all(
        PAGES.map(async (page) => {
          const [s, c] = await Promise.all([
            fetchFbSettings(page.slug),
            fetchCalendar(page.slug),
          ]);
          if (s && s.isConfigured) fileSettings[page.slug] = s;
          if (c && Object.keys(c).length) fileStatuses[page.slug] = c;
        })
      );
      if (cancelled) return;

      if (Object.keys(fileSettings).length) {
        setSettingsByPage((prev) => ({ ...prev, ...fileSettings }));
      }
      if (Object.keys(fileStatuses).length) {
        setStatusesByPage((prev) => ({ ...prev, ...fileStatuses }));
      }

      // migrate เฉพาะสถานะโพสต์เดิม; token เก่าใน browser ต้องไม่ถูกเขียนกลับเข้าไฟล์
      for (const page of PAGES) {
        if (!fileStatuses[page.slug] && statusesByPage[page.slug]) {
          saveCalendar(page.slug, statusesByPage[page.slug]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // รันครั้งเดียวตอน mount (ใช้ค่า localStorage เริ่มต้นเป็น baseline สำหรับ migrate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // project.config.json อาจถูกแก้หลัง build-time glob โหลดไปแล้ว — sync ค่าปัจจุบันจาก dev API
  useEffect(() => {
    if (!activeProjectBase || !activeProjectKey) {
      return undefined;
    }

    let cancelled = false;
    apiRequest(`/api/pages/${activeProjectBase.pageSlug}/projects/${activeProjectBase.projectSlug}`)
      .then(({ config }) => {
        if (cancelled || !config) {
          return;
        }
        const updates = {};
        for (const field of ["imageStyle", "shopLink", "shopLabel"]) {
          if (typeof config[field] === "string") {
            updates[field] = config[field];
          }
        }
        setProjectOverrides((current) => {
          // อย่าให้ response เก่าจากคำขอเริ่มต้นทับค่าที่เพิ่งบันทึกใน modal
          if (current[activeProjectKey]) {
            return current;
          }
          return { ...current, [activeProjectKey]: updates };
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeProjectBase, activeProjectKey]);

  const isConfigured = Boolean(settings.isConfigured && settings.pageId);

  function resetPageView() {
    setSelectedPost(null);
    setIsSettingsOpen(false);
    setSettingsError("");
    setAddPostDay(null);
    setEditingBriefPost(null);
    setIsStudioOpen(false);
    setScheduleModalState({
      isOpen: false,
      post: null,
      scheduledAt: "",
      errorMessage: "",
      isScheduling: false,
    });
  }

  // เปิดหน้าเพจ (รายการโปรเจกต์) — ไม่เจาะจงโปรเจกต์
  function openPage(slug) {
    window.history.pushState({}, "", `/?page=${slug}`);
    setActiveSlug(slug);
    setActiveProjectSlug(null);
    setActiveStory(null);
    resetPageView();
  }

  // เปิดพื้นที่ทำงานของโปรเจกต์
  function openProject(projectSlug, pageSlug = activeSlug) {
    window.history.pushState({}, "", `/?page=${pageSlug}&project=${projectSlug}`);
    setActiveSlug(pageSlug);
    setActiveProjectSlug(projectSlug);
    setActiveStory(null);
    resetPageView();
  }

  // สลับโปรเจกต์พี่น้องในเพจเดียวกัน (แท็บบนสุดในพื้นที่ทำงาน)
  function switchProject(projectSlug) {
    if (projectSlug === activeProjectSlug) {
      return;
    }
    openProject(projectSlug);
  }

  function goToDashboard() {
    window.history.pushState({}, "", "/");
    setActiveSlug(null);
    setActiveProjectSlug(null);
    setActiveStory(null);
    resetPageView();
  }

  // กลับไปหน้าเพจ (รายการโปรเจกต์) จากพื้นที่ทำงาน
  function backToPage() {
    window.history.pushState({}, "", `/?page=${activeSlug}`);
    setActiveProjectSlug(null);
    setActiveStory(null);
    resetPageView();
  }

  function openStory(dayNumber) {
    window.history.pushState(
      {},
      "",
      `/?page=${activeSlug}&project=${activeProjectSlug}&story=${dayNumber}`
    );
    setActiveStory(dayNumber);
    resetPageView();
  }

  function closeStory() {
    window.history.pushState({}, "", `/?page=${activeSlug}&project=${activeProjectSlug}`);
    setActiveStory(null);
    resetPageView();
  }

  // สถานะชั่วคราวตอนโพสต์/ตั้งเวลา ซ้อนตามโปรเจกต์เหมือน statusesByPage
  // เพราะ postId (day1-content-1) ซ้ำกันได้ข้ามโปรเจกต์ในเพจเดียว
  function setPostPublishState(post, value) {
    setPublishStateByPage((current) => {
      const page = current[post.pageSlug] || {};
      return {
        ...current,
        [post.pageSlug]: {
          ...page,
          [post.projectSlug]: { ...(page[post.projectSlug] || {}), [post.id]: value },
        },
      };
    });
  }

  // สถานะซ้อนตามโปรเจกต์: statusesByPage[pageSlug][projectSlug][postId]
  function setPostStatus(pageSlug, projectSlug, postId, value) {
    setStatusesByPage((current) => {
      const page = current[pageSlug] || {};
      const project = page[projectSlug] || {};
      const nextPage = {
        ...page,
        [projectSlug]: {
          ...project,
          [postId]: { ...(project[postId] || {}), ...value },
        },
      };
      saveCalendar(pageSlug, nextPage); // sync ลง calendar.json (fire-and-forget)
      return { ...current, [pageSlug]: nextPage };
    });
  }

  function openSettings() {
    setDraftSettings(settings);
    setSettingsError("");
    setIsSettingsOpen(true);
  }

  async function handleImageDrop(post, event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOverPostId(null);

    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPostPublishState(post, {
        type: "error",
        message: "รองรับเฉพาะไฟล์ PNG, JPG หรือ WEBP",
      });
      return;
    }

    setPostPublishState(post, {
      type: "loading",
      message: "กำลังอัพโหลดภาพ...",
    });

    try {
      await apiRequest(`/api/pages/${post.pageSlug}/projects/${post.projectSlug}/images/${post.day}/${post.contentNumber}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      window.location.reload();
    } catch (error) {
      setPostPublishState(post, {
        type: "error",
        message: error.message || "อัพโหลดภาพไม่สำเร็จ",
      });
    }
  }

  function handleDraftChange(field, value) {
    setDraftSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveSettings() {
    if (!brandPage) {
      return;
    }

    const trimmedSettings = {
      apiVersion: draftSettings.apiVersion.trim() || "v23.0",
      pageId: draftSettings.pageId.trim(),
      pageName: draftSettings.pageName.trim(),
      accessToken: draftSettings.accessToken.trim(),
    };

    if (!trimmedSettings.accessToken) {
      setSettingsError("กรุณาใส่ Facebook Page Access Token ก่อน");
      return;
    }

    setIsSavingSettings(true);
    setSettingsError("");

    try {
      if (!trimmedSettings.pageId) {
        throw new Error("กรุณาระบุ Page ID เพื่อเก็บ credential ไว้ฝั่ง runner");
      }

      const nextSettings = {
        apiVersion: trimmedSettings.apiVersion,
        pageId: trimmedSettings.pageId,
        pageName: trimmedSettings.pageName,
        isConfigured: true,
      };

      setSettingsByPage((current) => ({
        ...current,
        [brandPage.slug]: nextSettings,
      }));
      await saveFbSettings(brandPage.slug, trimmedSettings); // token ส่งเข้า runner แล้วไม่คืนกลับ browser
      setDraftSettings({ ...nextSettings, accessToken: "" });
      setIsSettingsOpen(false);
    } catch (error) {
      setSettingsError(error.message || "บันทึกการตั้งค่าไม่สำเร็จ");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handlePublish(post) {
    const pageSlug = post.pageSlug;
    const pageSettings = normalizeSettings(settingsByPage[pageSlug]);

    if (!pageSettings.accessToken || !pageSettings.pageId) {
      setDraftSettings(pageSettings);
      setSettingsError("กรุณาตั้งค่า Facebook Page Access Token และ Page ID ก่อนโพสต์");
      setIsSettingsOpen(true);
      return;
    }

    // แคปชั่นว่าง = โพสต์เปล่าขึ้นเพจจริงแล้วแก้ไม่ได้ — กันไว้ก่อนยิง Graph API
    if (!post.caption.trim()) {
      setPostPublishState(post, {
        type: "error",
        message: 'ยังไม่มี "## Caption + Hashtags" ในไฟล์นี้ — เติมแคปชั่นก่อนโพสต์',
      });
      return;
    }

    setPostPublishState(post, {
      type: "loading",
      message: "กำลังโพสต์ไปยัง Facebook Page...",
    });

    try {
      const result = await publishPostToFacebook({ settings: pageSettings, post });
      const referenceId = result.post_id || result.id || "unknown";
      const permalinkUrl = await resolvePostPermalink({
        settings: pageSettings,
        objectId: result.post_id || result.id,
      });

      setPostPublishState(post, {
        type: "success",
        message: `โพสต์สำเร็จแล้ว (id: ${referenceId})`,
        link: permalinkUrl,
        persistedState: "published",
      });
      setPostStatus(pageSlug, post.projectSlug, post.id, {
        state: "published",
        label: "โพสต์แล้ว",
        updatedAt: new Date().toISOString(),
        postId: referenceId,
        link: permalinkUrl,
      });
    } catch (error) {
      const message = error.message || "โพสต์ไม่สำเร็จ";
      setPostPublishState(post, {
        type: "error",
        message,
      });
      setPostStatus(pageSlug, post.projectSlug, post.id, {
        state: "error",
        label: "ผิดพลาดล่าสุด",
        updatedAt: new Date().toISOString(),
        errorMessage: message,
      });
    }
  }

  function openScheduleModal(post) {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    const local = new Date(tenMinutesLater.getTime() - tenMinutesLater.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setScheduleModalState({
      isOpen: true,
      post,
      scheduledAt: local,
      errorMessage: "",
      isScheduling: false,
    });
  }

  function closeScheduleModal() {
    setScheduleModalState((current) => ({
      ...current,
      isOpen: false,
      errorMessage: "",
      isScheduling: false,
    }));
  }

  async function handleConfirmSchedule() {
    const { post, scheduledAt } = scheduleModalState;

    if (!post) {
      return;
    }

    const pageSlug = post.pageSlug;
    const pageSettings = normalizeSettings(settingsByPage[pageSlug]);

    if (!pageSettings.accessToken || !pageSettings.pageId) {
      setDraftSettings(pageSettings);
      setSettingsError("กรุณาตั้งค่า Facebook Page Access Token และ Page ID ก่อนโพสต์");
      setIsSettingsOpen(true);
      return;
    }

    if (!scheduledAt) {
      setScheduleModalState((current) => ({
        ...current,
        errorMessage: "กรุณาเลือกวันเวลาเผยแพร่",
      }));
      return;
    }

    if (!post.caption.trim()) {
      setScheduleModalState((current) => ({
        ...current,
        errorMessage: 'ยังไม่มี "## Caption + Hashtags" ในไฟล์นี้ — เติมแคปชั่นก่อนตั้งเวลา',
      }));
      return;
    }

    const scheduledPublishTime = toUnixSeconds(scheduledAt);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const minFutureSeconds = nowSeconds + 10 * 60; // FB: อย่างน้อย ~10 นาที
    const maxFutureSeconds = nowSeconds + 75 * 24 * 60 * 60; // FB: ไกลสุด ~75 วัน

    if (Number.isNaN(scheduledPublishTime) || scheduledPublishTime < minFutureSeconds) {
      setScheduleModalState((current) => ({
        ...current,
        errorMessage: "กรุณาตั้งเวลาให้ห่างจากเวลาปัจจุบันอย่างน้อยประมาณ 10 นาที",
      }));
      return;
    }

    if (scheduledPublishTime > maxFutureSeconds) {
      setScheduleModalState((current) => ({
        ...current,
        errorMessage: "Facebook ตั้งเวลาโพสต์ล่วงหน้าได้ไม่เกิน ~75 วัน — เลือกวันที่ใกล้กว่านี้",
      }));
      return;
    }

    setScheduleModalState((current) => ({
      ...current,
      isScheduling: true,
      errorMessage: "",
    }));

    setPostPublishState(post, {
      type: "loading",
      message: "กำลังส่งคำสั่งตั้งเวลาโพสต์ไปยัง Facebook Page...",
    });

    try {
      const result = await schedulePostToFacebook({
        settings: pageSettings,
        post,
        scheduledPublishTime,
      });
      const referenceId = result.post_id || result.id || "unknown";
      const permalinkUrl = await resolvePostPermalink({
        settings: pageSettings,
        objectId: result.post_id || result.id,
      });

      setPostPublishState(post, {
        type: "success",
        message: `ตั้งเวลาโพสต์สำเร็จแล้ว (id: ${referenceId})`,
        link: permalinkUrl,
        persistedState: "scheduled",
      });
      setPostStatus(pageSlug, post.projectSlug, post.id, {
        state: "scheduled",
        label: `ตั้งเวลาแล้ว${formatScheduledLabel(scheduledAt) ? ` • ${formatScheduledLabel(scheduledAt)}` : ""}`,
        updatedAt: new Date().toISOString(),
        scheduledAt,
        postId: referenceId,
        link: permalinkUrl,
      });

      setScheduleModalState((current) => ({
        ...current,
        isOpen: false,
        isScheduling: false,
        errorMessage: "",
      }));
    } catch (error) {
      const message = error.message || "ตั้งเวลาโพสต์ไม่สำเร็จ";

      setPostPublishState(post, {
        type: "error",
        message,
      });

      setScheduleModalState((current) => ({
        ...current,
        isScheduling: false,
        errorMessage: message,
      }));
      setPostStatus(pageSlug, post.projectSlug, post.id, {
        state: "error",
        label: "ผิดพลาดล่าสุด",
        updatedAt: new Date().toISOString(),
        errorMessage: message,
      });
    }
  }

  // ไม่ได้เลือกเพจ → แดชบอร์ดรวมเพจ
  if (!brandPage) {
    return (
      <Dashboard
        pages={PAGES}
        settingsByPage={settingsByPage}
        statusesByPage={statusesByPage}
        onOpenPage={openPage}
      />
    );
  }

  // เลือกเพจแล้วแต่ยังไม่เลือกโปรเจกต์ → หน้ารายการโปรเจกต์ของเพจ
  if (!activeProject) {
    return (
      <>
        <PageView
          page={brandPage}
          settings={settings}
          onOpenProject={(projectSlug) => openProject(projectSlug, brandPage.slug)}
          onBack={goToDashboard}
          onOpenSettings={openSettings}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          page={brandPage}
          draftSettings={draftSettings}
          isSaving={isSavingSettings}
          errorMessage={settingsError}
          onChange={handleDraftChange}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
        />
      </>
    );
  }

  return (
    <>
      <TopBar
        crumbs={[
          { label: "แดชบอร์ด", onClick: goToDashboard },
          { label: brandPage.name, onClick: backToPage },
          { label: activeProject.name },
        ]}
      >
        <button
          className="icon-button"
          type="button"
          onClick={openSettings}
          aria-label="ตั้งค่า Facebook"
        >
          <Icon name="settings" size={17} />
        </button>
        {isStoryPage(activePage) ? (
          <button className="button subtle" type="button" onClick={() => setIsStudioOpen(true)}>
            {storyLabels(activePage).studioButton}
          </button>
        ) : null}
        <button
          className="button primary"
          type="button"
          onClick={() => setAddPostDay(Math.max(1, ...activePage.days.map((day) => day.day)))}
        >
          <Icon name="plus" size={15} />
          เพิ่มหัวข้อ
        </button>
      </TopBar>

      <main className="app-shell">
        {brandPage.projects.length > 1 ? (
          <nav className="project-switch" aria-label="สลับโปรเจกต์">
            {brandPage.projects.map((project) => (
              <button
                key={project.projectSlug}
                type="button"
                className={`project-pill ${
                  project.projectSlug === activeProject.projectSlug ? "active" : ""
                }`}
                onClick={() => switchProject(project.projectSlug)}
              >
                {project.name}
              </button>
            ))}
          </nav>
        ) : null}

        <section className="hero">
          <div className="hero-panel">
            <span className="eyebrow">Facebook Auto Content</span>
            <div className="hero-topbar">
              <div>
                <h1>{activePage.name}</h1>
                <p className="hero-copy">
                  {activePage.description ? `${activePage.description} ` : ""}
                  กดปุ่ม “+ เพิ่มหัวข้อ” เพื่อเข้าคิวหัวข้อโพสต์ แล้วสั่ง Codex
                  เขียน brief และสร้างภาพจากคิวนั้นได้เลย
                </p>
              </div>

            </div>

            <div className={`connection-banner ${isConfigured ? "connected" : "disconnected"}`}>
              <strong>
                {isConfigured
                  ? `Facebook พร้อมใช้งาน (${brandPage.shortName})`
                  : `Facebook ยังไม่พร้อมใช้งาน (${brandPage.shortName})`}
              </strong>
              <span>
                {isConfigured
                  ? `Page: ${settings.pageName || settings.pageId} | API ${settings.apiVersion}`
                  : "ตั้งค่า Page Access Token ที่หน้าเพจ (ปุ่ม Facebook Settings) — ใช้ร่วมทุกโปรเจกต์"}
              </span>
            </div>
          </div>

          <aside className="stats-panel">
            <div className="stat-card">
              <div className="stat-label">
                {isStoryPage(activePage) ? storyLabels(activePage).unitPlural : "วัน"}
              </div>
              <div className="stat-value">{activePage.days.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">โพสต์ในโปรเจกต์</div>
              <div className="stat-value">{activePage.totalPosts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ภาพพร้อม</div>
              <div className="stat-value">{activePage.totalImages}</div>
            </div>
          </aside>
        </section>

        <nav className="workspace-tabs">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`workspace-tab ${workspaceTab === tab.id ? "active" : ""}`}
              onClick={() => setWorkspaceTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {workspaceTab === "characters" ? <CharacterPanel page={activePage} /> : null}

        {workspaceTab === "calendar" ? (
          <CalendarPanel
            pages={[{ ...brandPage, projects: [activeProject] }]}
            statusesByPage={{
              [brandPage.slug]: { [activeProject.projectSlug]: contentStatuses },
            }}
            onOpenPage={() => setWorkspaceTab("content")}
            title="ปฏิทินของโปรเจกต์นี้"
          />
        ) : null}

        {workspaceTab === "content" ? (
          isStoryPage(activePage) ? (
          activeStoryEntry ? (
            <StoryDetailSection
              page={activePage}
              dayEntry={activeStoryEntry}
              onBack={closeStory}
              onSelectPost={setSelectedPost}
            />
          ) : (
            <StoryOverviewSection
              page={activePage}
              onOpenStory={openStory}
              onOpenStudio={() => setIsStudioOpen(true)}
            />
          )
        ) : (
        <section className="days-stack">
          {activePage.days.length === 0 ? (
            <article className="day-panel">
              <p className="hero-copy">
                เพจนี้ยังไม่มีคอนเทนต์ กดปุ่ม “+ เพิ่มหัวข้อ” ด้านบน หรือปุ่ม “+ เพิ่ม Day” ด้านล่าง เพื่อเข้าคิวหัวข้อแรกได้เลย
              </p>
            </article>
          ) : null}

          {activePage.days.map((day) => {
            const readyCount = day.posts.filter((post) => post.imageHref).length;

            return (
              <article className="day-panel" key={day.day}>
                <div className="day-header">
                  <div>
                    <p className="day-kicker">Daily Batch</p>
                    <h2>Day {day.day}</h2>
                  </div>
                  <div className="day-header-actions">
                    <button
                      className="button subtle"
                      type="button"
                      onClick={() => setAddPostDay(day.day)}
                    >
                      + เพิ่มหัวข้อ
                    </button>
                    <div className="day-badge">
                      {readyCount}/{day.posts.length} images ready
                    </div>
                  </div>
                </div>

                <div className="posts-grid">
                  {day.posts.map((post) => {
                    const postPublishState = publishState[post.id];
                    const postStatus = contentStatuses[post.id];
                    const isPublished = postStatus?.state === "published";

                    return (
                      <article className="post-card" key={`${post.day}-${post.contentNumber}`}>
                        <button
                          className={`post-media compact-media-button ${
                            dragOverPostId === post.id ? "drop-active" : ""
                          }`}
                          type="button"
                          onClick={() => setSelectedPost(post)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverPostId(post.id);
                          }}
                          onDragLeave={() =>
                            setDragOverPostId((current) => (current === post.id ? null : current))
                          }
                          onDrop={(event) => handleImageDrop(post, event)}
                        >
                          {post.imageHref ? (
                            <img src={post.imageHref} alt={post.title} />
                          ) : (
                            <div className="post-placeholder">
                              ยังไม่มีภาพ — ลากรูปมาวางที่นี่ได้เลย
                              <code>
                                pages/{post.pageSlug}/projects/{post.projectSlug}/generated_posts/day{post.day}/day{post.day}
                                -content-{post.contentNumber}.png
                              </code>
                            </div>
                          )}
                          {dragOverPostId === post.id ? (
                            <div className="drop-overlay">วางรูปเพื่ออัพโหลด</div>
                          ) : null}
                        </button>

                        <div className="post-body">
                          <div className="post-topline">
                            <p className="post-key">{post.id}</p>
                            <span className={`status-pill ${postStatus?.state || "draft"}`}>
                              {postStatus?.label || "ยังไม่โพสต์"}
                            </span>
                          </div>
                          <h3>{post.title}</h3>

                          {postPublishState ? (
                            <p className={`message ${postPublishState.type}`}>{postPublishState.message}</p>
                          ) : null}

                          <div className="post-actions">
                            <button className="button primary" type="button" onClick={() => setSelectedPost(post)}>
                              ดูคอนเทนต์
                            </button>
                            {!isPublished ? (
                              <>
                                <button
                                  className="button publish"
                                  type="button"
                                  onClick={() => handlePublish(post)}
                                  disabled={postPublishState?.type === "loading"}
                                >
                                  {postPublishState?.type === "loading" ? "Posting..." : "โพสต์"}
                                </button>
                                <button
                                  className="button subtle"
                                  type="button"
                                  onClick={() => openScheduleModal(post)}
                                  disabled={postPublishState?.type === "loading"}
                                >
                                  ตั้งเวลาโพสต์
                                </button>
                              </>
                            ) : null}
                            {postPublishState?.type === "success" && postPublishState?.link ? (
                              <a
                                className="button"
                                href={postPublishState.link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                เปิดโพสต์
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </article>
            );
          })}

          <button
            className="day-add-button"
            type="button"
            onClick={() =>
              setAddPostDay(Math.max(0, ...activePage.days.map((day) => day.day)) + 1)
            }
          >
            + เพิ่ม Day {Math.max(0, ...activePage.days.map((day) => day.day)) + 1}
            <span>เพิ่มหัวข้อของวันใหม่เข้าคิว</span>
          </button>
        </section>
        )
        ) : null}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        page={brandPage}
        draftSettings={draftSettings}
        isSaving={isSavingSettings}
        errorMessage={settingsError}
        onChange={handleDraftChange}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <ScheduleModal
        isOpen={scheduleModalState.isOpen}
        post={scheduleModalState.post}
        scheduledAt={scheduleModalState.scheduledAt}
        isScheduling={scheduleModalState.isScheduling}
        errorMessage={scheduleModalState.errorMessage}
        onChange={(value) =>
          setScheduleModalState((current) => ({
            ...current,
            scheduledAt: value,
            errorMessage: "",
          }))
        }
        onClose={closeScheduleModal}
        onConfirm={handleConfirmSchedule}
      />

      {isStoryPage(activePage) ? (
        <SceneModal
          post={selectedPost}
          page={activePage}
          onProjectUpdate={(updates) =>
            setProjectOverrides((current) => ({
              ...current,
              [activeProjectKey]: { ...(current[activeProjectKey] || {}), ...updates },
            }))
          }
          onClose={() => setSelectedPost(null)}
          onEditBrief={(post) => {
            setSelectedPost(null);
            setEditingBriefPost(post);
          }}
        />
      ) : (
        <ContentModal
          post={selectedPost}
          publishState={
            selectedPost
              ? {
                  [selectedPost.id]: {
                    ...(publishState[selectedPost.id] || {}),
                    persistedState: contentStatuses[selectedPost.id]?.state,
                  },
                }
              : publishState
          }
          onClose={() => setSelectedPost(null)}
          onPublish={handlePublish}
          onSchedule={(post) => {
            // ห้ามซ้อน modal — ปิดตัวเก่าก่อนเปิดตัวใหม่เสมอ เหมือนที่ onEditBrief ทำอยู่แล้ว
            setSelectedPost(null);
            openScheduleModal(post);
          }}
          onEditBrief={(post) => {
            setSelectedPost(null);
            setEditingBriefPost(post);
          }}
        />
      )}

      {addPostDay ? (
        <AddPostModal page={activePage} defaultDay={addPostDay} onClose={() => setAddPostDay(null)} />
      ) : null}

      {editingBriefPost ? (
        <BriefEditorModal post={editingBriefPost} onClose={() => setEditingBriefPost(null)} />
      ) : null}

      {isStudioOpen && StudioModal ? (
        <StudioModal
          page={activePage}
          onProjectUpdate={(updates) =>
            setProjectOverrides((current) => ({
              ...current,
              [activeProjectKey]: { ...(current[activeProjectKey] || {}), ...updates },
            }))
          }
          onClose={() => setIsStudioOpen(false)}
        />
      ) : null}
    </>
  );
}

export default App;
