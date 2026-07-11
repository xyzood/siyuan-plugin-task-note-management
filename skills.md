# 思源任务笔记管理插件 MCP 工具概述 (SiYuan Task Note Management MCP Overview)

本项目为思源笔记任务笔记管理插件提供了 Model Context Protocol (MCP) 接口工具，用于通过 AI 助手或外部软件管理思源笔记工作空间中的任务、项目、习惯和专注度统计等数据。

详细的 AI 代理或客户端交互技能指令已整理存放在 `skills/` 目录中。

## 技能与工具列表

1. **[任务管理 (task)](skills/task/SKILL.md)**: 管理任务和分类。
   - 支持操作 (Actions): `search_task` (搜索任务), `create` (创建), `update` (更新), `delete` (删除), `list_categories` (列出分类)。
   - 特别支持 `"today"` 日期参数，可一并自动获取今日任务、过期未完成任务以及每日可做任务。

2. **[项目管理 (project)](skills/project/SKILL.md)**: 管理项目、看板列分组、以及项目分类文件夹。
   - 支持操作 (Actions): `list`, `create`, `get`, `get_with_undone_tasks`, `get_task`, `list_columns`, `create_column`, `update_column`, `list_groups`, `create_group`, `update_group`, `delete_group`。

3. **[习惯管理 (habit)](skills/habit/SKILL.md)**: 管理习惯定义和日常打卡记录。
   - 支持操作 (Actions): `search_habit`, `create_habit`, `update_habit`, `get_checkins`, `upsert_checkins`。

4. **[数据统计与专注 (stats)](skills/stats/SKILL.md)**: 记录番茄钟专注状态并提取任务及习惯摘要。
   - 支持操作 (Actions): `get_focuses_by_time`, `get_focus`, `create_focus`, `delete_focus`, `get_task_summary`。

## 文件目录结构

```
.
├── skills.md            <-- 本汇总文档 (中文)
└── skills/
    ├── SKILL.md         <-- 技能概述配置文件 (中文)
    ├── task/
    │   └── SKILL.md     <-- 任务管理技能详细说明 (中文)
    ├── project/
    │   └── SKILL.md     <-- 项目看板、文件夹管理技能详细说明 (中文)
    ├── habit/
    │   └── SKILL.md     <-- 习惯打卡管理技能详细说明 (中文)
    └── stats/
        └── SKILL.md     <-- 专注记录与任务摘要技能详细说明 (中文)
```
