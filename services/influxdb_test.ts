import { assertEquals } from "@std/assert";
import { Influx } from "./influxdb.ts";
import { getSecret } from "../utils/secrets.ts";
import * as df from "date-fns";

Deno.test("connect", async function () {
    const token = await getSecret("mv/influxdb/self", "token");
    const influx = new Influx({
        url: "http://influxdb.mv:8086",
        org: "org",
        bucket: "self",
        measurement: "payments",
        token: token,
    });

    console.log("RECEIVED", await influx.getLastPoint());
});
