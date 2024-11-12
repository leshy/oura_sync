export type TSPoint<T> = [Date, T];

export type TSStore<T> = {
    writePoint: (point: TSPoint<T>) => Promise<void>;
    getLastPoint: () => Promise<TSPoint<T>>;
};

export type TSQuery<T> = (date_from: Date) => AsyncGenerator<TSPoint<T>>;

// export function sync<T>(tsQuery: TSQuery<T>, store: TSStore<T>) {
//     const lastPoint: Date = await store.getLastPoint();
//     for await (const point of tsQuery(lastPoint)) {
//         await store.writePoint(point);
//     }
// }
