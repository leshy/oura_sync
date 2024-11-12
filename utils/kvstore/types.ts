export interface KVStore {
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any | undefined>;
}
