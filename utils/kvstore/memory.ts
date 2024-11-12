import { KVStore } from "./types.ts";

export class Memory implements KVStore {
    private store: Map<string, any> = new Map();
    async set(key: string, value: any): Promise<void> {
        this.store.set(key, value);
    }

    async get(key: string): Promise<any | undefined> {
        return this.store.get(key);
    }
}
