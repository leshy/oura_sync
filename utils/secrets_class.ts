import { join } from "https://deno.land/std@0.118.0/path/mod.ts";

async function exec(cmd: string, ...args: string[]): Promise<string> {
  const exec = new Deno.Command(cmd, { args: args });
  const { code, stdout, stderr } = await exec.output();
  return new TextDecoder().decode(stdout).trim();
}

export class Credentials {
  constructor(
    public service: string,
    public username: string,
  ) {}
  async password(): Promise<string> {
    return await exec("pass", join(this.service, this.username));
  }

  toString(): string {
    return `Credentials("${this.service}", "${this.username}")`;
  }
}

export async function getCredentials(service: string): Promise<Credentials[]>;
export async function getCredentials(
  service: string,
  username: string,
): Promise<Credentials>;

export async function getCredentials(service: string, username?: string) {
  if (username) {
    return new Credentials(service, username);
  }

  return (await exec("pass", "ls", service))
    .split("\n")
    .slice(1)
    .map(
      (line: string) =>
        new Credentials(service, line.split(" ").pop() as string),
    );
}
