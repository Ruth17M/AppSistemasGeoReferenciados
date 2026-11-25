"use strict";

const express = require("express");
const CategoriesService = require("../services/categories.service");
const { validateBody, validateIdParam } = require("../middlewares/validator.handler");
const { categorySchema } = require("../middlewares/schemas/category.schema");

const router = express.Router();
const service = new CategoriesService();

router.get("/", async (req, res) => {
    const categories = await service.getAll();
    res.status(200).json({ count: categories.length, data: categories });
});

router.get("/:id", validateIdParam("la categoría"), async (req, res) => {
    res.status(200).json({ data: await service.getById(req.params.id) });
});

router.post("/", validateBody(categorySchema), async (req, res) => {
    const category = await service.create(req.body);
    res.status(201).json({ message: "Categoría creada", data: category });
});

router.patch("/:id", validateIdParam("la categoría"), validateBody(categorySchema, { partial: true }), async (req, res) => {
    const category = await service.update(req.params.id, req.body);
    res.status(200).json({ message: "Categoría actualizada", data: category });
});

router.delete("/:id", validateIdParam("la categoría"), async (req, res) => {
    const category = await service.remove(req.params.id);
    res.status(200).json({ message: "Categoría eliminada", data: category });
});

module.exports = router;
