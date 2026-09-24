# 越南攻略站点（vietnam-travel）

2026 国庆越南 7 天自由行攻略的 GitHub Pages 静态站（YKTerminal/vietnam-travel）。数据驱动：`trip-data.json` + Travel-Plan-Page 模板 JS，无构建步骤。

## Language

**本次旅程**：
首页 7 天时间线板块（数据源 `days[]`），含分钟级 schedule 步骤和地点卡。站点唯一行程载体，无独立"每日行程"模块（见 ADR-0001）。
_Avoid_: 每日行程、itinerary、行程模块

**地点卡**：
本次旅程中每个景点的小卡，字段含：怎么玩、预计花费、雨天PlanB。
_Avoid_: 景点详情、POI 介绍

**出行须知**：
航班区下方的内容块：航站楼信息、国际航班注意事项、抵达越南后的换汇/电话卡/入境提示。
_Avoid_: 行前提示、Tips、注意事项（泛指）

**雨天PlanB**：
每个户外地点的一行天气备选（10 月初富国岛雨季尾巴）。行程必带雨伞/雨衣。
_Avoid_: 备选方案、恶劣天气预案

**锁定方案**：
航班区主展示的最终选定航班 + 价格；其余比价收进折叠区。
_Avoid_: 主推、首选、推荐航班

**AA 记账**：
ledger 模块。要求：按人灵活分摊（非均摊）、字体够大（手机记账场景）。
_Avoid_: 均摊、AA 制（口语）

## 关键文件

- `trip-data.json` — 全部内容数据（days/flights/places/restaurants/packingItems…）
- `index.html` + `app.js` — 页面骨架与渲染
- `docs/adr/` — 架构决策记录
