"use strict";

const express = require("express");
const ZonesService = require("../services/zones.service");
const { validateBody, validateIdParam } = require("../middlewares/validator.handler");
const { zoneSchema } = require("../middlewares/schemas/zone.schema");

const router = express.Router();
const service = new ZonesService();

router.get("/", async (req, res) => {
    const zones = await service.getAll();
    res.status(200).json({ count: zones.length, data: zones });
});

router.get("/:id", validateIdParam("la zona"), async (req, res) => {
    res.status(200).json({ data: await service.getById(req.params.id) });
});

router.post("/", validateBody(zoneSchema), async (req, res) => {
    const zone = await service.create(req.body, req.user.id);
    res.status(201).json({ message: "Zona guardada", data: zone });
});

router.patch("/:id", validateIdParam("la zona"), validateBody(zoneSchema, { partial: true }), async (req, res) => {
    const zone = await service.update(req.params.id, req.body);
    res.status(200).json({ message: "Zona actualizada", data: zone });
});

router.delete("/:id", validateIdParam("la zona"), async (req, res) => {
    const zone = await service.remove(req.params.id);
    res.status(200).json({ message: "Zona eliminada", data: zone });
});

module.exports = router;
