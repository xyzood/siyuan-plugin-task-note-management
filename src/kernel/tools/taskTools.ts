import type { ReminderManager } from "../../utils/reminderManager";
import type { CategoryManager } from "../../utils/categoryManager";
import type { ProjectManager } from "../../utils/projectManager";
import type { ToolDefinition } from "./common";
import {
    objectSchema,
    wrapHandler,
    successResponse,
    errorResponse,
} from "./common";
import {
    assertDefined,
    assertString,
    assertDateString,
    assertOptionalString,
    assertOptionalDateString,
    assertOptionalTimeString,
    assertOptionalEnum,
    assertOptionalBoolean,
    assertOptionalNumber,
    assertArray,
    assertOptionalObject,
} from "../utils/validation";

const TASK_ACTIONS = ["search_task", "create_task", "update_task", "delete_task", "list_categories"] as const;
type TaskAction = typeof TASK_ACTIONS[number];

export function createTaskTool(
    reminderManager: ReminderManager,
    categoryManager: CategoryManager,
    projectManager: ProjectManager
): ToolDefinition {
    return {
        name: "task",
        config: {
            title: "任务管理",
            description: "任务管理操作。Actions: search_task(关键词/id/多条件搜索), create_task(创建任务), update_task(批量更新任务), delete_task(删除任务), list_categories(列出分类)。",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        description: "操作类型",
                        enum: TASK_ACTIONS,
                    },
                    // search / get
                    keyword: { type: "string", description: "关键词，匹配任务标题和备注" },
                    id: { type: "string", description: "任务 ID，精确匹配" },
                    projectId: { type: "string", description: "所属项目 ID" },
                    date: { type: "string", description: "日期 YYYY-MM-DD，或传入 'today'。创建任务时为必填，可传入 '' 以创建无日期任务" },
                    priority: { type: "string", enum: ["high", "medium", "low", "none"], description: "优先级" },
                    status: { type: "string", description: "看板状态" },
                    completed: { type: "boolean", description: "是否已完成" },
                    limit: { type: "number", description: "返回数量上限，默认 50" },
                    // create / update
                    title: { type: "string", description: "任务标题" },
                    note: { type: "string", description: "备注" },
                    time: { type: "string", description: "开始时间 HH:MM" },
                    endDate: { type: "string", description: "结束日期 YYYY-MM-DD" },
                    endTime: { type: "string", description: "结束时间 HH:MM" },
                    categoryId: { type: "string", description: "分类 ID" },
                    subtasks: {
                        type: "array",
                        description: "可选。创建任务时可以一并创建的子任务列表",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "子任务标题" },
                                note: { type: "string", description: "子任务备注" },
                                date: { type: "string", description: "子任务日期 YYYY-MM-DD" },
                                time: { type: "string", description: "子任务时间 HH:MM" },
                                endDate: { type: "string", description: "子任务结束日期 YYYY-MM-DD" },
                                endTime: { type: "string", description: "子任务结束时间 HH:MM" },
                                priority: { type: "string", enum: ["high", "medium", "low", "none"] },
                                categoryId: { type: "string", description: "子任务分类 ID" },
                                completed: { type: "boolean", description: "是否已完成" }
                            },
                            required: ["title"]
                        }
                    },
                    repeat: {
                        type: "object",
                        description: "重复设置",
                        properties: {
                            enabled: { type: "boolean", description: "是否启用重复" },
                            type: { type: "string", enum: ["daily", "weekly", "monthly", "yearly", "custom", "ebbinghaus", "lunar-monthly", "lunar-yearly"], description: "重复类型" },
                            interval: { type: "number", description: "重复间隔" },
                            weekDays: { type: "array", items: { type: "number" }, description: "每周的哪几天 (0-6, 0为周日)" },
                            monthDays: { type: "array", items: { type: "number" }, description: "每月的哪几天 (1-31)" },
                            monthlyRepeatMode: { type: "string", enum: ["date", "week"], description: "每月重复方式：date(按日期)/week(按星期)" },
                            months: { type: "array", items: { type: "number" }, description: "每年的哪几个月 (1-12)" },
                            lunarDay: { type: "number", description: "农历日期（1-30）" },
                            lunarMonth: { type: "number", description: "农历月份（1-12）" },
                            endDate: { type: "string", description: "截止日期 YYYY-MM-DD" },
                            endCount: { type: "number", description: "重复次数限制" },
                            endType: { type: "string", enum: ["never", "date", "count"], description: "结束类型" },
                            ebbinghausPattern: { type: "array", items: { type: "number" }, description: "艾宾浩斯重复模式" },
                            reminderSkipWeekendMode: { type: "string", enum: ["none", "skip", "only_weekend"], description: "跳过周末模式" },
                            reminderSkipHolidays: { type: "boolean", description: "是否跳过节假日提醒" }
                        },
                        required: ["enabled", "type", "endType"]
                    },
                    // update
                    updates: {
                        type: "array",
                        description: "批量更新列表（update 操作必填）",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                title: { type: "string" },
                                note: { type: "string" },
                                date: { type: "string" },
                                time: { type: "string" },
                                endDate: { type: "string" },
                                endTime: { type: "string" },
                                priority: { type: "string", enum: ["high", "medium", "low", "none"] },
                                projectId: { type: "string" },
                                categoryId: { type: "string" },
                                completed: { type: "boolean" },
                                repeat: {
                                    type: "object",
                                    description: "重复设置",
                                    properties: {
                                        enabled: { type: "boolean" },
                                        type: { type: "string", enum: ["daily", "weekly", "monthly", "yearly", "custom", "ebbinghaus", "lunar-monthly", "lunar-yearly"] },
                                        interval: { type: "number" },
                                        weekDays: { type: "array", items: { type: "number" } },
                                        monthDays: { type: "array", items: { type: "number" } },
                                        monthlyRepeatMode: { type: "string", enum: ["date", "week"] },
                                        months: { type: "array", items: { type: "number" } },
                                        lunarDay: { type: "number" },
                                        lunarMonth: { type: "number" },
                                        endDate: { type: "string" },
                                        endCount: { type: "number" },
                                        endType: { type: "string", enum: ["never", "date", "count"] },
                                        ebbinghausPattern: { type: "array", items: { type: "number" } },
                                        reminderSkipWeekendMode: { type: "string", enum: ["none", "skip", "only_weekend"] },
                                        reminderSkipHolidays: { type: "boolean" }
                                    }
                                }
                            },
                            required: ["id"],
                        },
                    },
                },
                required: ["action"],
            },
        },
        handler: wrapHandler(async (input) => {
            const action = assertEnum(input.action, "action", TASK_ACTIONS);

            switch (action) {
                case "search_task": {
                    await reminderManager.reload();
                    const options: any = {};
                    if (input.keyword) options.keyword = assertOptionalString(input.keyword, "keyword");
                    if (input.id) options.id = assertOptionalString(input.id, "id");
                    if (input.projectId) options.projectId = assertOptionalString(input.projectId, "projectId");
                    if (input.date) {
                        let dateVal = input.date;
                        if (dateVal === "today") {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, "0");
                            const day = String(now.getDate()).padStart(2, "0");
                            dateVal = `${year}-${month}-${day}`;
                        }
                        options.date = assertOptionalDateString(dateVal, "date");
                    }
                    if (input.priority) options.priority = assertOptionalEnum(input.priority, "priority", ["high", "medium", "low", "none"]);
                    if (input.status) options.status = assertOptionalString(input.status, "status");
                    if (input.completed !== undefined) options.completed = assertOptionalBoolean(input.completed, "completed");
                    if (input.limit !== undefined) options.limit = assertOptionalNumber(input.limit, "limit");
                    const tasks = await reminderManager.searchReminders(options);
                    return successResponse(tasks);
                }

                case "create_task": {
                    const title = assertString(input.title, "title");
                    
                    const getTodayDateString = () => {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, "0");
                        const day = String(now.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                    };

                    const rawDate = assertString(input.date, "date");
                    let date = rawDate === "" ? "" : assertDateString(rawDate, "date");

                    if (input.repeat && input.repeat.enabled && date === "") {
                        date = getTodayDateString();
                    }

                    if (input.projectId) {
                        await projectManager.loadProjects(true);
                        const exists = await projectManager.projectExists(assertString(input.projectId, "projectId"));
                        if (!exists) return errorResponse(`项目不存在: ${input.projectId}`);
                    }
                    if (input.categoryId) {
                        const exists = await categoryManager.categoryExists(assertString(input.categoryId, "categoryId"));
                        if (!exists) return errorResponse(`分类不存在: ${input.categoryId}`);
                    }

                    const parentTask = await reminderManager.createReminder({
                        title,
                        date,
                        note: assertOptionalString(input.note, "note"),
                        time: assertOptionalTimeString(input.time, "time"),
                        endDate: assertOptionalDateString(input.endDate, "endDate"),
                        endTime: assertOptionalTimeString(input.endTime, "endTime"),
                        priority: assertOptionalEnum(input.priority, "priority", ["high", "medium", "low", "none"]),
                        projectId: assertOptionalString(input.projectId, "projectId"),
                        categoryId: assertOptionalString(input.categoryId, "categoryId"),
                        completed: assertOptionalBoolean(input.completed, "completed"),
                        repeat: assertOptionalObject(input.repeat, "repeat"),
                    });

                    const subtasksResult: any[] = [];
                    if (input.subtasks && Array.isArray(input.subtasks)) {
                        for (const subtask of input.subtasks) {
                            const subTitle = assertString(subtask.title, "subtasks[].title");
                            
                            let subDate = "";
                            if (subtask.date !== undefined && subtask.date !== null) {
                                const rawSubDate = assertString(subtask.date, "subtasks[].date");
                                subDate = rawSubDate === "" ? "" : assertDateString(rawSubDate, "subtasks[].date");
                            }
                            if (subtask.repeat && subtask.repeat.enabled && subDate === "") {
                                subDate = getTodayDateString();
                            }

                            const subTask = await reminderManager.createReminder({
                                title: subTitle,
                                date: subDate,
                                note: assertOptionalString(subtask.note, "subtasks[].note"),
                                time: assertOptionalTimeString(subtask.time, "subtasks[].time"),
                                endDate: assertOptionalDateString(subtask.endDate, "subtasks[].endDate"),
                                endTime: assertOptionalTimeString(subtask.endTime, "subtasks[].endTime"),
                                priority: assertOptionalEnum(subtask.priority, "subtasks[].priority", ["high", "medium", "low", "none"]),
                                projectId: assertOptionalString(input.projectId, "projectId"),
                                categoryId: assertOptionalString(subtask.categoryId, "subtasks[].categoryId"),
                                completed: assertOptionalBoolean(subtask.completed, "subtasks[].completed"),
                                parentId: parentTask.id,
                                repeat: assertOptionalObject(subtask.repeat, "subtasks[].repeat"),
                            });
                            subtasksResult.push(subTask);
                        }
                    }

                    return successResponse({
                        ...parentTask,
                        subtasks: subtasksResult,
                    });
                }

                case "update_task": {
                    const updates = assertArray(input.updates, "updates");
                    const normalized = updates.map((update: any) => {
                        assertDefined(update.id, "updates[].id");
                        return {
                            id: assertString(update.id, "updates[].id"),
                            title: assertOptionalString(update.title, "updates[].title"),
                            note: assertOptionalString(update.note, "updates[].note"),
                            date: assertOptionalDateString(update.date, "updates[].date"),
                            time: assertOptionalTimeString(update.time, "updates[].time"),
                            endDate: assertOptionalDateString(update.endDate, "updates[].endDate"),
                            endTime: assertOptionalTimeString(update.endTime, "updates[].endTime"),
                            priority: assertOptionalEnum(update.priority, "updates[].priority", ["high", "medium", "low", "none"]),
                            projectId: assertOptionalString(update.projectId, "updates[].projectId"),
                            categoryId: assertOptionalString(update.categoryId, "updates[].categoryId"),
                            completed: assertOptionalBoolean(update.completed, "updates[].completed"),
                            repeat: assertOptionalObject(update.repeat, "updates[].repeat"),
                        };
                    });
                    const tasks = await reminderManager.updateReminders(normalized);
                    return successResponse(tasks);
                }

                case "delete_task": {
                    const id = assertString(input.id, "id");
                    const success = await reminderManager.deleteReminder(id);
                    return successResponse({ success });
                }

                case "list_categories": {
                    const categories = await categoryManager.listCategories();
                    return successResponse(categories);
                }

                default:
                    return errorResponse(`未知的任务操作: ${action}`);
            }
        }),
    };
}

function assertEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
    return assertOptionalEnum(value, field, allowed) as T;
}
