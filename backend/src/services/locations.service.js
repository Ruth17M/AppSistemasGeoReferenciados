"use strict";

const LocationModel = require("../models/location.model");
const CategoryModel = require("../models/category.model");
const OrganizationModel = require("../models/organization.model");
const SupplyModel = require("../models/supply.model");
const ZoneModel = require("../models/zone.model");
const AppError = require("../utils/appError");
const { toPoint, escapeRegex } = require("../utils/geo");
const { toAppError, assertObjectId } = require("../utils/mongoErrors");

// populate: se regresa el nombre de la categoría/organización/usuario, no solo su ObjectId
const POPULATE = [
    { path: "category", select: "name color" },
    { path: "organization", select: "name type phone" },
    { path: "createdBy", select: "name email" }
];

class LocationsService {
    /**
     * Lista con filtros resueltos en MongoDB:
     *  - search:   nombre parcial, sin importar mayúsculas (regex "i")
     *  - category: ObjectId de la categoría
     *  - status:   activo | saturado | cerrado
     *  - zone:     ObjectId de una zona -> centros dentro del polígono ($geoWithin)
     */
    async getAll(filters = {}) {
        const { search, category, status, zone } = filters;
        const query = {};

        const text = String(search ?? "").trim();
        if (text) {
            query.name = { $regex: escapeRegex(text), $options: "i" };
        }
        if (category && category !== "all") {
            query.category = category;
        }
        if (status && status !== "all") {
            query.status = status;
        }
        if (zone && zone !== "all") {
            const zoneDoc = await ZoneModel.findById(zone);
            if (!zoneDoc) {
                throw new AppError(404, `No se encontró la zona con ID ${zone}`);
            }
            query.location = { $geoWithin: { $geometry: zoneDoc.area } };
        }

        const locations = await LocationModel
            .find(query)
            .populate(POPULATE)
            .sort({ createdAt: -1 });

        return locations.map((location) => location.toJSON());
    }

    // Misma consulta pero en formato GeoJSON FeatureCollection
    async getGeoJSON(filters = {}) {
        const locations = await this.getAll(filters);
        return {
            type: "FeatureCollection",
            features: locations.map(({ location, ...properties }) => ({
                type: "Feature",
                geometry: location,
                properties
            }))
        };
    }

    async getById(id) {
        const location = await this.findOrFail(id);
        await location.populate(POPULATE);
        return location.toJSON();
    }

    async create(data, userId) {
        await this.assertReferences(data);
        try {
            const created = await LocationModel.create({
                name: data.name.trim(),
                description: data.description.trim(),
                category: data.category,
                organization: data.organization || null,
                status: data.status || "activo",
                createdBy: userId,
                location: toPoint(data.longitude, data.latitude)
            });
            await created.populate(POPULATE);
            return created.toJSON();
        } catch (error) {
            throw toAppError(error, "centro de acopio");
        }
    }

    async update(id, changes) {
        const location = await this.findOrFail(id);
        await this.assertReferences(changes);

        if (changes.name !== undefined) location.name = changes.name.trim();
        if (changes.description !== undefined) location.description = changes.description.trim();
        if (changes.category !== undefined) location.category = changes.category;
        if (changes.organization !== undefined) location.organization = changes.organization || null;
        if (changes.status !== undefined) location.status = changes.status;

        if (changes.latitude !== undefined || changes.longitude !== undefined) {
            const [currentLng, currentLat] = location.location.coordinates;
            location.location = toPoint(
                changes.longitude ?? currentLng,
                changes.latitude ?? currentLat
            );
        }

        try {
            const saved = await location.save();
            await saved.populate(POPULATE);
            return saved.toJSON();
        } catch (error) {
            throw toAppError(error, "centro de acopio");
        }
    }

    async remove(id) {
        const location = await this.findOrFail(id);
        // Los insumos dependen del centro: se eliminan en cascada.
        await SupplyModel.deleteMany({ location: location._id });
        await location.deleteOne();
        return location.toJSON();
    }

    // Comprueba que las referencias (ObjectId) apunten a documentos existentes.
    async assertReferences(data) {
        if (data.category) {
            const exists = await CategoryModel.exists({ _id: data.category });
            if (!exists) throw new AppError(400, "La categoría indicada no existe");
        }
        if (data.organization) {
            const exists = await OrganizationModel.exists({ _id: data.organization });
            if (!exists) throw new AppError(400, "La organización indicada no existe");
        }
    }

    async findOrFail(id) {
        assertObjectId(id, "el centro de acopio");
        const location = await LocationModel.findById(id);
        if (!location) {
            throw new AppError(404, `No se encontró el centro de acopio con ID ${id}`);
        }
        return location;
    }
}

module.exports = LocationsService;
