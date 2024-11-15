import { join } from "https://deno.land/std/path/mod.ts";
import { jsonConfigProvider, envConfigProvider, redact } from "./config.ts";
import { deepMerge } from "https://deno.land/std/collections/mod.ts";

export async function app<CONFIG>(
    name: string,
    fn: (config: CONFIG) => Promise<void>,
) {
    console.log(`Starting ${name}`);
    const projectRoot = new URL(".", import.meta.url).pathname;
    const config = deepMerge(
        ...(await Promise.all([
            jsonConfigProvider<CONFIG>(join(projectRoot, "..", "config")),
            envConfigProvider<CONFIG>(name.toUpperCase()),
        ])),
    );

    console.log(redact(config));

    fn(config)
        .catch((error) => {
            console.error(`error:`, error);
            throw error;
            Deno.exit(1);
        })
        .then(() => {
            console.log(`${name} success`);
            Deno.exit(0);
        });
}
