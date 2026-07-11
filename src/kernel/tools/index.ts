import type { ToolDefinition } from "./common";
import { createTaskTool } from "./taskTools";
import { createProjectTool } from "./projectTools";
import { createHabitTool } from "./habitTools";
import { createStatsTool } from "./statsTools";
import type { ReminderManager } from "../../utils/reminderManager";
import type { ProjectManager } from "../../utils/projectManager";
import type { ProjectColumnsManager } from "../../utils/projectColumnsManager";
import type { ProjectFolderManager } from "../../utils/projectFolderManager";
import type { CategoryManager } from "../../utils/categoryManager";
import type { HabitManager } from "../../utils/habitManager";
import type { PomodoroManager } from "../../utils/pomodoroRecord";
import type { SummaryManager } from "../../utils/summaryManager";

export interface Managers {
    reminderManager: ReminderManager;
    projectManager: ProjectManager;
    projectColumnsManager: ProjectColumnsManager;
    projectFolderManager: ProjectFolderManager;
    categoryManager: CategoryManager;
    habitManager: HabitManager;
    pomodoroManager: PomodoroManager;
    summaryManager: SummaryManager;
}

export function createMcpRegistry(managers: Managers): ToolDefinition[] {
    return [
        createTaskTool(managers.reminderManager, managers.categoryManager, managers.projectManager),
        createProjectTool(
            managers.reminderManager,
            managers.projectManager,
            managers.projectColumnsManager,
            managers.projectFolderManager
        ),
        createHabitTool(managers.habitManager),
        createStatsTool(managers.pomodoroManager, managers.summaryManager),
    ];
}

export type { ToolDefinition } from "./common";
