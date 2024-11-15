import { objSet } from "./utils.ts";
import { deepMerge } from "https://deno.land/std/collections/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
/**
 * Reads JSON files in a directory, loads them in alphabetical order, and overlays them into a dictionary.
 *
 * @param {string} directoryPath The path to the directory containing the JSON files.
 * @returns {Promise<CONFIG>} A promise that resolves to the combined configuration.
 */
export async function jsonConfigProvider<CONFIG>(
    directoryPath: string,
): Promise<Partial<CONFIG>> {
    try {
        // Read files from the directory
        const files: string[] = [];
        for await (const dirEntry of Deno.readDir(directoryPath)) {
            if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
                files.push(join(directoryPath, dirEntry.name));
            }
        }

        // Sort files alphabetically
        files.sort();

        // Combine JSON configurations
        return files.reduce(
            (fullConfig: Partial<CONFIG>, filePath: string) =>
                deepMerge(
                    fullConfig,
                    JSON.parse(Deno.readTextFileSync(filePath)),
                ),
            {},
        ) as Partial<CONFIG>;
    } catch (error) {
        console.error("Error reading JSON config files:", error);
        throw error;
    }
}

/**
 * Reads environment variables with a specified prefix and returns a deep dictionary CONFIG object.
 *
 * @param {string} prefix - The prefix for environment variables to consider.
 * @returns {Promise<CONFIG>} A promise that resolves to the deep configuration object.
 */
export async function envConfigProvider<CONFIG>(
    prefix?: string,
): Promise<Partial<CONFIG>> {
    const config: any = {};

    // Get all environment variables
    const env = Deno.env.toObject();

    // Filter the environment variables by the specified prefix
    const prefixUpper = prefix.toUpperCase();

    for (const [key, value] of Object.entries(env)) {
        if (key.startsWith(prefixUpper)) {
            // Remove prefix and normalize key, then split by underscore to handle nesting
            const pathParts = key
                .slice(prefixUpper.length + 1) // +1 to remove the trailing underscore
                .toLowerCase()
                .split("_");

            // Build the nested configuration object
            let currentLevel = config;

            try {
                objSet(config, pathParts, JSON.parse(value));
            } catch {
                objSet(config, pathParts, value);
            }
        }
    }

    return config as Partial<CONFIG>;
}
