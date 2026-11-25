"use strict";

const OrganizationModel = require("../models/organization.model");
const LocationModel = require("../models/location.model");
const AppError = require("../utils/appError");
const { toAppError, assertObjectId } = require("../utils/mongoErrors");

const EDITABLE_FIELDS = ["name", "type", "contactName", "phone", "email"];

class OrganizationsService {
    async getAll() {
        const organizations = await OrganizationModel.find().sort({ name: 1 }).lean();

        // Cuántos centros opera cada organización
        const counts = await LocationModel.aggregate([
            { $match: { organization: { $ne: null } } },
            { $group: { _id: "$organization", total: { $sum: 1 } } }
        ]);
        const countById = new Map(counts.map((item) => [item._id.toString(), item.total]));

        return organizations.map(({ _id, __v, ...rest }) => ({
            id: _id.toString(),
            ...rest,
            locationsCount: countById.get(_id.toString()) || 0
        }));
    }

    async getById(id) {
        const organization = await this.findOrFail(id);
        return organization.toJSON();
    }

    async create(data) {
        try {
            const created = await OrganizationModel.create(this.pick(data));
            return created.toJSON();
        } catch (error) {
            throw toAppError(error, "organización");
        }
    }

    async update(id, changes) {
        const organization = await this.findOrFail(id);
        Object.assign(organization, this.pick(changes));
        try {
            const saved = await organization.save();
            return saved.toJSON();
        } catch (error) {
            throw toAppError(error, "organización");
        }
    }

    async remove(id) {
        const organization = await this.findOrFail(id);
        // Los centros que la usaban quedan sin organización asignada.
        await LocationModel.updateMany({ organization: organization._id }, { organization: null });
        await organization.deleteOne();
        return organization.toJSON();
    }

    pick(data) {
        const result = {};
        for (const field of EDITABLE_FIELDS) {
            if (data[field] !== undefined) {
                result[field] = typeof data[field] === "string" ? data[field].trim() : data[field] ?? "";
            }
        }
        return result;
    }

    async findOrFail(id) {
        assertObjectId(id, "la organización");
        const organization = await OrganizationModel.findById(id);
        if (!organization) {
            throw new AppError(404, `No se encontró la organización con ID ${id}`);
        }
        return organization;
    }
}

module.exports = OrganizationsService;
