const SETTINGS_BY_PAGE_KEY = "demo-facebook-settings-disabled";
const STATUS_BY_PAGE_KEY = "demo-content-status-disabled";

const DEFAULT_SETTINGS = {
  apiVersion: "v24.0",
  accessToken: "",
  pageId: "",
  pageName: "",
  isConfigured: false,
};

function normalizeSettings(rawSettings) {
  const settings = { ...DEFAULT_SETTINGS, ...(rawSettings || {}) };
  return { ...settings, isConfigured: Boolean(settings.accessToken && settings.pageId) };
}

function loadSettingsByPage() { return {}; }
function loadStatusesByPage() { return {}; }
async function fetchFbSettings() { return null; }
async function saveFbSettings() { return { demo: true }; }
async function fetchCalendar() { return null; }
async function saveCalendar() { return { demo: true }; }
function formatScheduledLabel(value) { return value ? `จำลอง ${value}` : ""; }
function toUnixSeconds(value) { return Math.floor(new Date(value).getTime() / 1000); }
async function publishPostToFacebook() { return { id: "demo-post-id", demo: true }; }
async function schedulePostToFacebook() { return { id: "demo-scheduled-post-id", demo: true }; }
async function resolvePostPermalink() { return "#demo-post"; }

export {
  DEFAULT_SETTINGS,
  SETTINGS_BY_PAGE_KEY,
  STATUS_BY_PAGE_KEY,
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
};
