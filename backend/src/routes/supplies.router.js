"use strict";

const express = require("express");
const SuppliesService = require("../services/supplies.service");
const { validateBody, validateIdParam, validateQuery } = require("../middlewares/validator.handler");
const { supplySchema, supplyQuerySchema } = require("../middlewares/schemas/supply.schema");

const router = express.Router();
const service = new SuppliesService();

router.get("/", validateQuery(supplyQuerySchema), async (req, res) => {
    const supplies = await service.getAll({
        location: req.query.location,
        priority: req.query.priority
    });
    res.status(200).json({ count: supplies.length, data: supplies });
});

router.get("/:id", validateIdParam("el insumo"), async (req, res) => {
    res.status(200).json({ data: await service.getById(req.params.id) });
});

router.post("/", validateBody(supplySchema), async (req, res) => {
    const supply = await service.create(req.body);
    res.status(201).json({ message: "Insumo registrado", data: supply });
});

router.patch("/:id", validateIdParam("el insumo"), validateBody(supplySchema, { partial: true }), async (req, res) => {
    const supply = await service.update(req.params.id, req.body);
    res.status(200).json({ message: "Insumo actualizado", data: supply });
});

router.delete("/:id", validateIdParam("el insumo"), async (req, res) => {
    const supply = await service.remove(req.params.id);
    res.status(200).json({ message: "Insumo eliminado", data: supply });
});

module.exports = router;
