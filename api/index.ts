// Wrap the entire import in a try-catch to prevent FUNCTION_INVOCATION_FAILED
let app: any;

try {
    const serverModule = await import('../app_server.ts');
    app = serverModule.default;
} catch (err) {
    console.error("FATAL: Failed to import server module:", err);
    // Create a minimal express app that returns the error
    const express = (await import('express')).default;
    app = express();
    app.use((req: any, res: any) => {
        res.status(500).json({
            error: "Server initialization failed",
            details: (err as Error).message
        });
    });
}

export default app;
