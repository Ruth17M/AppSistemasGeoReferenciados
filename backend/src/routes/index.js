"use strict";

const express = require("express");
const authRouter = require("./auth.router");

function routerApi(app) {
    const router = express.Router();
    app.use("/api", router);

    // Públicas
    router.use("/auth", authRouter);
}

module.exports = routerApi;
