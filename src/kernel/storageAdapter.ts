import type { IStorage, IDataObject } from "siyuan/kernel";

export interface KernelStorage {
    loadData(path: string): Promise<any>;
    saveData(path: string, data: any): Promise<void>;
    removeData(path: string): Promise<void>;
    readDir(dir: string): Promise<Array<{ name: string; isDir: boolean; isSymlink: boolean; updated: number }>>;
}

export function createKernelStorage(): KernelStorage {
    const storage = (globalThis as any).siyuan.storage as IStorage;

    return {
        async loadData(path: string): Promise<any> {
            try {
                const obj: IDataObject = await storage.get(path);
                const text = await obj.text();
                if (!text || text.trim() === "") {
                    return null;
                }
                return JSON.parse(text);
            } catch (error: any) {
                if (error?.message?.includes("not exist") || error?.message?.includes("does not exist")) {
                    return null;
                }
                console.warn(`[kernel] loadData failed for ${path}:`, error);
                return null;
            }
        },

        async saveData(path: string, data: any): Promise<void> {
            await storage.put(path, JSON.stringify(data ?? null));
        },

        async removeData(path: string): Promise<void> {
            try {
                await storage.remove(path);
            } catch (error: any) {
                console.warn(`[kernel] removeData failed for ${path}:`, error);
            }
        },

        async readDir(dir: string): Promise<Array<{ name: string; isDir: boolean; isSymlink: boolean; updated: number }>> {
            try {
                const entries = await storage.list(dir);
                return entries.map((e) => ({
                    name: e.name,
                    isDir: e.isDir,
                    isSymlink: e.isSymlink,
                    updated: e.updated,
                }));
            } catch (error: any) {
                console.warn(`[kernel] readDir failed for ${dir}:`, error);
                return [];
            }
        },
    };
}
