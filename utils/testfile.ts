export interface KVStore {
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any | undefined>;
}

function createCachingDecorator(kvStore: KVStore) {
    return function (
        target: Object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
    ): void {
        if (!descriptor || !descriptor.value) {
            throw new Error("The decorator is applied on a non-method");
        }

        const originalMethod = descriptor.value;

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

class MyKVStore implements KVStore {
    private store: Map<string, any> = new Map();

    async set(key: string, value: any): Promise<void> {
        this.store.set(key, value);
    }

    async get(key: string): Promise<any | undefined> {
        return this.store.get(key);
    }
}

class Example {
    @createCachingDecorator(new MyKVStore())
    public async compute(arg: number): Promise<number> {
        console.log(`Computing result for: ${arg}`);
        return arg * arg;
    }
}

(async () => {
    const example = new Example();

    console.log(await example.compute(5)); // Will compute and cache
    console.log(await example.compute(5)); // Will fetch from cache
    console.log(await example.compute(10)); // Will compute and cache
})();
