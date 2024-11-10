import { assertEquals } from "@std/assert";
import { Polymarket } from "./polymarket.ts";
import { loadConfig } from "../utils/config.ts";

Deno.test("start", async function () {
    const config = await loadConfig();
    const polymarket_config = config["market"]["polymarket"];

    const polymarket = new Polymarket(polymarket_config);
    const res = await polymarket.listMarkets();
    console.log(res);
});
