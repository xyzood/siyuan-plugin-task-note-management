import type { ProjectManager } from "./projectManager";
import type { ProjectGroup } from "./projectManager";

export interface CreateColumnInput {
    projectId: string;
    name: string;
    color?: string;
    icon?: string;
    sort?: number;
}

export interface UpdateColumnInput {
    projectId: string;
    columnId: string;
    name?: string;
    color?: string;
    icon?: string;
    sort?: number;
}

export class ProjectColumnsManager {
    private projectManager: ProjectManager;

    constructor(projectManager: ProjectManager) {
        this.projectManager = projectManager;
    }

    async listColumns(projectId: string): Promise<ProjectGroup[]> {
        return this.projectManager.getProjectCustomGroups(projectId);
    }

    async createColumn(input: CreateColumnInput): Promise<ProjectGroup | undefined> {
        const projectId = input.projectId;
        const name = input.name;

        await this.projectManager.loadProjects(true);
        const project = await this.projectManager.getProjectById(projectId);
        if (!project) {
            throw new Error(`项目不存在: ${projectId}`);
        }

        const groups = await this.projectManager.getProjectCustomGroups(projectId);
        const maxSort = groups.reduce((max, g) => Math.max(max, g.sort ?? 0), -1);

        const column: ProjectGroup = {
            id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name,
            color: input.color ?? "#4f46e5",
            icon: input.icon ?? "📂",
            sort: input.sort ?? maxSort + 10,
        };

        groups.push(column);
        await this.projectManager.setProjectCustomGroups(projectId, groups);

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("projectUpdated", {
                detail: { projectId }
            }));
        }

        return column;
    }

    async updateColumn(input: UpdateColumnInput): Promise<ProjectGroup | undefined> {
        const projectId = input.projectId;
        const columnId = input.columnId;

        await this.projectManager.loadProjects(true);
        const project = await this.projectManager.getProjectById(projectId);
        if (!project) {
            throw new Error(`项目不存在: ${projectId}`);
        }

        const groups = await this.projectManager.getProjectCustomGroups(projectId);
        const index = groups.findIndex((g) => g.id === columnId);
        if (index === -1) {
            return undefined;
        }

        const updated: ProjectGroup = { ...groups[index] };
        if (input.name !== undefined) updated.name = input.name;
        if (input.color !== undefined) updated.color = input.color;
        if (input.icon !== undefined) updated.icon = input.icon;
        if (input.sort !== undefined) updated.sort = input.sort;

        groups[index] = updated;
        await this.projectManager.setProjectCustomGroups(projectId, groups);

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("projectUpdated", {
                detail: { projectId }
            }));
        }

        return updated;
    }
}
