import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import * as ts from "./timeseries/index.ts";
import { Oura } from "../integration/oura.ts";
import * as OuraTypes from "../integration/oura/types.ts";
import * as Influx from "../services/influxdb.ts";
import { getSecret } from "./secrets.ts";

Deno.test("syncStress", async function () {
    const influxMeasurement = new Influx.Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "stress",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    const oura = new Oura(await getSecret("oura", "token"));

    await ts.sync(
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
        influxMeasurement,
    );

    await influxMeasurement.stop();
});

Deno.test("syncReadyness", async function () {
    const influxMeasurement = new Influx.Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "readyness",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    const oura = new Oura(await getSecret("oura", "token"));

    await ts.sync(
        oura.getDailyReadiness,
        (point) => ({
            time: point.day,
            values: {
                score: point.score,
            },
            tags: {},
        }),
        influxMeasurement,
    );

    await influxMeasurement.stop();
});

Deno.test("syncHeart", async function () {
    const influxMeasurement = new Influx.Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "heart",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    const oura = new Oura(await getSecret("oura", "token"));

    await ts.sync(
        oura.getHeartRate,
        (point) => ({
            time: point.timestamp,
            values: {
                value: point.bpm,
            },
            tags: { source: point.source },
        }),
        influxMeasurement,
    );

    await influxMeasurement.stop();
});

Deno.test("syncSleep", async function () {
    const influxMeasurement = new Influx.Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "sleep",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    const oura = new Oura(await getSecret("oura", "token"));

    await ts.sync(
        oura.getDailySleep,
        (point) => {
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
        influxMeasurement,
    );

    await influxMeasurement.stop();
});
