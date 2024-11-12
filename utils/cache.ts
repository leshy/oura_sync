import { KVStore } from "./kvstore/types.ts";

export function createCachingDecorator(kvStore: KVStore) {
    // This function returns the actual decorator function
    return function (
        target: Object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
    ): void {
        const originalMethod = descriptor.value!;

        descriptor.value = async function (...args: any[]): Promise<any> {
            const key = `${propertyKey}:${JSON.stringify(args)}`;
            const cachedResult = await kvStore.get(key);

            if (cachedResult !== undefined) {
                console.log(`Fetching from cache for key: ${key}`);
                return cachedResult;
            }

            const result = await originalMethod.apply(this, args);
            await kvStore.set(key, result);

            return result;
        };
    };
}
