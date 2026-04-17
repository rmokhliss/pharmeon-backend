export declare class AppController {
    getWelcome(): {
        app: string;
        version: string;
        status: string;
    };
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
