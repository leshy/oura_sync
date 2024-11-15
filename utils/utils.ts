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

export type MapperFunction = (key: string, value: any) => [string, any];

export function deepMap(
    obj: Record<string, any>,
    mapper: MapperFunction,
): Record<string, any> {
    function recurse(currentObj: Record<string, any>): Record<string, any> {
        return Object.entries(currentObj).reduce(
            (acc, [key, value]) => {
                const [newKey, newValue] = mapper(key, value);

                // If the value is an object, recursively map it
                acc[newKey] =
                    typeof newValue === "object" && newValue !== null
                        ? recurse(newValue)
                        : newValue;

                return acc;
            },
            {} as Record<string, any>,
        );
    }

    return recurse(obj);
}
