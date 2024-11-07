import { join } from "https://deno.land/std@0.118.0/path/mod.ts";

interface Secret {
  username: string;
  password: string;
}

export async function getUsers(service: string): Promise<string[]> {
  const command = new Deno.Command("pass", {
    args: ["ls", service],
  });
  const { code, stdout, stderr } = await command.output();
  return new TextDecoder()
    .decode(stdout)
    .trim()
    .split("\n")
    .slice(1)

    .map((line: string) => line.split(" ").pop()) as string[];
}

export async function getSecret(
  service: string,
  user: string,
): Promise<string> {
  const command = new Deno.Command("pass", {
    args: [join(service, user)],
  });
  const { code, stdout, stderr } = await command.output();
  return new TextDecoder().decode(stdout).trim();
}

export async function getFirstSecret(service: string): Promise<Secret> {
  const [firstUser] = await getUsers(service);
  return {
    username: firstUser,
    password: await getSecret(service, firstUser),
  };
}
