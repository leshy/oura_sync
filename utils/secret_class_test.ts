import { assertEquals } from "@std/assert";
import { Credentials, getCredentials } from "./secrets_class.ts";

Deno.test("list users", async function () {
    const users = await getCredentials("test.com");
    assertEquals(users, [
        new Credentials("test.com", "testuser@localhost"),
        new Credentials("test.com", "user2@localhost"),
    ]);
});

Deno.test("get secret", async function () {
    const creds = new Credentials("test.com", "testuser@localhost");
    assertEquals(await creds.password(), "testpassword");
});
