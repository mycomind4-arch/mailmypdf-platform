/**
 * @mailmypdf/core — Stable primitives shared across the entire platform.
 *
 * Zero runtime dependencies. Framework-agnostic. Pure TypeScript.
 *
 * Every other platform package and every vertical depends on these types.
 * Breaking changes here break everything — highest bar for modifications.
 */
export function createId(value) {
    if (!value.trim())
        throw new Error("Platform IDs cannot be empty");
    return value;
}
export function confidence(value) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error("Confidence must be between 0 and 1");
    }
    return value;
}
export const ok = (value) => ({ ok: true, value });
export const err = (error) => ({ ok: false, error });
export function unwrap(result) {
    if (result.ok)
        return result.value;
    throw result.error;
}
export function mapResult(result, fn) {
    return result.ok ? ok(fn(result.value)) : result;
}
export class PlatformError extends Error {
    category;
    code;
    retryable;
    details;
    constructor(message, options) {
        super(message);
        this.name = "PlatformError";
        this.category = options.category;
        this.code = options.code;
        this.retryable = options.retryable ?? false;
        this.details = options.details;
        if (options.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
function buildOpts(category, code, details, retryable) {
    const opts = { category, code, retryable, details };
    return opts;
}
export class ValidationError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("validation", "VALIDATION_ERROR", details));
    }
}
export class NotFoundError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("not_found", "NOT_FOUND", details));
    }
}
export class UnauthorizedError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("unauthorized", "UNAUTHORIZED", details));
    }
}
export class ForbiddenError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("forbidden", "FORBIDDEN", details));
    }
}
export class ConflictError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("conflict", "CONFLICT", details));
    }
}
export class RateLimitError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("rate_limit", "RATE_LIMIT", details, true));
    }
}
export class UpstreamError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("upstream", "UPSTREAM_ERROR", details, true));
    }
}
export class SecurityError extends PlatformError {
    constructor(message, details) {
        super(message, buildOpts("security", "SECURITY_VIOLATION", details));
    }
}
export function validateNonEmpty(value, field) {
    if (!value || !value.trim()) {
        return err(new ValidationError(`${field} must not be empty`));
    }
    return ok(undefined);
}
export function validateRange(value, field, min, max) {
    if (!Number.isFinite(value) || value < min || value > max) {
        return err(new ValidationError(`${field} must be between ${min} and ${max}`, { value, min, max }));
    }
    return ok(undefined);
}
export function validateOneOf(value, field, allowed) {
    if (!allowed.includes(value)) {
        return err(new ValidationError(`${field} must be one of: ${allowed.join(", ")}`, {
            value,
            allowed,
        }));
    }
    return ok(undefined);
}
export function validateMaxLength(value, field, maxLen) {
    if (value.length > maxLen) {
        return err(new ValidationError(`${field} must not exceed ${maxLen} characters`, {
            length: value.length,
            maxLen,
        }));
    }
    return ok(undefined);
}
export function toISODate(date) {
    return date.toISOString();
}
export function parseISODate(value) {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        return err(new ValidationError(`Invalid ISO date: ${value}`));
    }
    return ok(parsed.toISOString());
}
export function daysBetween(from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return err(new ValidationError("Invalid date(s) provided to daysBetween"));
    }
    const ms = toDate.getTime() - fromDate.getTime();
    return ok(Math.floor(ms / 86_400_000));
}
export function addDays(date, days) {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
        return err(new ValidationError(`Invalid date: ${date}`));
    }
    parsed.setDate(parsed.getDate() + days);
    return ok(parsed.toISOString());
}
export function isFuture(date) {
    return new Date(date).getTime() > Date.now();
}
export function isPast(date) {
    return new Date(date).getTime() < Date.now();
}
export function createConfig(source = {}) {
    return {
        get(key) {
            return source[key];
        },
        require(key) {
            const value = source[key];
            if (value === undefined || value === "") {
                throw new Error(`Required config key "${key}" is not set`);
            }
            return value;
        },
        getBoolean(key) {
            const value = source[key];
            return value === "true" || value === "1" || value === "yes";
        },
        getNumber(key) {
            const value = source[key];
            if (value === undefined || value === "")
                return undefined;
            const num = Number(value);
            return Number.isFinite(num) ? num : undefined;
        },
    };
}
export const noopLogger = {
    debug() { },
    info() { },
    warn() { },
    error() { },
};
export const consoleLogger = {
    debug(message, meta) {
        if (meta)
            console.debug(message, meta);
        else
            console.debug(message);
    },
    info(message, meta) {
        if (meta)
            console.info(message, meta);
        else
            console.info(message);
    },
    warn(message, meta) {
        if (meta)
            console.warn(message, meta);
        else
            console.warn(message);
    },
    error(message, meta) {
        if (meta)
            console.error(message, meta);
        else
            console.error(message);
    },
};
export function isRetryableError(error) {
    if (error instanceof PlatformError)
        return error.retryable;
    if (error instanceof TypeError && error.message.includes("fetch"))
        return true;
    return false;
}
export async function withRetry(fn, options = {}) {
    const maxAttempts = options.maxAttempts ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 1000;
    const maxDelayMs = options.maxDelayMs ?? 30000;
    const backoffMultiplier = options.backoffMultiplier ?? 2;
    const jitter = options.jitter ?? 0.25;
    const shouldRetry = options.shouldRetry ?? isRetryableError;
    const onRetry = options.onRetry;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
                throw error;
            }
            const delay = Math.min(baseDelayMs * Math.pow(backoffMultiplier, attempt - 1), maxDelayMs);
            const jitterMs = delay * jitter * (Math.random() * 2 - 1);
            const actualDelay = Math.max(0, delay + jitterMs);
            if (onRetry) {
                onRetry({ attempt, error, delayMs: actualDelay });
            }
            await new Promise((resolve) => setTimeout(resolve, actualDelay));
        }
    }
    throw lastError;
}
