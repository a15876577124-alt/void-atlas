# VOID ATLAS — V3 第二轮交付记录

日期：2026-10-23（Asia/Shanghai）  
开发分支：`codex/visual-quality-v3`  
本轮起点：`850cf40`；报告生成时 HEAD：`52294cf`。

## 1. 完成结果

- **Galaxy：采用新方案 A 的光感调整版。** 两种实质不同的结构候选均已构建、采集八机位并测量性能。A 使用空间相关密度场拒绝采样；B 使用沿旋臂分布的 76 组星团中心采样。最终选择 A，主要因为臂间和外盘的密度衔接更连续，B 的团簇分区较粗。
- **Nebula：已替换实际网站第三场景。** 原始 nebula-hybrid 实验源码完整保留并复用，最终使用真正的三维密度纹理与射线积分。不是将对比截图当作贴图，也不是只改对比页面。
- **Horizon：专属视觉代码保留。** 四个专属 shader 和 disk 中的 Horizon 计算段与 850cf40 一致；八角度真实深度遮挡测试通过。
- UI、Contact、双语、上一轮窄屏入口修复、质量翻译、暂停与资源生命周期均保留。
- 未合并 main、未推送开发分支、未部署。正式 dist 七个文件与稳定备份逐一 SHA-256 相同。

## 2. 视觉比较与判断

