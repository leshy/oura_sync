import * as df from "date-fns";
import { join } from "https://deno.land/std@0.118.0/path/mod.ts";
import { getSecret } from "../utils/secrets.ts";

type Config = {
    baseURL: "https://api.ouraring.com/v2/";
};

export class Oura {
    private config: Config;
    constructor(
        private token: string,
        config: Partial<Config> = {},
    ) {
        this.config = { baseURL: "https://api.ouraring.com/v2/", ...config };
    }

    async GET(url: string, params?: Record<string, string>) {
        try {
            const headers = new Headers({
                Accept: "application/json",
                Authorization: "Bearer " + this.token,
            });

            const fullUrl = new URL(join(this.config.baseURL, url));

            if (params) {
                Object.keys(params).forEach((key) =>
                    fullUrl.searchParams.append(key, params[key]),
                );
            }
            console.log("REQUESTING", fullUrl.toString());
            const response = await fetch(fullUrl.toString(), {
                method: "GET",
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async getPersonalInfo() {
        return this.GET("usercollection/personal_info");
    }

    async heartRate(start_datetime: Date, end_datetime?: Date) {
        const params: { start_datetime: string; end_datetime?: string } = {
            start_datetime: start_datetime.toISOString(),
        };

        if (end_datetime) {
            params["end_datetime"] = end_datetime.toISOString();
        }

        return await this.GET("usercollection/heartrate", params);
    }
}
