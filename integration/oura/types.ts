export type GetSeries<T> = (
    start_date: Date,
    end_date?: Date,
) => AsyncGenerator<T>;

export type DailyReadiness = {
    id: string;
    contributors: {
        activity_balance: number;
        body_temperature: number;
        hrv_balance: number;
        previous_day_activity: number;
        previous_night: number;
        recovery_index: number;
        resting_heart_rate: number;
        sleep_balance: number;
    };
    day: Date;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number;
    timestamp: string;
};

export type DailyStressSummary = null | "normal" | "stressful" | "restored";

export type DailyStress = {
    id: string;
    day: Date;
    stress_high: number;
    recovery_high: number;
    day_summary: DailyStressSummary;
};

export type DailySleepType = "long_sleep" | "sleep";
export type DailySleepAlgo = null | "v1" | "v2";

export type DailySleep = {
    id: string;
    average_breath: number;
    average_heart_rate: number;
    average_hrv: number;
    awake_time: number;
    bedtime_end: string; // "2024-11-13T08:43:42+08:00",
    bedtime_start: string; // "2024-11-13T00:57:31+08:00",
    day: Date;
    deep_sleep_duration: number;
    efficiency: number;
    heart_rate: {
        interval: number;
        items: Array<number>;
        timestamp: string; // "2024-11-13T00:57:31.000+08:00"
    };
    readiness: {
        contributors: {
            activity_balance: number;
            body_temperature: number;
            hrv_balance: number;
            previous_day_activity: number;
            previous_night: number;
            recovery_index: number;
            resting_heart_rate: number;
            sleep_balance: number;
        };
        score: number;
        temperature_deviation: number;
        temperature_trend_deviation: number;
    };
    readiness_score_delta: number;
    rem_sleep_duration: number;
    restless_periods: number;
    sleep_phase_5_min: string;
    sleep_score_delta: number;
    sleep_algorithm_version: DailySleepAlgo;
    time_in_bed: number;
    total_sleep_duration: number;
    type: DailySleepType;
};

export type HeartRate = {
    bpm: number;
    source: "awake" | "rest" | "workout";
    timestamp: Date;
};

export type DailySpo2 = {
    id: string;
    day: Date;
    spo2_percentage: { average: number };
    breathing_disturbance_index: number;
};
