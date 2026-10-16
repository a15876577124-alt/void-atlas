# VOID ATLAS — Portfolio Polish v2 交付报告

分支：`workbuddy/polish-v2`（基于稳定基线 `1e649f9`，**未合并 main**）

| commit | 内容 |
|---|---|
| `e983814` | 基线审计文档 |
| `20235a4` | V1 叙事文字安全区 |
| `6633274` | V2 Galaxy 核心/旋臂/纵深 |
| `92c932c` | V3 Nebula 云雾分层 |
| `3a45a5c` | V4 排版与移动端构图 |

---

## 1. 实际修改内容与原因

### V1 · 叙事文字安全区（`src/style.css`）
- `.vignette` 桌面与移动端遮罩，由"左侧竖直渐变"改为"以文字区为焦点的柔和径向暗化"。
- **原因**：审计 P1 —— Cosmic Nebula 场景标题/描述直接压在亮色云雾上，三场景中唯一的文字-背景冲突，直接拉低专业质感。
- **安全性**：纯 CSS 遮罩层，不触碰任何 WebGL 逻辑。

### V2 · Galaxy 核心亮度、旋臂与盘面纵深（`src/particles.js` + `src/shaders.js`）
- 几何：核心粒子占比 13%→15%；旋臂噪声收窄（`.09+r*.035` → `.07+r*.028`）使旋臂更清晰；盘面厚度增强（`.035+(1-r/5.3)*.11` → `.048+(1-r/5.3)*.15`）增加纵深。
- Disk：旋臂锐度 `pow(...,5.)`→`pow(...,6.5)`；核心亮度 `.6`→`.78`；尘埃权重 `.55`→`.62`。
- **原因**：审计 P2 —— Galaxy 偏俯视平面、旋臂缺层次、核心亮度不足。
- **安全性**：仅改 galaxy 专属分支（`galaxy[t+1]`、`gc`/`dust`/`core`）；`particles.js` 的 `random()` 调用序列未变，horizon/nebula 几何完全一致；disk 的 horizon 分支未动。

### V3 · Nebula 云雾分层（`src/shaders.js`）
- `cloudFragment` 新增远景低频薄雾层（`deep`）与近景高频丝缕层（`fine`），形成前/中/后景纵深；色彩维持克制。
- **原因**：审计 P2 —— Nebula 色彩丰富但缺乏纵深分层，略显平铺。
- **安全性**：`clouds` 平面 `visible = weights[2] > .001`，**仅 Nebula 可见**。

### V4 · 排版与移动端构图（`src/style.css` + `src/webgl-renderer.js`）
- `story-rule` 8px→9px、提亮；移动端 `footer-top` 7px→8px。
- 移动端相机 `setViewOffset` 的 y 偏移 `-.07`→`0`，星系上移，减少描述与星系间留白。
- **原因**：审计 P3 —— `A STUDY OF LIGHT & MATTER` 近乎不可读；移动端构图重心偏低、留白偏多。
- **未改**：桌面标题尺寸（`clamp` 上限）—— 大标题是该项目编辑式排版的设计语言，且需保留首屏冲击力。

### V5 · 交互手感 —— 主动未做
- 实测 Orbit 阻尼（`dampingFactor .1`）、Zoom（`zoomSpeed .65`，范围 5.5–22）、场景过渡（0.95s）均处于合理区间，无明确可证收益。按"无明显收益则不改"原则**不做改动**。

---

## 2/3. 前后效果差异

| 项 | 优化前（1e649f9） | 优化后（polish-v2） | 判定 |
|---|---|---|---|
| Nebula 文字可读性 | 标题被亮色云雾淹没 | 左侧安全区柔和压暗，标题清晰 | **明显改善** |
| Galaxy 核心 | 亮度中等 | 白金亮核更集中、旋臂更锐 | 改善 |
| Galaxy 盘面纵深 | 偏平 | 厚度增强、层次更明显 | 改善 |
| Nebula 云雾 | 单层、略平铺 | 远/中/近三层，纵深明显 | 改善 |
| story-rule | 8px，近乎不可读 | 9px、提亮 | 改善 |
| 移动端构图 | 描述与星系间留白多 | 星系上移约 50px | 改善 |
| Event Horizon | — | **完全未变**（几何与 disk 分支未触碰） | 保持 |
| 三场景视觉身份 | 区分清晰 | 区分更清晰 | 保持 |

对比截图：`C:\Users\a1587\WorkBuddy\2026-10-15-21-27-56\baseline\`（前）与 `polish-v4\`（后）。

---

## 4. 性能变化

| 指标 | 基线 1e649f9 | polish-v2 |
|---|---|---|
| 总构建体积（gzip） | ~157.2 KB | ~157.3 KB（+0.15 KB） |
| webgl-renderer（gzip） | 140.02 KB | 140.10 KB |
| CSS（gzip） | 4.06 KB | 4.10 KB |
| 干净首屏 FCP | 380 ms | **364 ms** |
| DOMContentLoaded | 142 ms | 153 ms |
| Console 错误 / pageerror / 404 | 0 / 0 / 0 | **0 / 0 / 0** |

- 加载体积与首屏**无退化**。
- 运行时 GPU：Nebula 的 `cloudFragment` 增加 2 个 fbm 采样层，**仅 Nebula 场景、仅云雾平面**生效，属有界增加。
- 响应式六档（2560/1920/1366/390/360/320）均无横向滚动、无导航重叠、语言按钮可达。

---

## 5. 修改文件清单

| 文件 | 阶段 |
|---|---|
| `src/style.css` | V1、V4 |
| `src/particles.js` | V2 |
| `src/shaders.js` | V2、V3 |
| `src/webgl-renderer.js` | V4（仅 1 行 view offset） |
| `docs/POLISH_AUDIT.md`（新增） | 审计 |
| `docs/POLISH_REPORT.md`（新增） | 本报告 |

**未改动**：`src/i18n.js`、`src/main.js`、`src/scenes.js`、`src/quality.js`、`src/pointer.js`、`src/canvas-renderer.js`、`index.html`、`vite.config.js`、依赖版本、Event Horizon 深度遮挡逻辑、Canvas fallback 结构。

---

## 6. 未解决问题

1. **Event Horizon 边缘光精细度**：受"禁止改动深度遮挡逻辑"约束，未调整（该场景完成度本就最高）。
2. **Nebula GPU 负载**：新增 2 层 fbm 属有界增加，但**未在真实低端移动设备上实测 FPS**（仅有桌面软件渲染数据）。
3. **真实跨运营商/地区访问**、**真机触控手感**：未验证（环境限制）。
4. 桌面标题尺寸、右上控件区间距：评估为设计语言的一部分，**未改**。

---

## 7. 尝试后未采纳 / 未做项

- **V5 交互参数调整**：评估后**未做**（无明确可证收益）。
- **桌面标题字号下调**：评估后**未做**（损失首屏冲击力，且大标题是设计语言）。
- **撤回项：无**。V1–V4 均经前后截图确认有可见改善后保留。

---

## 8. 合并指引（待你决定）

- 当前 `main` = `1e649f9`（线上不变）。
- 若认可：`git checkout main && git merge workbuddy/polish-v2`，再重新 build + 部署。
- 若某项不满意：各子项独立 commit，可逐个 `git revert`。
- 若整体放弃：`git checkout main`（或使用 `D:\haorongli09\_BACKUP\VOID-ATLAS-before-polish\` 备份恢复）。
