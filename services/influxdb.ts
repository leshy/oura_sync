import { Service } from "./types.ts";
import * as InfluxClient from "@influxdata/influxdb-client";
import * as TS from "../utils/timeseries/index.ts";

export interface InfluxDBConfig {
    url: string;
    token: string;
    org: string;
    bucket: string;
    measurement: string;
}

export type TSPoint = {
    time: Date;
    values: Record<string, number>;
    tags: Record<string, string | null>;
};

export class Measurement<T extends TSPoint> extends TS.Store<T> {
    constructor(
        private bucket: string,
        private measurement: string,
        private writeAPI,
        private queryAPI,
    ) {
        super();
    }

    async writePoint(TSPoint: TS.Point<T>) {
        const point = new InfluxClient.Point(this.measurement);

        for (const [key, value] of Object.entries(TSPoint.tags)) {
            point.tag(key, value as string);
        }

        for (const [key, value] of Object.entries(TSPoint.values)) {
            point.floatField(key, Number(value) as number);
        }

        point.timestamp(TSPoint.time);

        this.writeAPI.writePoint(point);
    }

    async getLastPointTime(): Promise<Date> {
        const query = `from(bucket: "${this.bucket}")
           |> range(start: 0)
           |> filter(fn: (r) => r["_measurement"] == "${this.measurement}")
           |> group()
           |> sort(columns: ["_stop"], desc: true)
           |> limit(n: 1)`;

        const result = await this.queryAPI.collectRows(query);
        if (result.length === 1) {
            // @ts-ignore
            return new Date(result[0]["_stop"]);
        }
        return new Date(0);
    }
}

export class Influx implements Service<InfluxDBConfig> {
    private client: InfluxClient.InfluxDB;
    private writeAPI;
    private queryAPI;

    constructor(private config: InfluxDBConfig) {
        this.client = new InfluxClient.InfluxDB({
            url: config.url,
            token: config.token,
        });
        this.writeAPI = this.client.getWriteApi(
            config.org,
            config.bucket,
            "s",
            { maxRetries: 5 },
        );
        this.queryAPI = this.client.getQueryApi(config.org);
    }

    measurement(measurement: string): TSInterface<TSPoint> {
        return new Measurement(
            this.config.bucket,
            measurement,
            this.writeAPI,
            this.queryAPI,
        );
    }

    async stop() {
        await this.writeAPI.flush();
        await this.writeAPI.close();
        // sleep for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}
