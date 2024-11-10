import config from "../config.json" with { type: "json" };
import { PolyMarketConfig } from "../markets/polymarket.ts";

interface Config {
    market: {
        polymarket: PolyMarketConfig;
    };
}

export async function loadConfig(): Promise<Config> {
    return config;
}