打开 [交互对比页面](http://127.0.0.1:4177/compare.html)。也可直接打开本目录 compare.html。每张图片均可点击查看原尺寸，没有裁切图片容器。

统一条件：1440×900、DPR 1、High、暂停、同一鼠标/键盘输入脚本、140 帧阻尼收敛。相机极角限制使正面/俯视采用约 79°，而非严格 90°；俯视另用不同方位。其他机位为初始、60° 倾斜、45° 斜视、10° 侧视、三次 Zoom 近/远景。

### Spiral Galaxy

| 版本 | 观察 | 结果 |
| --- | --- | --- |
| 第一轮 V3 B | 核心清晰，但四臂较等距，正面出现重复弧线 | 保留为可回退基准 |
| 新 A | 两条不等宽、不等密度主臂；相关密度间隙与外支臂；首版外围光感偏弱 | 作为最终版基础 |
| 新 B | 星团聚集更明显；外围与星团之间衔接偏粗，局部碎片感较重 | 源码和截图保留，未采用 |
| 最终 A 调整版 | 恢复局部尘埃光感，增加克制的局部粉色区域；维持开放的臂间空间 | 已进入源码 |

结构参考：[NASA 对 M83 的介绍](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-83/)。参考其年轻星团与暗尘带的空间组织，没有复制天文照片。这仍是程序艺术近似，不是天体动力学模拟。

最终版沿用原暖色立体核球与内盘过渡，采用独立随机流重分配外部星盘，保留轻微厚度和弯曲。没有增加 18,000 / 42,000 / 76,000 粒子预算，没有改变曝光或全局黑位。其他场景位置与共用种子数组 SHA-256 均与修改前相同，见 galaxy-isolation.json。

同机位正面中，重复的四臂环带明显减少；初始、45° 和侧视仍可辨认核心和薄盘。这个选择属于有截图依据的美术判断，并非客观的天文学真实性评分。

### Cosmic Nebula

| 版本 | 密度与采样 | 结果 |
| --- | --- | --- |
| 网站原云丝 | 面向相机的二维云层 | 保留比较基准 |
| 用户选定候选 | 112³ 密度；48 步；半分辨率云体 | 完整实验源码与独立可运行构建保留 |
| 实际集成版 | 128³ 密度；增加细尺度密度扰动；三档步数与分辨率 | 已进入实际第三场景 |

采用椭球射线求交、三维密度采样、透射率积分、独立云体离屏缓冲和全分辨率星体。云体颜色保持粉紫、蓝青及少量暖金。视角变化时云层轮廓与间隙随三维位置改变；初始画面延续所选候选。High 提高采样密度，近景仍能看出有限网格分辨率，并不声称无限精细。

星体在顶点阶段沿相机到恒星的路径采样前方云体，最多削减单星 55% 的光度，保留亮星。遮挡是八点采样近似，不是完整的光线追踪散射；背景固定星场没有加入逐星体积遮挡。

| 画质 | 射线步数 | 云体相对主画布分辨率 | 星体 |
| --- | --- | --- | --- |
| High | 72 | 75% × 75% | 主画布分辨率 |
| Balanced | 48 | 50% × 50% | 主画布分辨率 |
| Low | 32 | 40% × 40% | 主画布分辨率 |

三档使用相同密度场。低档保留主要结构并减少采样成本。支持浮点渲染目标的设备使用 HalfFloat；缺少相关扩展时使用 RGBA8。两个路径均已实测。CPU 密度数据缓存供渲染器重试复用；GPU 资源仍由各渲染器创建并释放。

初始机位的暗像素比例（亮度 <16/255）：已选候选 63.81%，最终 63.85%；平均亮度 38.83 → 38.77。其作用只是辅助排查全局灰雾或暗化，不能替代视觉判断。截图可见黑色间隙和亮星均保留。

### 排版

实际页面与 36 张响应式截图中，Galaxy 标题左侧没有异常裁切；未修改其首页排版。Nebula 英文长标题在斜视亮云前有重叠，已仅缩小常规桌面星云标题至 clamp(44px,4.6vw,84px)，保留短屏/移动端已有规则。没有添加全局遮罩。

## 3. 验证结果（实际执行）

- **Build 通过**：本地 Vite 8.3.4，输出到本目录 builds/final，未覆盖工程 dist。现有 Three.js 主包仍触发 >500 kB 提示；构建没有错误。
- **Unit 12/12**：几何确定性/边界、画质前缀一致性、三维密度边界/空隙/CPU 缓存、质量调节器、双语与场景解析。
- **E2E 32/32，111.8 秒**：桌面与移动模拟，包括三场景、截图导出、语言/画质、Contact、键盘、鼠标/触控、暂停、Zoom、Reset、切换、Canvas fallback、context loss/restoration、显式重试。
- **Horizon 深度**：79°、60°、30°、10°、0°、−10°、−60°、−79°；近盘亮区与远盘遮挡符合既有断言。
- **资源**：45 次场景切换后有效 GPU 资源数量保持稳定；暂停不新增绘制；退出及三次重试后旧上下文资源失效/释放。
- **布局 36/36**：2560×1440、1920×1080、1366×768、390×844、360×780、320×640，各三场景×两语言。无控件越界、无页面横向溢出、无 console error / pageerror / 404。
- **对比页**：112 个图片视图全部加载成功，无图片路径错误。
- 新增 Reset 测试曾因逐字节哈希/阻尼收敛时间而失败。最终等待 140 帧，要求整帧平均通道误差 <0.01/255，并分别限制浮点/RGBA8 最大误差为 2/8。暂停帧仍要求精确哈希一致。此修正没有修改相机实现。

## 4. 性能及实际边界

Windows / NVIDIA GeForce RTX 4060 Laptop GPU / ANGLE D3D11 / Edge 155.0.4283.62。使用浏览器默认图形后端，非 SwiftShader。每场景预热 1.8 秒，连续采样 4.5 秒，串行运行；EXT_disjoint_timer_query_webgl2 记录 GPU 时间，disjoint=0。下面是 1440×900、DPR 1 的计时，不能把其倒数当作整机 FPS。

| 版本 / 画质 | 场景 | GPU 中位 ms | GPU P95 ms | Draw calls |
| --- | --- | ---: | ---: | ---: |
| V3 B / High | galaxy | 0.162 | 0.173 | 3 |
| V3 B / High | horizon | 0.173 | 0.186 | 6 |
| V3 B / High | nebula | 0.264 | 0.278 | 3 |
| 新 A / High | galaxy | 0.244 | 0.255 | 3 |
| 新 B / High | galaxy | 0.245 | 0.256 | 3 |
| 已选体积候选 / High | nebula | 0.201 | 0.213 | 4 |
| 最终 / High | galaxy | 0.247 | 0.258 | 3 |
| 最终 / High | horizon | 0.255 | 0.265 | 6 |
| 最终 / High | nebula | 0.447 | 0.467 | 4 |
| 最终 / Balanced | nebula | 0.186 | 0.198 | 4 |
| 最终 / Low | nebula | 0.094 | 0.106 | 4 |

最终 High 三场景 CPU 提交 P95 为 0.1–0.2 ms；观察到的绘制间隔约 4.2 ms，受本机刷新调度限制。这是短时、本机数据，不是所有显卡或长时间运行的保证。

390×844、设备 DPR 2、Balanced 的模拟移动视口仍使用 RTX 4060：Galaxy / Horizon / Nebula GPU 中位为 0.101 / 0.106 / 0.128 ms。**不能作为真实手机 GPU 数据。**

**已测得的启动代价：** 独立浏览器上下文本地 HTTP 下，第一轮 V3 WebGL 就绪为 173–511 ms；最终为 1201–1293 ms。增加约 0.8–1.1 秒，主要来自初次生成三维密度数据；该生成仍同步执行。CPU 密度缓存避免同页重试重复生成，但慢 CPU 的首开开销尚未验证。该代价没有被稳定帧率数据掩盖。

**尚未验证：** 真实 Android/iPhone、Safari/Firefox、集成显卡、长时间热降频、多小时稳定性和公网加载时延。已测环境没有开发阻塞；以上为兼容性/设备覆盖限制。

## 5. 版本保护、文件与提交

- 起点：850cf40；稳定 main / GitHub main：804163b。
- `44d1308` — feat: refine galaxy with asymmetric density and spiral branches
- `52294cf` — feat: integrate volumetric nebula with adaptive quality tiers
- 本轮测试和此验收记录另以 test: verify V3 volume regression and physical GPU performance 保存；最终提交号记录在外部交付文件末尾。
- 源码：src/galaxy-structure.js、src/particles.js、src/shaders.js、src/nebula-volume.js、src/webgl-renderer.js、src/style.css。
- 验证：tests/nebula-volume.test.js、tests/nebula-volume.spec.js、docs/V3_ROUND2.md。
- 未改依赖、锁文件、WorkBuddy HANDOFF 或稳定备份。当前开发成果仅在本地分支，未推送。
- 稳定备份：D:/haorongli09/_BACKUP/VOID-ATLAS-before-codex-v3；HEAD 804163b。正式 dist 与该备份七文件哈希一致，见 protection-check.json。
- 后续可以在确认没有未保存修改后，用 Git 对独立提交执行 revert，或检出已有提交作比较。本轮没有实际执行回退操作，也不需要重置来验收。

## 6. 预览和证据位置

- [稳定版 804163b](http://127.0.0.1:4174/)
- [第一轮 V3 850cf40](http://127.0.0.1:4175/)
- [本轮实际运行版](http://127.0.0.1:4178/)
- [本轮星云](http://127.0.0.1:4178/#nebula)
- [交互视觉对比](http://127.0.0.1:4177/compare.html)

所有服务仅绑定 127.0.0.1。重启服务时，在本目录执行 `node serve.mjs builds/final 4178`；对比页执行 `node serve.mjs . 4177`。先确认对应端口未占用。稳定版/第一轮目录在相邻 void-atlas-v3-review 中，分别是 baseline-dist / optimized-dist。

本目录：C:\Users\a1587\Documents\ChatGPT\个人作品制作 2\void-atlas-v3-round2-review

- variants/：候选源码；builds/：独立构建；captures/：同机位和布局截图。
- final-e2e-results.json、final-unit.log：最终测试证据。
- performance/*.json、gpu.json、startup-results.json：性能原始数据与后端信息。
- galaxy-isolation.json、protection-check.json：其他场景数据和稳定版本保护。
- galaxy-comparison.png、nebula-comparison.png：对比总览。

任务完成后停止开发，等待用户决定是否合并、推送或上线。
