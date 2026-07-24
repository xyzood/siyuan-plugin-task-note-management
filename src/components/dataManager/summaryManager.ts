import type { ReminderItem, Project, Habit } from "../../kernel/types";
import { isRepeatInstanceCompleted } from "./repeatUtils";
import { ReminderManager } from "./reminderManager";
import { ProjectManager } from "./projectManager";
import { HabitManager } from "./habitManager";
import { PomodoroManager, type PomodoroSession } from "./pomodoroRecord";

export interface TaskSummaryOptions {
    showPomodoro?: boolean;
    showHabit?: boolean;
}

interface TaskView {
    id: string;
    title: string;
    completed: boolean;
    projectName?: string;
    time?: string;
    endTime?: string;
    priority?: string;
    repeatLabel?: string;
}

interface DaySummary {
    date: string;
    tasks: TaskView[];
    pomodoroCount: number;
    pomodoroMinutes: number;
    habits: { title: string; completed: boolean; icon?: string }[];
}

function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr + "T00:00:00");
    date.setDate(date.getDate() + days);
    return getLocalDateString(date);
}

function dateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let current = startDate;
    while (current <= endDate) {
        dates.push(current);
        current = addDays(current, 1);
    }
    return dates;
}

function getWeekday(dateStr: string): number {
    return new Date(dateStr + "T00:00:00").getDay();
}

function expandRepeatInstances(reminder: ReminderItem, startDate: string, endDate: string): ReminderItem[] {
    const repeat = (reminder as any).repeat;
    if (!repeat?.enabled || !repeat.type) {
        if (reminder.date >= startDate && reminder.date <= endDate) {
            return [reminder];
        }
        return [];
    }

    const instances: ReminderItem[] = [];
    const type = repeat.type;
    const interval = repeat.interval || 1;
    const repeatEndDate = repeat.endType === "date" && repeat.endDate ? repeat.endDate : endDate;
    const effectiveEndDate = repeatEndDate < endDate ? repeatEndDate : endDate;

    let current = reminder.date;
    const maxInstances = 1000;
    let count = 0;

    while (current <= effectiveEndDate && count < maxInstances) {
        if (current >= startDate) {
            instances.push({
                ...reminder,
                id: `${reminder.id}_${current}`,
                date: current,
            } as ReminderItem);
        }

        switch (type) {
            case "daily":
                current = addDays(current, interval);
                break;
            case "weekly": {
                const weekDays = repeat.weekDays;
                if (Array.isArray(weekDays) && weekDays.length > 0) {
                    let found = false;
                    for (let i = 1; i <= 7; i++) {
                        const next = addDays(current, i);
                        if (weekDays.includes(getWeekday(next))) {
                            current = next;
                            found = true;
                            break;
                        }
                    }
                    if (!found) current = addDays(current, 7 * interval);
                } else {
                    current = addDays(current, 7 * interval);
                }
                break;
            }
            case "monthly": {
                const date = new Date(current + "T00:00:00");
                date.setMonth(date.getMonth() + interval);
                current = getLocalDateString(date);
                break;
            }
            case "yearly": {
                const date = new Date(current + "T00:00:00");
                date.setFullYear(date.getFullYear() + interval);
                current = getLocalDateString(date);
                break;
            }
            default:
                if (reminder.date >= startDate && reminder.date <= endDate) {
                    instances.push(reminder);
                }
                return instances;
        }
        count++;
    }

    return instances;
}

function formatRepeatLabel(reminder: ReminderItem): string {
    const repeat = (reminder as any).repeat;
    if (!repeat?.enabled || !repeat.type) return "";

    const typeLabels: Record<string, string> = {
        daily: "每天",
        weekly: "每周",
        monthly: "每月",
        yearly: "每年",
        "lunar-monthly": "农历每月",
        "lunar-yearly": "农历每年",
        custom: "自定义重复",
        ebbinghaus: "艾宾浩斯",
    };

    const interval = repeat.interval || 1;
    const base = typeLabels[repeat.type] || "重复";
    if (interval > 1) {
        return `每${interval}${base.replace("每", "")}`;
    }
    return base;
}

