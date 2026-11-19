// Leonida Trophy Guide: a checklist tracker for the 55 GTA VI trophies.
// Progress and settings live in localStorage; export writes a file, import reads one back.
// Nothing here makes a network request beyond loading the bundled data file.
const STORE_KEY = 'gta6-trophy-guide-v1';
const listEl = document.getElementById('trophyList');
const stagesEl = document.getElementById('stages');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const hideEarnedEl = document.getElementById('hideEarned');
const spoilersEl = document.getElementById('spoilers');
const countLineEl = document.getElementById('countLine');
const emptyEl = document.getElementById('emptyState');
const onlineNoteEl = document.getElementById('onlineNote');

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

// Load saved state, or seed it from the URL (used for shareable links and screenshots).
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}'); } catch { saved = {}; }
let earned = new Set(Array.isArray(saved.earned) ? saved.earned.filter((n) => byName.has(n)) : []);
if (params.has('earned')) {
  earned = new Set(params.get('earned').split(',').map((s) => decodeURIComponent(s.trim())).filter((n) => byName.has(n)));
}
let activeKind = 'all';
let activeStage = 0;
let spoilersOn = saved.spoilers === true || params.get('spoilers') === 'on';
let hideEarned = saved.hideEarned === true;
spoilersEl.checked = spoilersOn;
hideEarnedEl.checked = hideEarned;

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...earned],
    spoilers: spoilersOn,
    hideEarned,
    updatedAt: new Date().toISOString(),
  }));
}

function gradeLabel(t) {
  return t.grade === 'platinum' ? 'Platinum' : t.grade[0].toUpperCase() + t.grade.slice(1);
}

function isStory(t) { return t.kinds.includes('story'); }

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('earnedCount').textContent = String(done);
  document.getElementById('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
  document.getElementById('progressText').textContent =
    done === total ? 'Platinum earned — Vice Got a Price!' : `${Math.round((done / total) * 100)}% to the platinum`;
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${earnedCountFor(g)} / ${trophies.filter((t) => t.grade === g).length} ${g}`)
    .join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
}

function earnedCountFor(grade) {
  return trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
}

function renderRoadmap() {
  stagesEl.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.dataset.stage = String(stage.stage);
    if (activeStage === stage.stage) li.classList.add('active');
    const done = stage.trophies.filter((n) => earned.has(n)).length;
    li.innerHTML = '';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = stage.time;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    names.textContent = `${done} / ${stage.trophies.length} earned · ${stage.trophies.join(' · ')}`;
    li.append(num, title, time, text, names);
    const pick = () => {
      activeStage = activeStage === stage.stage ? 0 : stage.stage;
      renderRoadmap();
      renderList();
    };
    li.addEventListener('click', pick);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    stagesEl.append(li);
  }
}

function matchesFilters(t) {
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && !t.kinds.includes(activeKind)) return false;
  if (activeStage && t.stage !== activeStage) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarned && earned.has(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${(t.steps ?? []).join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderList() {
  const openName = params.get('open');
  listEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '');
    li.id = `trophy-${t.id}`;
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      persist();
      renderProgress();
      renderRoadmap();
      renderList();
    });
    const titleBox = document.createElement('div');
    titleBox.className = 'trophy-title';
    const hiddenStory = spoilersOn && isStory(t) && !earned.has(t.name);
    const h = document.createElement('h3');
    h.textContent = hiddenStory ? 'Hidden story trophy' : t.name;
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = hiddenStory ? 'Earn this trophy to reveal its name and description.' : t.description;
    titleBox.append(h, official);
    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge ${t.grade}`;
    gradeBadge.textContent = gradeLabel(t);
    badges.append(gradeBadge);
    if (t.missable) {
      const b = document.createElement('span');
      b.className = 'badge missable';
      b.textContent = '⚠ Missable';
      badges.append(b);
    }
    if (t.unconfirmed) {
      const b = document.createElement('span');
      b.className = 'badge unconfirmed';
      b.textContent = 'Unconfirmed';
      badges.append(b);
    }
    const stageBadge = document.createElement('span');
    stageBadge.className = 'badge stage';
    stageBadge.textContent = `Roadmap ${t.stage}`;
    badges.append(stageBadge);
    head.append(box, titleBox, badges);
    li.append(head);
    if (hiddenStory) {
      const p = document.createElement('p');
      p.className = 'spoiler-hidden';
      p.textContent = 'Story spoiler hidden until earned — turn the spoiler setting off above to reveal it.';
      li.append(p);
    } else {
      const guide = document.createElement('div');
      guide.className = 'guide';
      const gp = document.createElement('p');
      gp.textContent = t.guide;
      guide.append(gp);
      if (t.steps && t.steps.length) {
        const ol = document.createElement('ol');
        ol.className = 'steps';
        for (const s of t.steps) {
          const item = document.createElement('li');
          item.textContent = s;
          ol.append(item);
        }
        guide.append(ol);
      }
      li.append(guide);
      const meta = document.createElement('p');
      meta.className = 'meta-line';
      const kindsText = t.kinds.map((k) => (k === 'missable' ? 'missable' : k)).join(' · ');
      meta.textContent = `Kind: ${kindsText}${t.target ? ` · Target: ${t.target.toLocaleString('en-US')}` : ''}${t.missable ? ' · Missable: do it in Chapter 1, before the chapter ends.' : ''}`;
      li.append(meta);
      const src = document.createElement('p');
      src.className = 'sources';
      src.textContent = 'Sources: ';
      (t.sources ?? []).forEach((s, i) => {
        if (i) src.append(document.createTextNode(' · '));
        if (s.url) {
          const a = document.createElement('a');
          a.href = s.url;
          a.textContent = s.label;
          a.target = '_blank';
          a.rel = 'noopener';
          src.append(a);
        } else {
          src.append(document.createTextNode(s.label));
        }
      });
      li.append(src);
    }
    listEl.append(li);
  }
  const total = trophies.length;
  countLineEl.textContent = activeKind === 'online'
    ? '0 trophies are online — all 55 are single-player.'
    : `Showing ${shown.length} of ${total} trophies · ${earned.size} earned`;
  emptyEl.hidden = shown.length !== 0 || activeKind === 'online';
  onlineNoteEl.hidden = activeKind !== 'online';
  if (openName && byName.has(openName)) {
    const target = document.getElementById(`trophy-${byName.get(openName).id}`);
    if (target) target.scrollIntoView({ block: 'center' });
  }
}

