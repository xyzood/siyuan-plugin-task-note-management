import type { IMcpToolConfig } from "siyuan/kernel";

export interface ToolResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export type ToolHandler = (input: Record<string, any>) => Promise<ToolResponse>;

export interface ToolDefinition {
    name: string;
    config: IMcpToolConfig;
    handler: ToolHandler;
}

export function successResponse<T>(data: T): ToolResponse<T> {
    return { success: true, data };
}

export function errorResponse(error: string): ToolResponse {
    return { success: false, error };
}

export function objectSchema(
    description: string,
    properties: Record<string, any>,
    required?: string[]
): IMcpToolConfig {
    return {
        title: description,
        description,
        inputSchema: {
            type: "object",
            properties,
            required: required ?? [],
        },
    };
}

export function wrapHandler(handler: ToolHandler): ToolHandler {
    return async (input: Record<string, any>) => {
        try {
            return await handler(input);
        } catch (error: any) {
            const message = error instanceof Error ? error.message : String(error);
            return errorResponse(message);
        }
    };
}
