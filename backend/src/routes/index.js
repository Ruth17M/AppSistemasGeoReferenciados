"use strict";

const express = require("express");
const { requireAuth } = require("../middlewares/auth.handler");
const authRouter = require("./auth.router");
const categoriesRouter = require("./categories.router");
const organizationsRouter = require("./organizations.router");
const suppliesRouter = require("./supplies.router");
const locationsRouter = require("./locations.router");
const zonesRouter = require("./zones.router");

function routerApi(app) {
    const router = express.Router();
    app.use("/api", router);

    // Públicas
    router.use("/auth", authRouter);

    // Protegidas: requieren token JWT
    router.use("/categories", requireAuth, categoriesRouter);
    router.use("/organizations", requireAuth, organizationsRouter);
    router.use("/supplies", requireAuth, suppliesRouter);
    router.use("/locations", requireAuth, locationsRouter);
    router.use("/zones", requireAuth, zonesRouter);
}

module.exports = routerApi;
