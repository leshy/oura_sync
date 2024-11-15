export function isObject(value: any): boolean {
    return value !== null && typeof value === "object";
}

// lodash set
export function objSet(
    obj: Record<string, any>,
    path: string | string[],
    value: any,
): Record<string, any> {
    if (!isObject(obj)) {
        throw new Error("Target must be an object");
    }

    if (typeof path === "string") {
        path = path.split(".");
    }

    let current = obj;
    path.forEach((key, index) => {
        if (index === path.length - 1) {
            current[key] = value;
        } else {
            if (!current[key] || !isObject(current[key])) {
                current[key] = {};
            }
            current = current[key];
        }
    });

    return obj;
}
