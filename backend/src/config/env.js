"use strict";

// Carga las variables de .env una sola vez y las expone ya procesadas.
require("dotenv").config();

const config = {
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGODB_URI,
    mongoDbName: process.env.MONGODB_DB_NAME || "acopiomap",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    corsOrigins: (process.env.CORS_ORIGIN || "*")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    dnsServers: (process.env.DNS_SERVERS || "")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean)
};

if (!config.jwtSecret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

module.exports = config;
