"use strict";

const SupplyModel = require("../models/supply.model");
const LocationModel = require("../models/location.model");
const AppError = require("../utils/appError");
const { toAppError, assertObjectId } = require("../utils/mongoErrors");

const POPULATE_LOCATION = { path: "location", select: "name status" };

class SuppliesService {
    async getAll(filters = {}) {
        const query = {};
        if (filters.location && filters.location !== "all") query.location = filters.location;
        if (filters.priority && filters.priority !== "all") query.priority = filters.priority;

        const supplies = await SupplyModel
            .find(query)
            .populate(POPULATE_LOCATION)
            .sort({ createdAt: -1 });
        return supplies.map((supply) => supply.toJSON());
    }

    async getById(id) {
        const supply = await this.findOrFail(id);
        await supply.populate(POPULATE_LOCATION);
        return supply.toJSON();
    }

    async create(data) {
        await this.assertLocationExists(data.location);
        try {
            const created = await SupplyModel.create({
                name: data.name.trim(),
                quantity: Number(data.quantity),
                unit: data.unit,
                priority: data.priority,
                location: data.location
            });
            await created.populate(POPULATE_LOCATION);
            return created.toJSON();
        } catch (error) {
            throw toAppError(error, "insumo");
        }
    }

    async update(id, changes) {
        const supply = await this.findOrFail(id);
        if (changes.location !== undefined) {
            await this.assertLocationExists(changes.location);
            supply.location = changes.location;
        }
        if (changes.name !== undefined) supply.name = changes.name.trim();
        if (changes.quantity !== undefined) supply.quantity = Number(changes.quantity);
        if (changes.unit !== undefined) supply.unit = changes.unit;
        if (changes.priority !== undefined) supply.priority = changes.priority;

        try {
            const saved = await supply.save();
            await saved.populate(POPULATE_LOCATION);
            return saved.toJSON();
        } catch (error) {
            throw toAppError(error, "insumo");
        }
    }

    async remove(id) {
        const supply = await this.findOrFail(id);
        await supply.deleteOne();
        return supply.toJSON();
    }

    async assertLocationExists(locationId) {
        const exists = await LocationModel.exists({ _id: locationId });
        if (!exists) {
            throw new AppError(400, "El centro de acopio indicado no existe");
        }
    }

    async findOrFail(id) {
        assertObjectId(id, "el insumo");
        const supply = await SupplyModel.findById(id);
        if (!supply) {
            throw new AppError(404, `No se encontró el insumo con ID ${id}`);
        }
        return supply;
    }
}

module.exports = SuppliesService;
