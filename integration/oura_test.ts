import { assertEquals } from "@std/assert";
import { getSecret } from "../utils/secrets.ts";
import { Oura } from "./oura.ts";
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

Deno.test("getDailyReadiness", async function () {
    const oura = new Oura(await getSecret("oura", "token"));

    for await (const point of oura.getDailySleep(
        df.subDays(new Date(), 10),
        new Date(),
    )) {
        console.log(point);
    }
});
