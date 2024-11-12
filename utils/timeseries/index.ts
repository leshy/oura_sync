type TSPoint = [Date, number];

type TSStore = {
    set: (point: TSPoint) => Promise<void>;
    last: () => Promise<Date>;
};

type TSQuery = (date_from: Date) => AsyncGenerator<TSPoint>;

export function sync(tsQuery: TSQuery, store: TSStore) {
    const lastPoint: Date = await store.last();
    for await (const point of tsQuery(lastPoint)) {
        await store.Set(point);
    }
}
