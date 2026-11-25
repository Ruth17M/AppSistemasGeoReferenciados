"use strict";

const app = require("./app");
const config = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");

async function startServer() {
    try {
        await connectDatabase();

        const server = app.listen(config.port, () => {
            console.log(`API AcopioMap escuchando en http://localhost:${config.port}`);
        });

        const shutdown = (signal) => {
            console.log(`\nSeñal ${signal} recibida. Cerrando servidor...`);
            server.close(async () => {
                await disconnectDatabase();
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error.message);
        process.exit(1);
    }
}

startServer();
