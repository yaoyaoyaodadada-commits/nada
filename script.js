function bootEmulator() {
  const coreSelect = document.getElementById('coreSelect');
  const romUrlInput = document.getElementById('romUrl');
  const romFileInput = document.getElementById('romFile');
  const launchBtn = document.getElementById('launchBtn');
  const status = document.getElementById('status');
  const gameContainer = document.getElementById('game');

  if (!coreSelect || !launchBtn || !status || !gameContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const queryCore = urlParams.get('core');
  const queryRom = urlParams.get('romUrl');

  if (queryCore && Array.from(coreSelect.options).some((o) => o.value === queryCore)) {
    coreSelect.value = queryCore;
  }
  if (queryRom && romUrlInput) {
    romUrlInput.value = queryRom;
  }

  launchBtn.addEventListener('click', async () => {
    const core = coreSelect.value;
    const romUrl = romUrlInput?.value.trim();
    const file = romFileInput?.files?.[0];

    if (!romUrl && !file) {
      status.textContent = '请先输入 ROM 地址或上传本地 ROM 文件。';
      return;
    }

    status.textContent = '正在加载 EmulatorJS...';

    try {
      gameContainer.innerHTML = '';
      window.EJS_player = '#game';
      window.EJS_core = core;
      window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        window.EJS_gameData = new Uint8Array(arrayBuffer);
        window.EJS_gameName = file.name;
        window.EJS_gameUrl = undefined;
      } else {
        window.EJS_gameData = undefined;
        window.EJS_gameName = romUrl.split('/').pop() || 'remote-rom';
        window.EJS_gameUrl = romUrl;
      }

      const oldScript = document.getElementById('ejs-loader');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.id = 'ejs-loader';
      script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
      script.async = true;
      script.onload = () => {
        status.textContent = `已启动 ${core.toUpperCase()} 核心，正在初始化游戏。`;
      };
      script.onerror = () => {
        status.textContent = 'EmulatorJS 脚本加载失败，请检查网络环境。';
      };
      document.body.appendChild(script);
    } catch (error) {
      status.textContent = `启动失败：${error instanceof Error ? error.message : String(error)}`;
    }
  });
}

bootEmulator();
