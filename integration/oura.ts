import * as df from "npm:date-fns";
import { join } from "https://deno.land/std@0.118.0/path/mod.ts";
import { getSecret } from "../utils/secrets.ts";
import * as types from "./oura/types.ts";

function filterUndefined(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined),
    );
}

type Config = {
    baseURL: string;
    token: string;
};

export class Oura {
    private config: Config;
    constructor(config: Partial<Config>) {
        this.config = { baseURL: "https://api.ouraring.com/v2/", ...config };
    }

    async GET(url: string, params?: Record<string, string>) {
        try {
            const headers = new Headers({
                Accept: "application/json",
                Authorization: "Bearer " + this.config.token,
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
                throw new Error(
                    `Error: ${response.statusText} ${await response.text()}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async getPersonalInfo() {
        return this.GET("usercollection/personal_info");
    }

    async *getSeries(
        endpoint: string,
        start_datetime: Date,
        end_datetime?: Date,
        next_token?: string,
    ): AsyncGenerator<any> {
        // check if range is longer then 30 days
        if (
            end_datetime &&
            df.differenceInDays(end_datetime, start_datetime) > 30
        ) {
            // split range into 30 day chunks
            while (df.differenceInDays(end_datetime, start_datetime) > 30) {
                const end_datetime_chunk = df.addDays(start_datetime, 30);
                yield* this.getSeries(
                    endpoint,
                    start_datetime,
                    end_datetime_chunk,
                );
                start_datetime = end_datetime_chunk;
            }
            return;
        }

        const response = await this.GET(
            endpoint,
            filterUndefined({
                start_datetime: start_datetime.toISOString(),
                end_datetime: end_datetime
                    ? end_datetime.toISOString()
                    : undefined,
                next_token: next_token ? next_token : undefined,
            }),
        );

        for (const point of response["data"]) {
            yield point;
        }

        if (response["next_token"]) {
            yield* this.getSeries(
                endpoint,
                start_datetime,
                end_datetime,
                response["next_token"],
            );
        }
    }

    async *getDailySeries(
        endpoint: string,
        start_date: Date,
        end_date?: Date,
        next_token?: string,
    ): AsyncGenerator<any> {
        const response = await this.GET(
            endpoint,
            filterUndefined({
                start_date: df.format(df.subDays(start_date, 1), "yyyy-MM-dd"),
                end_date: end_date
                    ? df.format(end_date, "yyyy-MM-dd")
                    : undefined,
                next_token: next_token ? next_token : undefined,
            }),
        );

        for (const point of response["data"]) {
            yield { ...point, day: new Date(point.day) };
        }

        if (response["next_token"]) {
            yield* this.getSeries(
                endpoint,
                start_date,
                end_date,
                response["next_token"],
            );
        }
    }

    dailySeriesEndpoint =
        (endpoint: string) => (start_date: Date, end_date?: Date) =>
            this.getDailySeries(endpoint, start_date, end_date);

    seriesEndpoint =
        (endpoint: string) => (start_date: Date, end_date?: Date) =>
            this.getSeries(endpoint, start_date, end_date);

    getHeartRate: types.GetSeries<types.HeartRate> = this.seriesEndpoint(
        "usercollection/heartrate",
    );

    getDailySleep: types.GetSeries<types.DailySleep> = this.dailySeriesEndpoint(
        "usercollection/sleep",
    );

    getDailyStress: types.GetSeries<types.DailyStress> =
        this.dailySeriesEndpoint("usercollection/daily_stress");

    getDailyReadiness: types.GetSeries<types.DailyReadiness> =
        this.dailySeriesEndpoint("usercollection/daily_readiness");

    getDailySpo2: types.GetSeries<types.DailySpo2> = this.dailySeriesEndpoint(
        "usercollection/daily_spo2",
    );
}
