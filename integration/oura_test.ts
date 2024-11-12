import { assertEquals } from "@std/assert";
import { Oura } from "./oura.ts";
import { getSecret } from "../utils/secrets.ts";
import * as df from "date-fns";

Deno.test("getPersonalInfo", async function () {
    const oura = new Oura(await getSecret("oura", "token"));
    assertEquals(await oura.getPersonalInfo(), {
        id: "45c64c058b8d8b1302f83eab198e6f04962e",
        age: 39,
        weight: 69.1,
        height: 1.9,
        biological_sex: "male",
        email: "ivangg@mm.st",
    });
});

Deno.test("getHeartRate", async function () {
    const oura = new Oura(await getSecret("oura", "token"));
    const heartrate = await oura.heartRate(
        df.subDays(new Date(), 3),
        new Date(),
    );

    console.log(heartrate);

    const data = JSON.stringify(heartrate, null, 2);
    console.log("DATA", data);
    await Deno.writeTextFile("heartrate.json", data);
});
