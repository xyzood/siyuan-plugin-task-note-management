/// <reference types="siyuan/kernel" />

import type { IMcp, ILogger, IStorage, IRpc } from "siyuan/kernel";
import { createKernelStorage, type KernelStorage } from "./kernel/storageAdapter";
import { ReminderManager } from "./utils/reminderManager";
import { ProjectManager } from "./utils/projectManager";
import { ProjectColumnsManager } from "./utils/projectColumnsManager";
import { ProjectFolderManager } from "./utils/projectFolderManager";
import { CategoryManager } from "./utils/categoryManager";
import { HabitManager } from "./utils/habitManager";
import { PomodoroManager } from "./utils/pomodoroRecord";
import { SummaryManager } from "./utils/summaryManager";
import { createMcpRegistry, type ToolDefinition } from "./kernel/tools";

class KernelPluginBridge {
    private storage: KernelStorage;
    public settings: any = null;

    constructor(storage: KernelStorage) {
        this.storage = storage;
    }

    async loadData(path: string): Promise<any> {
        return this.storage.loadData(path);
    }

    async saveData(path: string, data: any): Promise<void> {
        await this.storage.saveData(path, data);
        await this.notifyDataUpdated(path);
    }

    async removeData(path: string): Promise<void> {
        await this.storage.removeData(path);
        await this.notifyDataUpdated(path);
    }

    async loadCategories(): Promise<any> {
        return this.loadData("categories.json");
    }

    async saveCategories(data: any): Promise<void> {
        await this.saveData("categories.json", data);
    }

    async loadProjectData(): Promise<any> {
        return this.loadData("project.json");
    }

    async saveProjectData(data: any): Promise<void> {
        await this.saveData("project.json", data);
    }

    async loadProjectStatus(): Promise<any> {
        return this.loadData("project_status.json");
    }

    async saveProjectStatus(data: any): Promise<void> {
        await this.saveData("project_status.json", data);
    }

    async loadHabitGroupData(): Promise<any> {
        return this.loadData("habitGroup.json");
    }

    async saveHabitGroupData(data: any): Promise<void> {
        await this.saveData("habitGroup.json", data);
    }

    async loadSettings(): Promise<any> {
        if (!this.settings) {
            this.settings = await this.loadData("settings.json") || {};
        }
        return this.settings;
    }

    async saveSettings(settings: any): Promise<void> {
        this.settings = settings;
        await this.saveData("settings.json", settings);
    }

    async loadReminderData(): Promise<any> {
        return this.loadData("reminder.json");
    }

    async loadHolidayData(): Promise<any> {
        return this.loadData("holiday.json");
    }

    async loadSubscriptionData(): Promise<any> {
        return this.loadData("ics_subscriptions.json");
    }

    async loadSubscriptionTasks(subscriptionId: string): Promise<any> {
        return this.loadData(`subscribe/${subscriptionId}.json`);
    }

    async loadPomodoroRecords(force: boolean = false): Promise<any> {
        try {
            const files = await this.storage.readDir("pomodoroRecords");
            const records: Record<string, any> = {};
            await Promise.all(
                files
                    .filter((f) => !f.isDir && f.name.endsWith(".json"))
                    .map(async (f) => {
                        const name = f.name;
                        const record = await this.storage.loadData(`pomodoroRecords/${name}`);
                        if (record && typeof record === "object") {
                            const dateMatch = name.match(/^(.+)\.json$/i);
                            const date = dateMatch ? dateMatch[1] : name;
                            records[date] = record;
                        }
                    })
            );
            return records;
        } catch (e) {
            console.error("[kernel] failed to load pomodoro records:", e);
            return {};
        }
    }

    private async notifyDataUpdated(path: string) {
        try {
            await (globalThis as any).siyuan.rpc.broadcast("data-updated", { path });
        } catch (e) {
            console.error("[kernel] failed to broadcast data-updated event:", e);
        }
    }
}

class KernelPlugin {
    private readonly siyuan: typeof globalThis.siyuan;
    private readonly logger: ILogger;
    private readonly mcp: IMcp;

    private storage = createKernelStorage();
    private bridge = new KernelPluginBridge(this.storage);

    private reminderManager = ReminderManager.getInstance(this.bridge);
    private projectManager = ProjectManager.getInstance(this.bridge);
    private projectColumnsManager = new ProjectColumnsManager(this.projectManager);
    private projectFolderManager = ProjectFolderManager.getInstance(this.bridge);
    private categoryManager = CategoryManager.getInstance(this.bridge);
    private habitManager = HabitManager.getInstance(this.bridge);
    private pomodoroManager = PomodoroManager.getInstance(this.bridge);
    private summaryManager = new SummaryManager(
        this.bridge,
        this.reminderManager,
        this.projectManager,
        this.habitManager,
        this.pomodoroManager
    );

    private registry: ToolDefinition[] = [];
    private registeredToolNames: string[] = [];

    constructor() {
        this.siyuan = siyuan;
        this.logger = this.siyuan.logger;
        this.mcp = this.siyuan.mcp;

        this.siyuan.plugin.lifecycle.onload = this.onload.bind(this);
        this.siyuan.plugin.lifecycle.onunload = this.onunload.bind(this);
    }

    private async onload(): Promise<void> {
        await this.logger.info("[kernel] MCP plugin loading");

        try {
            // Initialize managers to load data cache
            await Promise.all([
                this.reminderManager.initialize(),
                this.projectManager.initialize(),
                this.projectFolderManager.initialize(),
                this.categoryManager.initialize(),
                this.habitManager.initialize(),
                this.pomodoroManager.initialize(),
            ]);

            this.registry = createMcpRegistry({
                reminderManager: this.reminderManager,
                projectManager: this.projectManager,
                projectColumnsManager: this.projectColumnsManager,
                projectFolderManager: this.projectFolderManager,
                categoryManager: this.categoryManager,
                habitManager: this.habitManager,
                pomodoroManager: this.pomodoroManager,
                summaryManager: this.summaryManager,
            });

            for (const tool of this.registry) {
                const registered = await this.mcp.registerTool(tool.name, tool.config, tool.handler);
                this.registeredToolNames.push(tool.name);
                await this.logger.debug("[kernel] registered MCP tool:", registered.name);
            }

            await this.logger.info(`[kernel] registered ${this.registeredToolNames.length} MCP tools`);
        } catch (error: any) {
            await this.logger.error("[kernel] failed to register MCP tools:", error);
            throw error;
        }
    }

    private async onunload(): Promise<void> {
        await this.logger.info("[kernel] MCP plugin unloading");

        for (const name of this.registeredToolNames) {
            try {
                await this.mcp.unregisterTool(name);
                await this.logger.debug("[kernel] unregistered MCP tool:", name);
            } catch (error: any) {
                await this.logger.error(`[kernel] failed to unregister tool ${name}:`, error);
            }
        }

        this.registeredToolNames = [];
    }
}

new KernelPlugin();
