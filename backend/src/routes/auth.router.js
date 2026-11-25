"use strict";

const express = require("express");
const UsersService = require("../services/users.service");
const { validateBody } = require("../middlewares/validator.handler");
const { requireAuth } = require("../middlewares/auth.handler");
const { registerSchema, loginSchema } = require("../middlewares/schemas/auth.schema");

const router = express.Router();
const service = new UsersService();

// Express 5 envía automáticamente al errorHandler los errores de funciones async.

router.post("/register", validateBody(registerSchema), async (req, res) => {
    const result = await service.register(req.body);
    res.status(201).json({ message: "Cuenta creada correctamente", data: result });
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
    const result = await service.login(req.body);
    res.status(200).json({ message: "Sesión iniciada", data: result });
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await service.getById(req.user.id);
    res.status(200).json({ data: user });
});

module.exports = router;
