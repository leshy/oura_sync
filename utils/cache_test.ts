import { assertEquals } from "@std/assert";
import { createCachingDecorator } from "./cache.ts";
import { Memory } from "./kvstore/memory.ts";

Deno.test("list users", async function () {
    class Example {
        @createCachingDecorator(new Memory())
        public compute(arg: number): number {
            console.log(`Computing result for: ${arg}`);
            return arg * arg;
        }
    }

    const example = new Example();
    console.log(example.compute(5)); // Computes and caches
    console.log(example.compute(5)); // Fetches from cache
    console.log(example.compute(10)); // Computes and caches
});
