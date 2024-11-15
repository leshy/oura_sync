export type Point<T> = T & {
    time: Date;
};

export abstract class Store<T extends Point> {
    writePoint(point: T): Promise<void> {
        throw new Error("Not implemented");
    }

    getLastPointTime(): Promise<Date> {
        throw new Error("Not implemented");
    }

    async consumeGen(gen: AsyncGenerator<T>): Promise<void> {
        for await (const point of gen) {
            await this.writePoint(storage);
        }
    }

    async consume<IN, OUT>(
        query: Query<IN>,
        transform: Transform<IN, OUT>,
    ): OUT {
        const lastPointTime: Date = await this.getLastPointTime();
        for await (const point of query(lastPointTime)) {
            const storage = transform(point);
            console.log(point, "⟶", storage);
            await this.writePoint(storage);
        }
    }
}

export type GenTransform<IN, OUT> = (
    inputStream: AsyncGenerator<IN>,
) => AsyncGenerator<OUT>;

export function createTransform<IN, OUT>(
    transformf: Transform<IN, OUT>,
): GenTransform<IN, OUT> {
    return async function* (inputStream: AsyncGenerator<IN>) {
        for await (const point of inputStream) {
            yield transformf(point);
        }
    };
}

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
