export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export function assertDefined<T>(value: T, field: string): NonNullable<T> {
    if (value === undefined || value === null) {
        throw new ValidationError(`缺少必填字段: ${field}`);
    }
    return value as NonNullable<T>;
}

export function assertString(value: unknown, field: string): string {
    if (typeof value !== "string") {
        throw new ValidationError(`字段 ${field} 必须是字符串`);
    }
    return value;
}

export function assertOptionalString(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertString(value, field);
}

export function assertBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
        throw new ValidationError(`字段 ${field} 必须是布尔值`);
    }
    return value;
}

export function assertOptionalBoolean(value: unknown, field: string): boolean | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertBoolean(value, field);
}

export function assertNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
        throw new ValidationError(`字段 ${field} 必须是数字`);
    }
    return value;
}

export function assertOptionalNumber(value: unknown, field: string): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertNumber(value, field);
}

export function assertDateString(value: unknown, field: string): string {
    const str = assertString(value, field);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        throw new ValidationError(`字段 ${field} 必须是 YYYY-MM-DD 格式的日期字符串`);
    }
    return str;
}

export function assertOptionalDateString(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertDateString(value, field);
}

export function assertTimeString(value: unknown, field: string): string {
    const str = assertString(value, field);
    if (!/^\d{2}:\d{2}$/.test(str)) {
        throw new ValidationError(`字段 ${field} 必须是 HH:MM 格式的时间字符串`);
    }
    return str;
}

export function assertOptionalTimeString(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertTimeString(value, field);
}

export function assertEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
    const str = assertString(value, field);
    if (!allowed.includes(str as T)) {
        throw new ValidationError(`字段 ${field} 必须是 ${allowed.join(" / ")} 之一`);
    }
    return str as T;
}

export function assertOptionalEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertEnum(value, field, allowed);
}

export function assertArray<T>(value: unknown, field: string): T[] {
    if (!Array.isArray(value)) {
        throw new ValidationError(`字段 ${field} 必须是数组`);
    }
    return value as T[];
}

export function assertOptionalArray<T>(value: unknown, field: string): T[] | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertArray(value, field);
}

export function assertObject(value: unknown, field: string): Record<string, any> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new ValidationError(`字段 ${field} 必须是对象`);
    }
    return value as Record<string, any>;
}

export function assertOptionalObject(value: unknown, field: string): Record<string, any> | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return assertObject(value, field);
}
