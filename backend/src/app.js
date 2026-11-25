"use strict";

const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const routerApi = require("./routes");
const { notFoundHandler, logErrors, errorHandler } = require("./middlewares/error.handler");

const app = express();

app.use(cors({
    origin: config.corsOrigins.includes("*") ? "*" : config.corsOrigins
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.status(200).json({
        name: "API AcopioMap",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth/register | /api/auth/login | /api/auth/me",
            locations: "/api/locations?search=&category=&status=&zone=",
            geojson: "/api/locations/geojson",
            zones: "/api/zones",
            categories: "/api/categories",
            organizations: "/api/organizations",
            supplies: "/api/supplies"
        }
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

routerApi(app);

// Manejo de errores: siempre después de las rutas y en este orden
app.use(notFoundHandler);
app.use(logErrors);
app.use(errorHandler);

module.exports = app;
