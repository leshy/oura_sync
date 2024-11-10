import { join } from "https://deno.land/std@0.118.0/path/mod.ts";

async function exec(cmd: string, ...args: string[]): Promise<string> {
  const exec = new Deno.Command(cmd, { args: args });
  const { code, stdout, stderr } = await exec.output();
  return new TextDecoder().decode(stdout).trim();
}

interface Secret {
  username: string;
  password: string;
}

export async function getUsers(service: string): Promise<string[]> {
  return (await exec("pass", "ls", service))
    .split("\n")
    .slice(1)
    .map((line: string) => line.split(" ").pop()) as string[];
}

export async function getSecret(
  service: string,
  user: string,
): Promise<string> {
  return await exec("pass", join(service, user));
}

export async function getFirstSecret(service: string): Promise<Secret> {
  const [firstUser] = await getUsers(service);
  return {
    username: firstUser,
    password: await getSecret(service, firstUser),
  };
}
