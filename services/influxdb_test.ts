import { assertEquals } from "@std/assert";
import { Influx } from "./influxdb.ts";
import { Oura } from "../integration/oura.ts";
import { getSecret } from "../utils/secrets.ts";
import * as df from "date-fns";

Deno.test("connect", async function () {
    const influx = new Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "payments",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    console.log("RECEIVED", await influx.getLastPoint());
});

Deno.test("writeHeart", async function () {
    const oura = new Oura(await getSecret("oura", "token"));

    const influx = new Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "heart",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    for await (const heartRate of oura.getHeartRate(
        df.subYears(new Date(), 3),
        new Date(),
    )) {
        await influx.writePoint([
            heartRate.timestamp,
            {
                values: { value: heartRate.bpm },
                tags: { source: heartRate.source },
            },
        ]);
    }
    await influx.stop();
    await new Promise((resolve) => setTimeout(resolve, 5000));
});

Deno.test("writeDailySleep", async function () {
    const oura = new Oura(await getSecret("oura", "token"));

    const influx = new Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "sleep",
        token: await getSecret("mv/influxdb/self", "token"),
    });

    const points = [];
    for await (const point of oura.getDailySleep(
        df.subYears(new Date(), 3),
        new Date(),
    )) {
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
                if (point[key] !== null) {
                    // @ts-ignore
                    values[key] = Number(point[key]);
                }
            }
        });

        await influx.writePoint([
            new Date(point.day),
            {
                // @ts-ignore
                values: values,
                tags: {
                    sleep_algorithm_version: point["sleep_algorithm_version"],
                    type: point["type"],
                },
            },
        ]);
    }
    await influx.stop();
    await new Promise((resolve) => setTimeout(resolve, 5000));
});

Deno.test("writeStress", async function () {
    const oura = new Oura(await getSecret("oura", "token"));

    for await (const point of oura.getDailyStress(
        df.subYears(new Date(), 3),
        new Date(),
    )) {
        console.log(point);
    }
});
