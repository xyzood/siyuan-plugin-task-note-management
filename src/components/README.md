# 组件说明

`src/components` 按功能拆分为以下目录：

## panel/ 面板与核心视图
提供插件 Dock 面板和主要任务管理视图。

- **CalendarView.ts**：日历视图组件，提供月历、周历等多种日历显示模式，支持任务的可视化管理
- **EisenhowerMatrixView.ts**：艾森豪威尔四象限矩阵视图，按重要性和紧急性对任务进行分类管理
- **HabitPanel.ts**：习惯面板组件，展示和管理习惯打卡、连续天数和番茄钟统计
- **PomodoroTimer.ts**：番茄工作法计时器，提供专注时间管理和工作/休息提醒功能
- **ProjectKanbanView.ts**：项目看板视图组件，以看板形式展示项目中的任务状态（待办、进行中、已完成）
- **ProjectPanel.ts**：项目面板组件，提供项目列表展示、筛选、排序和管理功能
- **ReminderPanel.ts**：提醒面板组件，展示和管理各种提醒任务，支持多种过滤和排序方式

## dialog/ 对话框与弹窗
集中管理所有对话框、弹出菜单和轻量弹窗组件。

- **AddTaskReminderTimeDialog.ts**：任务提醒时间设置对话框
- **BatchReminderDialog.ts**：批量提醒设置对话框，支持批量创建和编辑多个提醒任务
- **BlockBindingDialog.ts**：块绑定对话框
- **BlockRemindersDialog.ts**：文档块提醒列表对话框
- **CategoryManageDialog.ts**：分类管理对话框，用于创建、编辑和删除任务分类
- **DocumentReminderDialog.ts**：文档提醒对话框，为特定文档设置提醒功能
- **FilterManagement.svelte**：提醒筛选管理弹窗（Svelte）
- **GlobalProjectStatusDialog.ts**：全局项目状态管理对话框
- **HabitCheckInEmojiDialog.ts**：习惯打卡表情选择对话框
- **HabitDayDialog.ts**：习惯单日详情对话框
- **HabitEditDialog.ts**：习惯创建/编辑对话框
- **HabitGroupManageDialog.ts**：习惯分组管理对话框
- **HabitHistoryDialog.ts**：习惯历史记录对话框
- **LoadingDialog.svelte**：加载中对话框组件（Svelte）
- **ManageGroupsDialog.ts**：任务分组管理对话框
- **ManageMilestonesDialog.ts**：里程碑管理对话框
- **ManageStatusesDialog.ts**：看板状态管理对话框
- **ManageTagsDialog.ts**：标签管理对话框
- **NotificationDialog.ts**：通知对话框组件，显示系统提醒通知
- **PasteTaskDialog.ts**：粘贴创建任务对话框
- **PomodoroSessionsDialog.ts**：番茄钟历史会话对话框
- **ProjectColorDialog.ts**：项目颜色设置对话框
- **ProjectDialog.ts**：项目创建/编辑对话框
- **ProjectFolderManageDialog.ts**：项目文件夹管理对话框
- **ProjectSelectorPopup.ts**：项目选择弹出层
- **ProjectStatsDialog.ts**：项目统计对话框
- **ProjectStatusManageDialog.ts**：项目状态管理对话框
- **QuickReminderDialog.ts**：快速提醒创建对话框
- **RepeatSettingsDialog.ts**：重复设置对话框，配置任务的重复规则
- **SortMenuDialog.ts**：排序菜单对话框
- **SubtasksDialog.ts**：子任务管理对话框

## render/ 渲染与图标
负责任务 DOM 渲染、图标注册和移动端快捷入口。

- **MobileTaskShortcut.ts**：移动端任务快捷入口组件
- **registerIcons.ts**：自定义 SVG 图标注册
- **TaskRenderer.ts**：任务列表渲染器
- **taskNoteDOM.ts**：任务笔记 DOM 构建工具

## settings/ 设置页组件
仅被 `src/SettingPanel.svelte` 使用，提供设置页面中的子面板。

- **HelpPanel.svelte**：帮助说明面板
- **icsSubscriptionPanel.svelte**：ICS 订阅配置面板
- **SettingSubGroup.svelte**：设置分组子组件

## stats/ 统计
提供项目、任务、番茄钟和习惯等数据统计视图。

- **HabitStatsDialog.ts**：习惯统计对话框
- **HabitStatsTab.svelte**：习惯统计标签页
- **PomodoroStatsTab.svelte**：番茄钟统计标签页
- **ProjectStatCard.svelte**：项目统计卡片
- **ProjectStatsTab.svelte**：项目统计标签页
- **ShowStatsDialog.ts**：统计展示对话框入口
- **ShowStatsView.svelte**：统计视图主组件
- **statsMode.ts**：统计模式持久化
- **TaskStatsTab.svelte**：任务统计标签页
- **TaskSummaryTab.svelte**：任务摘要统计标签页

## vip/ 会员功能
与会员/VIP 功能相关的组件。

- **vip.ts**：VIP 工具函数
- **VipDialog.ts**：VIP 对话框
- **VipPanel.svelte**：VIP 面板
