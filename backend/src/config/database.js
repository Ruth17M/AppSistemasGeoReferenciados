"use strict";

const dns = require("node:dns");
const mongoose = require("mongoose");
const config = require("./env");

// Las URIs "mongodb+srv://" necesitan una consulta DNS SRV. En algunas redes
// el DNS del sistema la rechaza ("querySrv ECONNREFUSED"); si se configuran
// DNS_SERVERS en el .env se usan esos servidores.
if (config.dnsServers.length > 0) {
    dns.setServers(config.dnsServers);
}

async function connectDatabase() {
    if (!config.mongoUri) {
        throw new Error("MONGODB_URI no está definido en las variables de entorno");
    }

    await mongoose.connect(config.mongoUri, {
        dbName: config.mongoDbName,
        serverSelectionTimeoutMS: 10000
    });

    // Asegura que existan los índices (2dsphere, email único, etc.)
    await mongoose.syncIndexes();

    console.log(`Conectado a MongoDB -> base de datos: "${mongoose.connection.name}"`);
}

async function disconnectDatabase() {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
}

module.exports = { connectDatabase, disconnectDatabase };
