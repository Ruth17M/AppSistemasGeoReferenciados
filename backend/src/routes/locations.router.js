"use strict";

const express = require("express");
const LocationsService = require("../services/locations.service");
const { validateBody, validateIdParam, validateQuery } = require("../middlewares/validator.handler");
const { locationSchema, locationQuerySchema } = require("../middlewares/schemas/location.schema");

const router = express.Router();
const service = new LocationsService();

function readFilters(query) {
    return {
        search: query.search,
        category: query.category,
        status: query.status,
        zone: query.zone
    };
}

// GET /api/locations?search=&category=&status=&zone=
router.get("/", validateQuery(locationQuerySchema), async (req, res) => {
    const locations = await service.getAll(readFilters(req.query));
    res.status(200).json({ count: locations.length, data: locations });
});

router.get("/geojson", validateQuery(locationQuerySchema), async (req, res) => {
    res.status(200).json(await service.getGeoJSON(readFilters(req.query)));
});

router.get("/:id", validateIdParam("el centro de acopio"), async (req, res) => {
    res.status(200).json({ data: await service.getById(req.params.id) });
});

router.post("/", validateBody(locationSchema), async (req, res) => {
    const location = await service.create(req.body, req.user.id);
    res.status(201).json({ message: "Centro de acopio registrado", data: location });
});

router.patch("/:id", validateIdParam("el centro de acopio"), validateBody(locationSchema, { partial: true }), async (req, res) => {
    const location = await service.update(req.params.id, req.body);
    res.status(200).json({ message: "Centro de acopio actualizado", data: location });
});

router.delete("/:id", validateIdParam("el centro de acopio"), async (req, res) => {
    const location = await service.remove(req.params.id);
    res.status(200).json({ message: "Centro de acopio eliminado", data: location });
});

module.exports = router;
