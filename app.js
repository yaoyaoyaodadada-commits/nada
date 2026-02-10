const DATA_URL = 'data/games.json';
const FAVORITES_KEY = 'retrohub:favorites';

async function loadGames() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('无法加载游戏数据');
  return res.json();
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function toggleFavorite(id) {
  const current = new Set(getFavorites());
  if (current.has(id)) current.delete(id);
  else current.add(id);
  setFavorites(Array.from(current));
  return current.has(id);
}

function gameCard(game, favSet) {
  return `
    <article class="card game-card">
      <img class="cover" src="${game.cover}" alt="${game.title} 封面" loading="lazy" />
      <h3>${game.title}</h3>
      <p class="muted">${game.platform} · ${game.genre} · ${game.year}</p>
      <p>${game.description}</p>
      <div class="hero-actions">
        <a class="btn" href="game.html?id=${encodeURIComponent(game.id)}">详情</a>
        <a class="btn primary" href="play.html?core=${encodeURIComponent(game.core)}">游玩</a>
        <button class="btn favorite-btn" data-id="${game.id}">${favSet.has(game.id) ? '★ 已收藏' : '☆ 收藏'}</button>
      </div>
    </article>
  `;
}

async function initGamesPage() {
  const listEl = document.getElementById('gamesList');
  if (!listEl) return;

  const searchEl = document.getElementById('searchInput');
  const platformEl = document.getElementById('platformFilter');
  const genreEl = document.getElementById('genreFilter');

  const games = await loadGames();

  const platforms = [...new Set(games.map((g) => g.platform))];
  const genres = [...new Set(games.map((g) => g.genre))];
  platformEl.innerHTML += platforms.map((p) => `<option value="${p}">${p}</option>`).join('');
  genreEl.innerHTML += genres.map((g) => `<option value="${g}">${g}</option>`).join('');

  const render = () => {
    const q = searchEl.value.trim().toLowerCase();
    const platform = platformEl.value;
    const genre = genreEl.value;
    const favSet = new Set(getFavorites());

    const filtered = games.filter((g) => {
      const matchQ = !q || [g.title, g.description, g.genre, g.platform].join(' ').toLowerCase().includes(q);
      const matchPlatform = !platform || g.platform === platform;
      const matchGenre = !genre || g.genre === genre;
      return matchQ && matchPlatform && matchGenre;
    });

    if (!filtered.length) {
      listEl.innerHTML = '<p class="muted">没有匹配的游戏，请调整筛选条件。</p>';
      return;
    }

    listEl.innerHTML = `<div class="grid cards-3">${filtered.map((g) => gameCard(g, favSet)).join('')}</div>`;
    listEl.querySelectorAll('.favorite-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const active = toggleFavorite(id);
        btn.textContent = active ? '★ 已收藏' : '☆ 收藏';
      });
    });
  };

  [searchEl, platformEl, genreEl].forEach((el) => el.addEventListener('input', render));
  render();
}

async function initGameDetailPage() {
  const detailEl = document.getElementById('gameDetail');
  if (!detailEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    detailEl.innerHTML = '<p class="muted">缺少游戏 ID。</p>';
    return;
  }

  const games = await loadGames();
  const game = games.find((g) => g.id === id);
  if (!game) {
    detailEl.innerHTML = '<p class="muted">未找到该游戏。</p>';
    return;
  }

  const isFav = new Set(getFavorites()).has(game.id);
  detailEl.innerHTML = `
    <article class="card detail-layout">
      <img class="cover large" src="${game.cover}" alt="${game.title} 封面" />
      <div>
        <h1>${game.title}</h1>
        <p class="muted">${game.platform} · ${game.genre} · ${game.year} · ${game.players} 人</p>
        <p>${game.description}</p>
        <p class="muted">ROM 提示：${game.romHint}</p>
        <div class="hero-actions">
          <a class="btn primary" href="play.html?core=${encodeURIComponent(game.core)}">使用 ${game.core.toUpperCase()} 核心游玩</a>
          <button id="favDetailBtn" class="btn">${isFav ? '★ 已收藏' : '☆ 收藏'}</button>
        </div>
      </div>
    </article>
  `;

  const btn = document.getElementById('favDetailBtn');
  btn.addEventListener('click', () => {
    const active = toggleFavorite(game.id);
    btn.textContent = active ? '★ 已收藏' : '☆ 收藏';
  });
}

async function initFavoritesPage() {
  const favEl = document.getElementById('favoritesList');
  if (!favEl) return;

  const games = await loadGames();
  const favSet = new Set(getFavorites());
  const data = games.filter((g) => favSet.has(g.id));

  if (!data.length) {
    favEl.innerHTML = '<p class="muted">你还没有收藏游戏，去游戏库点“收藏”吧。</p>';
    return;
  }

  favEl.innerHTML = `<div class="grid cards-3">${data.map((g) => gameCard(g, favSet)).join('')}</div>`;
}

async function init() {
  try {
    await Promise.all([initGamesPage(), initGameDetailPage(), initFavoritesPage()]);
  } catch (e) {
    const nodes = ['gamesList', 'gameDetail', 'favoritesList']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    nodes.forEach((n) => {
      n.innerHTML = `<p class="muted">页面数据加载失败：${e instanceof Error ? e.message : String(e)}</p>`;
    });
  }
}

init();
