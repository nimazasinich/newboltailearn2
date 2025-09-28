export declare const getSystemMetrics: () => {
    uptime: number;
    memory: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
        arrayBuffers: any;
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        load1: number;
        load5: number;
        load15: number;
        cores: number;
        usage: number;
    };
    platform: NodeJS.Platform;
    pid: number;
    timestamp: number;
    active_training: number;
};
export declare const getDeterministicAnalytics: () => {
    users: number;
    sessions: number;
    models: number;
    datasets: number;
    timestamp: number;
};
//# sourceMappingURL=metrics.d.ts.map