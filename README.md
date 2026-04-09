# Keyword Analyzer

Keyword Analyzer 是一个本地优先的 Semrush 关键词工作台。

导入 Semrush 导出的 `.xlsx` / `.xls` 文件后，它会在当前浏览器里计算机会分数，生成可搜索、可筛选、可导出的关键词表。你也可以把候选关键词收藏到 Saved Pipeline，后续补充 intitle 调研、查看 KGR / EKGR、标记 `未做网站` / `已做网站`。

Excel 只在当前页面会话中解析，不会上传到远程服务器。收藏关键词会保存在当前浏览器的 `localStorage`。

## 功能

- 导入 Semrush Excel，并在浏览器本地解析。
- 按 `Volume * CPC / Keyword Difficulty` 计算机会分数。
- 按机会分数自动降序排序关键词。
- 按关键词搜索、收藏状态、KD、Volume 筛选分析结果。
- 分页式渲染大结果集，并可继续加载更多行。
- 导出当前筛选后的结果表。
- 收藏关键词到当前浏览器的 Saved Pipeline。
- 首页直接查看历史收藏，不需要每次重新上传 Excel。
- 为收藏关键词填写 intitle 结果数，并计算 KGR / EKGR。
- 删除收藏，或将收藏关键词标记为 `未做网站` / `已做网站`。
- 提供 Scoring Guide 弹窗说明评分逻辑。

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址为 [http://localhost:3000](http://localhost:3000)。

## 数据保存范围

- 导入的 Excel 结果只保存在当前页面内存里，刷新页面后需要重新导入。
- 收藏的关键词会保存在当前浏览器的 `localStorage`，刷新页面后仍会出现在首页和 Saved Pipeline。
- localStorage 不是云同步。换电脑、换浏览器、无痕窗口、清空网站数据或更换部署域名后，原浏览器里的收藏不会自动迁移。

## Semrush 导入要求

导出的表格必须包含以下列名，且列名需保持与 Semrush 导出一致：

- `Keyword`
- `Volume`
- `Keyword Difficulty`
- `CPC (USD)`

如果缺少任意必需列，页面会直接提示缺失列名并拒绝导入。空关键词、`Volume <= 0`、`Keyword Difficulty <= 0` 或 `CPC (USD) <= 0` 的行会在导入时被过滤掉。

## 分数说明

### Opportunity Score

```text
Opportunity Score = Volume * CPC / Keyword Difficulty
```

它用于快速排序关键词机会：搜索量和 CPC 越高、KD 越低，分数越高。

### KGR / EKGR

KGR / EKGR 只针对收藏关键词显示。先收藏一个关键词，再在 Saved Pipeline 的 `调研` 区域输入你手动查询到的 intitle 结果数。

```text
KGR = intitle results / monthly search volume
EKGR = KGR * (1 + Keyword Difficulty / 100)
```

## 验证命令

```bash
npm run lint
npm run test:unit
npm run build
```

## Cloudflare Pages 部署

这个工具是纯前端/本地文件处理，建议部署到 Cloudflare Pages。

Cloudflare Pages 设置：

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 项目根目录

本地生成静态产物：

```bash
npm run build
```

如果要用 Wrangler 直接上传，先登录 Cloudflare，再部署 `dist`：

```bash
npx wrangler whoami
npx wrangler pages deploy dist --project-name keyword-analyzer
```

## Sitemap / Robots

项目包含基础静态 SEO 文件：

- `static/sitemap.xml`
- `static/robots.txt`

当前 Cloudflare Pages 默认 URL：`https://keyword-analyzer-em3.pages.dev/`。

如果你使用自定义域名，请同步更新：

- `static/sitemap.xml` 里的 `<loc>`
- `static/robots.txt` 里的 `Sitemap:`
- `nuxt.config.js` / `layouts/default.vue` 里的描述文案，如后续改产品定位

## 版权和许可

本项目采用 [MIT License](https://choosealicense.com/licenses/mit/).
