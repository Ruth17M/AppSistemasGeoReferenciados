"use strict";

const ZoneModel = require("../models/zone.model");
const LocationModel = require("../models/location.model");
const AppError = require("../utils/appError");
const { closeRing } = require("../utils/geo");
const { toAppError, assertObjectId } = require("../utils/mongoErrors");

class ZonesService {
    // Todas las zonas, con cuántos centros de acopio quedan dentro de cada una.
    async getAll() {
        const zones = await ZoneModel
            .find()
            .populate({ path: "createdBy", select: "name" })
            .sort({ createdAt: 1 });

        return Promise.all(
            zones.map(async (zone) => {
                const locationsCount = await LocationModel.countDocuments({
                    location: { $geoWithin: { $geometry: zone.area } }
                });
                return { ...zone.toJSON(), locationsCount };
            })
        );
    }

    async getById(id) {
        const zone = await this.findOrFail(id);
        await zone.populate({ path: "createdBy", select: "name" });
        return zone.toJSON();
    }

    // Recibe los vértices [[lng, lat], ...] y los guarda como GeoJSON Polygon.
    async create(data, userId) {
        try {
            const created = await ZoneModel.create({
                name: data.name.trim(),
                color: data.color || "#2563eb",
                createdBy: userId,
                area: {
                    type: "Polygon",
                    coordinates: [closeRing(data.coordinates)]
                }
            });
            await created.populate({ path: "createdBy", select: "name" });
            return { ...created.toJSON(), locationsCount: 0 };
        } catch (error) {
            throw toAppError(error, "zona");
        }
    }

    async update(id, changes) {
        const zone = await this.findOrFail(id);
        if (changes.name !== undefined) zone.name = changes.name.trim();
        if (changes.color !== undefined) zone.color = changes.color;
        if (changes.coordinates !== undefined) {
            zone.area = { type: "Polygon", coordinates: [closeRing(changes.coordinates)] };
        }
        try {
            const saved = await zone.save();
            await saved.populate({ path: "createdBy", select: "name" });
            return saved.toJSON();
        } catch (error) {
            throw toAppError(error, "zona");
        }
    }

    async remove(id) {
        const zone = await this.findOrFail(id);
        await zone.deleteOne();
        return zone.toJSON();
    }

    async findOrFail(id) {
        assertObjectId(id, "la zona");
        const zone = await ZoneModel.findById(id);
        if (!zone) {
            throw new AppError(404, `No se encontró la zona con ID ${id}`);
        }
        return zone;
    }
}

module.exports = ZonesService;
