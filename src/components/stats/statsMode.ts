export const STATS_MODE_STORAGE_KEY = "siyuan-plugin-task-note-management:stats-mode";

export type StatsMode = "pomodoro" | "task" | "habit" | "summary" | "project";

export function getLastStatsMode(): StatsMode {
    try {
        const value = localStorage.getItem(STATS_MODE_STORAGE_KEY);
        if (value === "task" || value === "habit" || value === "summary" || value === "project") return value;
        return "pomodoro";
    } catch {
        return "pomodoro";
    }
}

export function setLastStatsMode(mode: StatsMode): void {
    try {
        localStorage.setItem(STATS_MODE_STORAGE_KEY, mode);
    } catch {
        // ignore
    }
}
