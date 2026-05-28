# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 构建与开发命令

- `npm run dev`: 启动 Vite 开发服务器。
- `npm run build`: 构建生产环境项目。
- `npm run lint`: 运行 ESLint 进行代码质量检查。
- `npm run typecheck`: 运行 TypeScript 的 `tsc` 以验证类型（不生成文件）。
- `npm run preview`: 在本地预览生产环境构建结果。

## 代码架构

### 概览
这是一个使用 Vite 和 TypeScript 的模块化 React 应用程序。它作为一个仪表板或小型应用集合运行，包括：
- **游戏**: 俄罗斯方块 (`src/components/Tetris`)、掷骰子、圣诞树。
- **工具**: 待办事项列表（集成了 Supabase）、番茄钟、大转盘。

### 核心目录
- `src/components/`: 包含所有特定功能的组件。每个主要功能（如俄罗斯方块）都组织在自己的文件夹或文件中。
- `src/lib/`: 包含第三方库的配置，特别是 Supabase 客户端 (`supabase.ts`)。
- `src/types/`: 集中存放 TypeScript 接口和类型 (`index.ts`)。
- `supabase/migrations/`: 用于后端数据库模式定义的 SQL 迁移文件。

### 技术栈
- **框架**: React 18+ 与 TypeScript。
- **样式**: 使用 Tailwind CSS 进行实用优先的样式开发。
- **图标**: Lucide-react。
- **数据库/身份验证**: Supabase (通过 `@supabase/supabase-js`)。
- **构建工具**: Vite。

### 模式与约定
- **共享导航**: `src/components/Navigation.tsx` 负责在 `App.tsx` 中切换不同的模块。
- **游戏逻辑**: 复杂的逻辑（如俄罗斯方块）与 UI 分离 (`src/components/Tetris/gameLogic.ts`)。
- **存储**: 用户数据（如待办事项）通过 Supabase 进行持久化。
