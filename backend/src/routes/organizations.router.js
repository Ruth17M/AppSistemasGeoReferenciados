"use strict";

const express = require("express");
const OrganizationsService = require("../services/organizations.service");
const { validateBody, validateIdParam } = require("../middlewares/validator.handler");
const { organizationSchema } = require("../middlewares/schemas/organization.schema");

const router = express.Router();
const service = new OrganizationsService();

router.get("/", async (req, res) => {
    const organizations = await service.getAll();
    res.status(200).json({ count: organizations.length, data: organizations });
});

router.get("/:id", validateIdParam("la organización"), async (req, res) => {
    res.status(200).json({ data: await service.getById(req.params.id) });
});

router.post("/", validateBody(organizationSchema), async (req, res) => {
    const organization = await service.create(req.body);
    res.status(201).json({ message: "Organización creada", data: organization });
});

router.patch("/:id", validateIdParam("la organización"), validateBody(organizationSchema, { partial: true }), async (req, res) => {
    const organization = await service.update(req.params.id, req.body);
    res.status(200).json({ message: "Organización actualizada", data: organization });
});

router.delete("/:id", validateIdParam("la organización"), async (req, res) => {
    const organization = await service.remove(req.params.id);
    res.status(200).json({ message: "Organización eliminada", data: organization });
});

module.exports = router;