document.getElementById('kindFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-kind]');
  if (!btn) return;
  activeKind = btn.dataset.kind;
  document.querySelectorAll('#kindFilters .kind').forEach((b) => b.classList.toggle('active', b === btn));
  renderList();
});
if (params.get('kind')) {
  const btn = document.querySelector(`#kindFilters [data-kind="${params.get('kind')}"]`);
  if (btn) btn.click();
}
gradeEl.addEventListener('change', renderList);
searchEl.addEventListener('input', renderList);
hideEarnedEl.addEventListener('change', () => { hideEarned = hideEarnedEl.checked; persist(); renderList(); });
spoilersEl.addEventListener('change', () => { spoilersOn = spoilersEl.checked; persist(); renderList(); });

document.getElementById('jumpMissable').addEventListener('click', () => {
  activeKind = 'missable';
  document.querySelectorAll('#kindFilters .kind').forEach((b) => b.classList.toggle('active', b.dataset.kind === 'missable'));
  renderList();
  document.getElementById('trophy-28')?.scrollIntoView({ block: 'center' });
});

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const valid = names.filter((n) => byName.has(n));
    if (!valid.length) throw new Error('no known trophies');
    earned = new Set(valid);
    persist();
    renderProgress();
    renderRoadmap();
    renderList();
    document.getElementById('savedNote').textContent = `Imported ${valid.length} earned trophies.`;
  } catch {
    document.getElementById('savedNote').textContent = 'That file could not be imported — export progress from this guide first.';
  }
  e.target.value = '';
});
const resetBtn = document.getElementById('reset');
let resetArmed = false;
let resetTimer = 0;
resetBtn.addEventListener('click', () => {
  if (!earned.size) return;
  if (!resetArmed) {
    resetArmed = true;
    resetBtn.textContent = 'Click again to clear all progress';
    resetTimer = window.setTimeout(() => {
      resetArmed = false;
      resetBtn.textContent = 'Reset progress';
    }, 4000);
    return;
  }
  window.clearTimeout(resetTimer);
  resetArmed = false;
  resetBtn.textContent = 'Reset progress';
  earned = new Set();
  persist();
  renderProgress();
  renderRoadmap();
  renderList();
});

renderProgress();
renderRoadmap();
renderList();
