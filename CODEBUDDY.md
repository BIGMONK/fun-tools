# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 构建与开发命令

- `npm run dev`: 启动 Vite 开发服务器（已配置 `host: true` 支持局域网访问）。
- `npm run build`: 生产环境构建，输出到 `dist/`。
- `npm run lint`: 运行 ESLint 检查代码质量。
- `npm run typecheck`: 运行 `tsc --noEmit` 类型检查（不生成文件）。
- `npm run preview`: 本地预览生产环境构建结果。

无测试框架配置，无测试命令。

## 代码架构

### 概览

这是一个模块化的 React + TypeScript 单页应用（FunTools），作为小工具/小游戏集合运行。所有功能通过顶部导航栏切换，没有路由库，仅用 `useState<TabId>` 控制当前显示的模块。

### 模块注册机制

新增功能模块需要修改三处：
1. `src/types/index.ts` — 在 `TabId` 联合类型中添加新 id，定义 `TabItem` 条目。
2. `src/components/Navigation.tsx` — 在 `tabs` 数组中添加导航项，在 `iconMap` 中映射图标（使用 lucide-react）。
3. `src/App.tsx` — 在 `tabComponents` Record 中将新 TabId 映射到组件实例。

### 关键目录

- `src/components/` — 所有功能组件。单文件组件直接放在此处（如 `DiceRoller.tsx`、`SpinWheel.tsx`），复杂组件用文件夹组织（如 `Tetris/`）。
- `src/components/Tetris/` — 唯一的文件夹式组件，将游戏逻辑分离到 `gameLogic.ts`，UI 在 `index.tsx`。
- `src/lib/supabase.ts` — Supabase 客户端单例，通过 `import.meta.env.VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 初始化。
- `src/types/index.ts` — 集中的类型定义（`Todo`、`TabId`、`TabItem`）。
- `supabase/migrations/` — 数据库 SQL 迁移文件。

### 技术栈

- React 18 + TypeScript，Vite 构建
- Tailwind CSS（无自定义主题扩展）
- Lucide-react 图标库
- Supabase（数据库 + 认证，仅 TodoList 使用）

### 样式约定

- 全局深色主题（`bg-gray-950` 为页面底色）。
- 组件内使用 Tailwind 实用类 + 内联 `<style>` 标签定义 CSS 动画（如 3D 变换、keyframes）。
- CSS 动画和 3D 效果通常写在组件末尾的 `<style>` 标签中，而非外部 CSS 文件。

### 注意事项

- Vite 配置中 `optimizeDeps.exclude` 排除了 `lucide-react`，开发时修改图标后可能需要重启 dev server。
- Supabase 环境变量未设置时 TodoList 功能会报错，需要配置 `.env` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
