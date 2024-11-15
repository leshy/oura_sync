import { Oura } from "./integration/oura.ts";
import * as OuraTypes from "./integration/oura/types.ts";
import * as Influx from "./services/influxdb.ts";
import * as ts from "./utils/timeseries/index.ts";
import { getSecret } from "./utils/secrets.ts";

async function measurement(name, fn) {
    const influxToken = await getSecret("mv/influxdb/self", "token");
    const influxMeasurement = new Influx.Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: name,
        token: influxToken,
    });

    await fn(influxMeasurement);
    await influxMeasurement.stop();
}

async function sync() {
    const oura = new Oura(await getSecret("oura", "token"));

    await measurement("spo2", (measurement) =>
        ts.sync(
            oura.getDailySpo2,
            (point: OuraTypes.DailySpo2): Influx.Point => ({
                time: point.day,
                values: {
                    spo2_percentage: point.spo2_percentage.average,
                    breathing_disturbance_index:
                        point.breathing_disturbance_index,
                },
                tags: {},
            }),
            measurement,
        ),
    );

    await measurement("stress", (measurement) =>
        ts.sync(
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
            measurement,
        ),
    );

    await measurement("readiness", (measurement) =>
        ts.sync(
            oura.getDailyReadiness,
            (point: OuraTypes.DailyReadiness): Influx.Point => ({
                time: point.day,
                values: {
                    score: point.score,
                    temperature_deviation: point.temperature_deviation,
                },
                tags: {},
            }),
            measurement,
        ),
    );

    await measurement("heart", (measurement) =>
        ts.sync(
            oura.getHeartRate,
            (point: HeartRate): Influx.Point => ({
                time: point.timestamp,
                values: {
                    value: point.bpm,
                },
                tags: { source: point.source },
            }),
            measurement,
        ),
    );

    await measurement("sleep", (measurement) =>
        ts.sync(
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
                        sleep_algorithm_version:
                            point["sleep_algorithm_version"],
                        type: point["type"],
                    },
                };
            },

            measurement,
        ),
    );
}

sync().then(() => console.log("done"));
