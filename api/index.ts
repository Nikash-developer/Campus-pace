let app: any;

export default async function handler(req: any, res: any) {
    if (!app) {
        try {
            console.log("Attempting to load app_server...");
            const module = await import('../app_server');
            app = module.default;
            console.log("app_server loaded successfully");
        } catch (err) {
            console.error("CRITICAL: app_server failed to load:", err);
            return res.status(500).json({
                error: "Server module failed to load",
                details: (err as Error).message,
                stack: (err as Error).stack
            });
        }
    }

    // Standard Vercel function can also act as an Express handler
    return app(req, res);
}
