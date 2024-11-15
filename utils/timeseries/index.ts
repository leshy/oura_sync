export type Point<T> = T & {
    time: Date;
};

export type Store<T> = {
    writePoint: (point: Point<T>) => Promise<void>;
    getLastPointTime: () => Promise<Date>;
};

export type Query<T> = (date_from: Date) => AsyncGenerator<T>;

export type Transform<X, Y> = (input: X) => Point<Y>;

export async function sync<RETRIEVE, STORE>(
    query: Query<RETRIEVE>,
    transform: Transform<RETRIEVE, STORE>,
    store: Store<STORE>,
) {
    const lastPoint: Date = await store.getLastPointTime();
    console.log(lastPoint);
    for await (const point of query(lastPoint)) {
        const storage = transform(point);
        // console.log(point, storage);
        await store.writePoint(storage);
    }
}
