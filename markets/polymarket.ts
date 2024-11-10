import { getFirstSecret } from "../utils/secrets.ts";
import { Wallet } from "@ethersproject/wallet";
import { ClobClient } from "@polymarket/clob-client";

export interface PolyMarketConfig {
    chainId: number;
    clobApiUrl: string;
}

export class Polymarket {
    config: PolyMarketConfig;
    private client?: ClobClient;
    private wallet?: Wallet;

    constructor(config: PolyMarketConfig) {
        this.config = config;
    }

    async getWallet(): Promise<Wallet> {
        if (!this.wallet) {
            const keys = await getFirstSecret("polymarket");
            const public_key = keys["username"];
            const private_key = keys["password"];

            const wallet = new Wallet(private_key);
            console.log("Keys:", keys);
            console.log(`Eth Wallet: ${await wallet.getAddress()}`);
            this.wallet = wallet;
        }
        return this.wallet;
    }

    async getClient(): Promise<ClobClient> {
        if (!this.client) {
            const wallet = await this.getWallet();
            const apiUrl = this.config["clobApiUrl"];
            const chainId = this.config["chainId"];
            console.log(
                `Polymarket CLOB Client: ${apiUrl}, Chain ID: ${chainId}`,
            );
            this.client = new ClobClient(apiUrl, chainId, wallet);
        }

        return this.client;
    }

    async listMarkets(): Promise<any> {
        const clobClient = await this.getClient();
        const resp = await clobClient.getSamplingMarkets();
        const markets = JSON.stringify(resp, null, 2);
        await Deno.writeTextFile("markets.json", markets);
        return resp;
    }
}
