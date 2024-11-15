export type Service = {
    start?: () => Promise<any>;
    stop?: () => Promise<any>;
};
