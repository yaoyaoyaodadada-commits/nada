# RetroHub（EmulatorJS 中文游戏网站）

这是一个参考 emulatorgamer 站点形态并进一步增强的可运行模板，包含：

- 多子页面导航
- 游戏数据源（JSON）
- 游戏库搜索 + 筛选
- 游戏详情页
- 本地收藏功能（localStorage）
- EmulatorJS 在线游玩（URL / 本地 ROM）

## 页面

- `index.html`：首页
- `games.html`：游戏库（动态渲染）
- `game.html`：游戏详情页
- `favorites.html`：收藏页
- `play.html`：在线游玩（EmulatorJS）
- `guides.html`：教程
- `about.html`：关于

## 数据与脚本

- `data/games.json`：游戏数据
- `app.js`：库/详情/收藏逻辑
- `script.js`：EmulatorJS 启动逻辑
- `styles.css`：全站样式

## 本地运行

```bash
python3 -m http.server 8080
```

浏览器打开：

```text
http://localhost:8080
```

> 请仅使用你有合法权利使用的 ROM 文件。
