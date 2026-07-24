import type { ToolDefinition } from "./common";
import { createTaskTool } from "./taskTools";
import { createProjectTool } from "./projectTools";
import { createHabitTool } from "./habitTools";
import { createStatsTool } from "./statsTools";
import type { ReminderManager } from "../../components/dataManager/reminderManager";
import type { ProjectManager } from "../../components/dataManager/projectManager";
import type { ProjectColumnsManager } from "../../components/dataManager/projectColumnsManager";
import type { ProjectFolderManager } from "../../components/dataManager/projectFolderManager";
import type { CategoryManager } from "../../components/dataManager/categoryManager";
import type { HabitManager } from "../../components/dataManager/habitManager";
import type { PomodoroManager } from "../../components/dataManager/pomodoroRecord";
import type { SummaryManager } from "../../components/dataManager/summaryManager";

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
