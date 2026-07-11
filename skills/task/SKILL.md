---
name: task
description: 用于在思源任务笔记管理插件中管理任务和分类的 MCP 工具。
---

# 任务管理技能 (task)

本技能提供思源任务笔记管理插件的任务管理接口，支持搜索任务、创建任务、批量更新、删除以及管理分类。

## 支持操作与参数

### 1. `search_task`
根据关键字、ID、项目、日期等条件搜索任务。
- **keyword** (字符串, 可选): 搜索关键字，匹配任务标题或备注内容。
- **id** (字符串, 可选): 任务 ID，精确匹配。
- **projectId** (字符串, 可选): 所属项目 ID。
- **date** (字符串, 可选): 过滤日期 `YYYY-MM-DD`。可以传入 `"today"` 字符串，这将自动计算今日日期，并拉取今日任务、过期未完成任务、每日可做任务（效果和前端 Reminder 面板一致）。
- **priority** (字符串, 可选): 优先级 (`"high"`, `"medium"`, `"low"`, `"none"`)。
- **status** (字符串, 可选): 看板状态。
- **completed** (布尔值, 可选): 是否已完成。
- **limit** (数字, 可选): 返回数量上限，默认为 50。

### 2. `create_task`
创建新任务。
- **title** (字符串, 必填): 任务标题。
- **date** (字符串, 必填): 任务日期 `YYYY-MM-DD`。可以传入 `""`（空字符串）以创建无日期任务。
- **note** (字符串, 可选): 备注信息。
- **time** (字符串, 可选): 开始时间 `HH:MM`。
- **endDate** (字符串, 可选): 结束日期 `YYYY-MM-DD`。
- **endTime** (字符串, 可选): 结束时间 `HH:MM`。
- **priority** (字符串, 可选): 优先级 (`"high"`, `"medium"`, `"low"`, `"none"`)。
- **projectId** (字符串, 可选): 项目 ID。
- **categoryId** (字符串, 可选): 分类 ID。
- **completed** (布尔值, 可选): 是否完成，默认为 `false`。
- **repeat** (对象, 可选): 重复周期性任务配置。**注意：如果启用了重复配置（enabled 为 true），但是开始日期 date 传入了 ""（空字符串），系统会自动将其默认设置为今日本地日期。** 属性如下：
  - **enabled** (布尔值, 必填): 是否启用。
  - **type** (字符串, 必填): 重复类型，支持 `"daily"` (每日), `"weekly"` (每周), `"monthly"` (每月), `"yearly"` (每年), `"custom"` (自定义), `"ebbinghaus"` (艾宾浩斯), `"lunar-monthly"` (农历每月), `"lunar-yearly"` (农历每年)。
  - **interval** (数字, 可选): 重复周期间隔。
  - **weekDays** (数字数组, 可选): 每周的哪几天 (0-6, 0为周日)。
  - **monthDays** (数字数组, 可选): 每月的哪几天 (1-31)。
  - **monthlyRepeatMode** (字符串, 可选): 每月重复类型 (`"date"` 按日期 / `"week"` 按星期)。
  - **endDate** (字符串, 可选): 重复截止日期 `YYYY-MM-DD`。
  - **endType** (字符串, 必填): 结束条件，支持 `"never"` (从不结束), `"date"` (截止到特定日期), `"count"` (限次数)。
  - **endCount** (数字, 可选): 限制重复的总次数。
  - **reminderSkipWeekendMode** (字符串, 可选): 跳过周末选项 (`"none"`, `"skip"`, `"only_weekend"`)。
  - **reminderSkipHolidays** (布尔值, 可选): 是否跳过法定节假日。
- **subtasks** (对象数组, 可选): 要一并创建的子任务列表。创建时会自动绑定其 `parentId` 为当前创建的主任务 ID。每个子任务项支持的属性有：
  - **title** (字符串, 必填): 子任务标题。
  - 以及上面支持的其他可选参数 (备注、日期、时间、优先级等)。

### 3. `update_task`
批量修改更新任务。
- **updates** (对象数组, 必填): 更新项列表。每个对象必须包含：
  - **id** (字符串, 必填): 要修改的任务 ID。
  - 其他在 `create` 中支持的可选参数，包含 `repeat` 对象。

### 4. `delete_task`
删除任务。
- **id** (字符串, 必填): 任务 ID。

### 5. `list_categories`
列出所有任务分类。
- （无参数）

## 调用示例

### 获取今日及过期任务列表
```json
{
  "action": "search_task",
  "date": "today"
}
```

### 创建一个高优先级的任务
```json
{
  "action": "create_task",
  "title": "整理 MCP 工具技能说明文档",
  "date": "2026-07-11",
  "priority": "high",
  "note": "将 task、project、habit、stats 技能翻译为中文版"
}
```

### 同时创建任务与多个子任务（可不填日期）
```json
{
  "action": "create_task",
  "title": "准备技术方案设计",
  "subtasks": [
    {
      "title": "编写架构设计草稿",
      "date": "2026-07-11",
      "priority": "high"
    },
    {
      "title": "与前端开发团队对齐接口",
      "date": "2026-07-12"
    }
  ]
}
```

### 创建一个每周一、三、五重复的周期性任务
```json
{
  "action": "create_task",
  "title": "部门例会汇报准备",
  "date": "2026-07-11",
  "priority": "medium",
  "repeat": {
    "enabled": true,
    "type": "weekly",
    "weekDays": [1, 3, 5],
    "endType": "never"
  }
}
```
