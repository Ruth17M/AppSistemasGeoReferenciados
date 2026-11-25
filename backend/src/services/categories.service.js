"use strict";

const CategoryModel = require("../models/category.model");
const LocationModel = require("../models/location.model");
const AppError = require("../utils/appError");
const { toAppError, assertObjectId } = require("../utils/mongoErrors");

class CategoriesService {
    async getAll() {
        const categories = await CategoryModel.find().sort({ name: 1 });
        return categories.map((category) => category.toJSON());
    }

    async getById(id) {
        const category = await this.findOrFail(id);
        return category.toJSON();
    }

    async create(data) {
        try {
            const created = await CategoryModel.create({
                name: data.name.trim(),
                description: (data.description || "").trim(),
                color: data.color
            });
            return created.toJSON();
        } catch (error) {
            throw toAppError(error, "categoría");
        }
    }

    async update(id, changes) {
        const category = await this.findOrFail(id);
        if (changes.name !== undefined) category.name = changes.name.trim();
        if (changes.description !== undefined) category.description = (changes.description || "").trim();
        if (changes.color !== undefined) category.color = changes.color;

        try {
            const saved = await category.save();
            return saved.toJSON();
        } catch (error) {
            throw toAppError(error, "categoría");
        }
    }

    async remove(id) {
        const category = await this.findOrFail(id);

        // No se permite borrar una categoría que usan los centros de acopio.
        const inUse = await LocationModel.countDocuments({ category: category._id });
        if (inUse > 0) {
            throw new AppError(400, `No se puede eliminar: ${inUse} centro(s) de acopio usan esta categoría`);
        }

        await category.deleteOne();
        return category.toJSON();
    }

    async findOrFail(id) {
        assertObjectId(id, "la categoría");
        const category = await CategoryModel.findById(id);
        if (!category) {
            throw new AppError(404, `No se encontró la categoría con ID ${id}`);
        }
        return category;
    }
}

module.exports = CategoriesService;
