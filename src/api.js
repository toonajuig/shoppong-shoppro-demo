const SLUG_INPUT_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const UPLOAD_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Demo API: preserves the original call sites but never sends a request or writes a file.
async function apiRequest(url, options = {}) {
  if (url === "/api/automation-status") {
    return {
      checkedAt: new Date().toISOString(),
      summary: { state: "needs_config" },
      items: [
        { key: "worker", label: "Local worker", state: "needs_config", message: "Demo mode - worker is disabled", canReconnect: false },
        { key: "flow", label: "Google Flow", state: "needs_config", message: "Demo mode - external generation is disabled", canReconnect: false },
      ],
    };
  }
  if (url.includes("/briefs/") && (!options.method || options.method === "GET")) {
    return { markdown: "Demo mode - this brief is read-only." };
  }
  return { config: {}, status: { summary: { state: "needs_config" }, items: [] } };
}

function uploadAssetFile() {
  return Promise.resolve({ demo: true });
}

function updateProject() {
  return Promise.resolve({ config: {}, demo: true });
}

function numberedSlug(prefix, existingSlugs) {
  const highest = existingSlugs.reduce((max, slug) => {
    if (!slug.startsWith(`${prefix}-`)) return max;
    const number = slug.slice(prefix.length + 1);
    return /^\d+$/.test(number) ? Math.max(max, Number(number)) : max;
  }, 0);
  return `${prefix}-${highest + 1}`;
}

export { apiRequest, numberedSlug, SLUG_INPUT_PATTERN, UPLOAD_IMAGE_TYPES, updateProject, uploadAssetFile };
