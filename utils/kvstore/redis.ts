import { KVStore } from "./types.ts";

// todo
class Redis implements KVStore {
    private store: Record<string, any> = {};

    async set(key: string, value: any): Promise<void> {
        this.store[key] = value;
    }

    async get(key: string): Promise<any | undefined> {
        return this.store[key];
    }
}
