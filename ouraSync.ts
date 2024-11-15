import { Oura } from "./integration/oura.ts";
import { getSecret } from "./utils/secrets.ts";
import { app } from "./utils/app.ts";
import * as OuraTypes from "./integration/oura/types.ts";
import * as Influx from "./services/influxdb.ts";
import * as ts from "./utils/timeseries/index.ts";

export type Config = {
    influxdb: influx.Config;
    oura: oura.Config;
};

app("ourasync", async (config: Config) => {
    const oura = new Oura(config.oura);
    const influx = new Influx.Influx(config.influxdb);

    await influx.measurement("spo2").consume(
        oura.getDailySpo2,
        (point: OuraTypes.DailySpo2): Influx.Point => ({
            time: point.day,
            values: {
                spo2_percentage: point.spo2_percentage.average,
                breathing_disturbance_index: point.breathing_disturbance_index,
            },
            tags: {},
        }),
    );

    await influx.measurement("stress").consume(
        oura.getDailyStress,
        (point: OuraTypes.DailyStress): Influx.Point => ({
            time: point.day,
            values: {
                stress_high: point.stress_high,
                recovery_high: point.recovery_high,
            },
            tags: {
                day_summary: point.day_summary,
            },
        }),
    );

    await influx.measurement("readiness").consume(
        oura.getDailyReadiness,
        (point: OuraTypes.DailyReadiness): Influx.Point => ({
            time: point.day,
            values: {
                score: point.score,
                temperature_deviation: point.temperature_deviation,
            },
            tags: {},
        }),
    );

    await influx.measurement("heart").consume(
        oura.getHeartRate,
        (point: HeartRate): Influx.Point => ({
            time: point.timestamp,
            values: {
                value: point.bpm,
            },
            tags: { source: point.source },
        }),
    );

    await influx.measurement("sleep").consume(
        oura.getDailySleep,

        (point: OuraTypes.DailySleep): Influx.Point => {
            const pullValues = [
                "average_heart_rate",
                "average_breath",
                "average_hrv",
                "rem_sleep_duration",
                "deep_sleep_duration",
                "light_sleep_duration",
                "lowest_heart_rate",
                "efficiency",
                "awake_time",
                "latency",
                "total_sleep_duration",
                "time_in_bed",
                "deep_sleep_seconds",
                "restless_periods",
                "sleep_score_delta",
            ];

            const values = {};
            pullValues.forEach((key) => {
                if (key in point) {
                    // @ts-ignore
                    if (point[key] !== null) {
                        // @ts-ignore
                        values[key] = Number(point[key]);
                    }
                }
            });

            return {
                time: point.day,
                values: values,
                tags: {
                    sleep_algorithm_version: point["sleep_algorithm_version"],
                    type: point["type"],
                },
            };
        },
    );
});