export class SummaryManager {
    private plugin: any;
    private reminderManager: ReminderManager;
    private projectManager: ProjectManager;
    private habitManager: HabitManager;
    private pomodoroManager: PomodoroManager;
    private projectNameCache: Record<string, string> = {};

    constructor(
        plugin: any,
        reminderManager: ReminderManager,
        projectManager: ProjectManager,
        habitManager: HabitManager,
        pomodoroManager: PomodoroManager
    ) {
        this.plugin = plugin;
        this.reminderManager = reminderManager;
        this.projectManager = projectManager;
        this.habitManager = habitManager;
        this.pomodoroManager = pomodoroManager;
    }

    private async getProjectName(projectId: string): Promise<string | undefined> {
        if (this.projectNameCache[projectId] !== undefined) {
            return this.projectNameCache[projectId] || undefined;
        }
        const project = await this.projectManager.getProjectById(projectId);
        const name = project?.name;
        this.projectNameCache[projectId] = name || "";
        return name;
    }

    async getTaskSummary(startDate: string, endDate: string, options: TaskSummaryOptions = {}): Promise<string> {
        const [reminders, habits, pomodoroRecords] = await Promise.all([
            this.reminderManager.getAllReminders(),
            this.habitManager.listHabits(),
            this.pomodoroManager.getFocusesByTime(startDate, endDate),
        ]);

        const dates = dateRange(startDate, endDate);
        const dayMap = new Map<string, DaySummary>();

        dates.forEach((date) => {
            dayMap.set(date, {
                date,
                tasks: [],
                pomodoroCount: 0,
                pomodoroMinutes: 0,
                habits: [],
            });
        });

        pomodoroRecords.forEach((session) => {
            const date = session.startTime.slice(0, 10);
            const day = dayMap.get(date);
            if (!day) return;
            if (session.type === "work") {
                day.pomodoroCount += Math.max(1, Math.round(session.duration / 25)) || 1;
                day.pomodoroMinutes += session.duration;
            }
        });

        habits.forEach((habit) => {
            dates.forEach((date) => {
                const checkin = habit.checkIns?.[date];
                const completed = !!checkin && (checkin.count > 0 || (checkin.status?.length ?? 0) > 0);
                const day = dayMap.get(date);
                if (day) {
                    day.habits.push({
                        title: habit.title,
                        completed,
                        icon: habit.icon,
                    });
                }
            });
        });

        for (const reminder of Object.values(reminders)) {
            const isRepeat = reminder.repeat?.enabled && reminder.repeat?.type;
            if (isRepeat) {
                const instances = expandRepeatInstances(reminder, startDate, endDate);
                for (const instance of instances) {
                    const day = dayMap.get(instance.date);
                    if (!day) continue;

                    const projectName = instance.projectId ? await this.getProjectName(instance.projectId) : undefined;
                    const isCompleted = isRepeatInstanceCompleted(reminder, instance.date);

                    day.tasks.push({
                        id: instance.id,
                        title: instance.title,
                        completed: isCompleted,
                        projectName,
                        time: instance.time,
                        endTime: instance.endTime,
                        priority: instance.priority || "none",
                        repeatLabel: formatRepeatLabel(reminder),
                    });
                }
            } else {
                if (reminder.date >= startDate && reminder.date <= endDate) {
                    const day = dayMap.get(reminder.date);
                    if (day) {
                        const projectName = reminder.projectId ? await this.getProjectName(reminder.projectId) : undefined;
                        day.tasks.push({
                            id: reminder.id,
                            title: reminder.title,
                            completed: !!reminder.completed,
                            projectName,
                            time: reminder.time,
                            endTime: reminder.endTime,
                            priority: reminder.priority || "none",
                        });
                    }
                }

                if (reminder.completed && reminder.completedTime) {
                    try {
                        const completedLogicalDate = reminder.completedTime.slice(0, 10);
                        if (completedLogicalDate >= startDate && completedLogicalDate <= endDate && completedLogicalDate !== reminder.date) {
                            const day = dayMap.get(completedLogicalDate);
                            if (day) {
                                const exists = day.tasks.some(t => t.id === reminder.id);
                                if (!exists) {
                                    const projectName = reminder.projectId ? await this.getProjectName(reminder.projectId) : undefined;
                                    day.tasks.push({
                                        id: reminder.id,
                                        title: reminder.title,
                                        completed: true,
                                        projectName,
                                        time: reminder.time,
                                        endTime: reminder.endTime,
                                        priority: reminder.priority || "none",
                                    });
                                }
                            }
                        }
                    } catch (e) {}
                }
            }
        }

        let markdown = `# 任务摘要\n\n`;
        markdown += `**日期范围**: ${startDate} ~ ${endDate}\n\n`;

        const totalTasks = Array.from(dayMap.values()).reduce((sum, d) => sum + d.tasks.length, 0);
        const completedTasks = Array.from(dayMap.values()).reduce(
            (sum, d) => sum + d.tasks.filter((t) => t.completed).length,
            0
        );
        markdown += `**任务完成情况**: ${completedTasks}/${totalTasks}\n\n`;

        if (options.showPomodoro !== false) {
            const totalMinutes = Array.from(dayMap.values()).reduce((sum, d) => sum + d.pomodoroMinutes, 0);
            markdown += `**专注时间**: ${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60}分钟\n\n`;
        }

        if (options.showHabit !== false) {
            const totalHabits = Array.from(dayMap.values()).reduce((sum, d) => sum + d.habits.length, 0);
            const completedHabits = Array.from(dayMap.values()).reduce(
                (sum, d) => sum + d.habits.filter((h) => h.completed).length,
                0
            );
            markdown += `**习惯打卡**: ${completedHabits}/${totalHabits}\n\n`;
        }

        for (const [date, day] of dayMap) {
            if (day.tasks.length === 0 && day.habits.length === 0 && day.pomodoroCount === 0) {
                continue;
            }

            markdown += `## ${date}\n\n`;

            if (options.showPomodoro !== false && day.pomodoroCount > 0) {
                markdown += `- 🍅 专注: ${day.pomodoroCount} 个番茄, ${day.pomodoroMinutes} 分钟\n`;
            }

            if (options.showHabit !== false && day.habits.length > 0) {
                const done = day.habits.filter((h) => h.completed).length;
                markdown += `- ✅ 习惯: ${done}/${day.habits.length}\n`;
                day.habits.forEach((h) => {
                    markdown += `  - ${h.completed ? "[x]" : "[ ]"} ${h.icon || ""} ${h.title}\n`;
                });
            }

            if (day.tasks.length > 0) {
                const grouped = new Map<string | undefined, TaskView[]>();
                day.tasks.forEach((task) => {
                    const key = task.projectName || "未分类";
                    if (!grouped.has(key)) grouped.set(key, []);
                    grouped.get(key)!.push(task);
                });

                grouped.forEach((tasks, projectName) => {
                    markdown += `- **${projectName}**\n`;
                    tasks.forEach((task) => {
                        const timeStr = task.time ? ` (${task.time}${task.endTime ? `-${task.endTime}` : ""})` : "";
                        const repeatStr = task.repeatLabel ? ` 🔄 ${task.repeatLabel}` : "";
                        markdown += `  - ${task.completed ? "[x]" : "[ ]"} ${task.title}${timeStr}${repeatStr}\n`;
                    });
                });
            }

            markdown += "\n";
        }

        return markdown.trim();
    }
}
