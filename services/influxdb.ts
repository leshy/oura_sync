import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { TSStore, TSPoint } from "../utils/timeseries/index.ts";

export interface InfluxDBConfig {
    url: string;
    token: string;
    org: string;
    bucket: string;
    measurement: string;
}

export class Influx<T extends Point> implements TSStore<T> {
    private client: InfluxDB;
    private writeAPI: any;
    constructor(private config: InfluxDBConfig) {
        this.client = new InfluxDB({ url: config.url, token: config.token });
        this.writeAPI = this.client.getWriteApi(config.org, config.bucket);
    }

    async writePoint(point: TSPoint<T>) {
        return undefined;
    }

    async getLastPoint(): Promise<TSPoint<T>> {
        const queryApi = this.client.getQueryApi(this.config.org);
        const query = `from(bucket: "${this.config.bucket}")
           |> range(start: 0)
           |> filter(fn: (r) => r["_measurement"] == "${this.config.measurement}")
           |> group()
           |> sort(columns: ["_stop"], desc: true)
           |> limit(n: 1)`;

        const result = await queryApi.collectRows(query);
        if (result.length === 1) {
            // @ts-ignore
            return [new Date(result[0]["_stop"]), result[0]];
        }
        throw new Error("No points found");
    }

    async close() {
        this.writeAPI.close();
    }
}
