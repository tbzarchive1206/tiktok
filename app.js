const VIDEOS = Array.isArray(window.TIKTOK_ARCHIVE_DATA?.videos)
  ? window.TIKTOK_ARCHIVE_DATA.videos
  : [];

const ACCOUNTS = ["istent_theboyz", "theboyz_officl", "jakeybaee2", "kebean.moon", "eric.sohn22"];
const PAGE_SIZE = 16;

const copy = {
  en: {
    videos: "VIDEOS", accounts: "ACCOUNTS", years: "YEARS", mainPage: "MAIN PAGE",
    filters: "FILTERS", account: "ACCOUNT", member: "MEMBER", year: "YEAR", sort: "SORT",
    allAccounts: "ALL ACCOUNTS", allMembers: "ALL MEMBERS", allYears: "ALL YEARS",
    newest: "NEWEST FIRST", oldest: "OLDEST FIRST", reset: "RESET",
    empty: "TRY CHANGING THE FILTERS.", loadMore: "LOAD MORE ↓",
    original: "Original on TikTok →", download: "Download from Google Drive ↓",
    mainArchive: "MAIN ARCHIVE", backTop: "BACK TO TOP", results: "VIDEOS",
    accountPrefix: "ACCOUNT", memberPrefix: "MEMBER", yearPrefix: "YEAR"
  },
  ko: {
    videos: "영상", accounts: "계정", years: "연도", mainPage: "메인 페이지",
    filters: "필터", account: "계정", member: "멤버", year: "연도", sort: "정렬",
    allAccounts: "전체 계정", allMembers: "전체 멤버", allYears: "전체 연도",
    newest: "최신순", oldest: "오래된순", reset: "초기화",
    empty: "필터를 변경해 보세요.", loadMore: "더 보기 ↓",
    original: "TikTok 원본 보기 →", download: "Google Drive에서 다운로드 ↓",
    mainArchive: "메인 아카이브", backTop: "맨 위로", results: "영상",
    accountPrefix: "계정", memberPrefix: "멤버", yearPrefix: "연도"
  }
};

const state = {
  lang: localStorage.getItem("tbzTikTokLang") || "en",
  account: "all",
  member: "all",
  year: "all",
  sort: "newest",
  shown: PAGE_SIZE
};

const $ = selector => document.querySelector(selector);
const grid = $("#videoGrid");
const accountFilter = $("#accountFilter");
const memberFilter = $("#memberFilter");
const yearFilter = $("#yearFilter");
const sortFilter = $("#sortFilter");
const loadMore = $("#loadMore");
const resetFilters = $("#resetFilters");
const langToggle = $("#langToggle");

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const cleanAccount = value => String(value || "").replace(/^@/, "").trim();
const videoId = video => String(video.tiktokId || "").trim() || (String(video.tiktokUrl || "").match(/\/video\/(\d+)/)?.[1] || "");
const playerUrl = video => `https://www.tiktok.com/player/v1/${encodeURIComponent(videoId(video))}?controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&timestamp=1&music_info=0&description=0&autoplay=0`;
const compactDate = video => String(video.date || "").replaceAll("-", "").slice(-6) || String(video.dateCode || "").slice(-6) || "------";
const chronology = video => `${String(video.date || "").replaceAll("-", "")}|${videoId(video)}`;

function memberList(video) {
  if (Array.isArray(video.members)) return video.members.map(String);
  return String(video.members || "").split(/[,;/|]+/).map(v => v.trim()).filter(Boolean);
}

function truncateTitle(text, max = 92) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, Math.max(0, max - 6)).trimEnd() + " [...]";
}

function cardTitle(video) {
  return truncateTitle(`${compactDate(video)} ${video.description || ""}`.trim());
}

function driveDownloadUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const match = url.match(/\/d\/([A-Za-z0-9_-]+)/) || url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(match[1])}`;
  return url;
}

function filteredVideos() {
  let list = VIDEOS.filter(video => {
    const accountOk = state.account === "all" || cleanAccount(video.account) === state.account;
    const memberOk = state.member === "all" || memberList(video).some(name => name.toLowerCase() === state.member.toLowerCase());
    const yearOk = state.year === "all" || String(video.year || "") === state.year;
    return accountOk && memberOk && yearOk && videoId(video);
  });

  list = [...list].sort((a, b) => {
    const result = chronology(a).localeCompare(chronology(b));
    return state.sort === "oldest" ? result : -result;
  });
  return list;
}

function applyHeaderStats() {
  const years = VIDEOS.map(v => Number(v.year)).filter(y => Number.isFinite(y) && y > 0);
  $("#totalVideos").textContent = VIDEOS.length.toLocaleString("en-US");
  $("#totalAccounts").textContent = String(ACCOUNTS.length).padStart(2, "0");
  if (years.length) $("#yearRange").textContent = `${Math.min(...years)}—${Math.max(...years)}`;
}

function activeFilterText() {
  const L = copy[state.lang];
  const parts = [];
  if (state.account !== "all") parts.push(`${L.accountPrefix}: @${state.account}`);
  if (state.member !== "all") parts.push(`${L.memberPrefix}: ${state.member}`);
  if (state.year !== "all") parts.push(`${L.yearPrefix}: ${state.year}`);
  return parts.join(" / ");
}

function renderVideos() {
  const L = copy[state.lang];
  const list = filteredVideos();
  const visible = list.slice(0, state.shown);

  $("#resultsLabel").textContent = `${list.length.toLocaleString("en-US")} ${L.results}`;
  $("#activeFilters").textContent = activeFilterText();

  grid.innerHTML = visible.map(video => {
    const original = String(video.tiktokUrl || "").trim();
    const download = driveDownloadUrl(video.driveUrl);
    const title = cardTitle(video);
    const account = cleanAccount(video.account);

    return `<article class="video-card">
      <div class="video-embed">
        <iframe
          src="${esc(playerUrl(video))}"
          loading="lazy"
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          title="${esc(title)}"></iframe>
      </div>
      <div class="video-info">
        <div class="eyebrow">@${esc(account)}</div>
        <h2 title="${esc(`${compactDate(video)} ${video.description || ""}`.trim())}">${esc(title)}</h2>
        <div class="video-links">
          ${original ? `<a href="${esc(original)}" target="_blank" rel="noopener noreferrer">${esc(L.original)}</a>` : ""}
          ${download ? `<a href="${esc(download)}" target="_blank" rel="noopener noreferrer">${esc(L.download)}</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");

  $("#empty").hidden = list.length > 0;
  loadMore.hidden = state.shown >= list.length;
  loadMore.textContent = L.loadMore;
}

function applyLanguage() {
  const L = copy[state.lang];
  document.documentElement.lang = state.lang === "ko" ? "ko" : "en";
  langToggle.textContent = state.lang === "ko" ? "KOR" : "EN";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (L[key]) el.textContent = L[key];
  });
  renderVideos();
}

function resetShownAndRender() {
  state.shown = PAGE_SIZE;
  renderVideos();
}

accountFilter.addEventListener("change", event => { state.account = event.target.value; resetShownAndRender(); });
memberFilter.addEventListener("change", event => { state.member = event.target.value; resetShownAndRender(); });
yearFilter.addEventListener("change", event => { state.year = event.target.value; resetShownAndRender(); });
sortFilter.addEventListener("change", event => { state.sort = event.target.value; resetShownAndRender(); });

resetFilters.addEventListener("click", () => {
  state.account = "all";
  state.member = "all";
  state.year = "all";
  state.sort = "newest";
  state.shown = PAGE_SIZE;
  accountFilter.value = "all";
  memberFilter.value = "all";
  yearFilter.value = "all";
  sortFilter.value = "newest";
  renderVideos();
});

loadMore.addEventListener("click", () => {
  state.shown += PAGE_SIZE;
  renderVideos();
});

langToggle.addEventListener("click", () => {
  state.lang = state.lang === "en" ? "ko" : "en";
  localStorage.setItem("tbzTikTokLang", state.lang);
  applyLanguage();
});

applyHeaderStats();
applyLanguage();
