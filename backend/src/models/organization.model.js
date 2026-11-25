"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

const ORGANIZATION_TYPES = ["gobierno", "ong", "privada", "voluntarios", "religiosa"];

// Organización responsable de operar uno o varios centros de acopio.
const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true, minLength: 3, maxLength: 80 },
        type: { type: String, required: true, enum: ORGANIZATION_TYPES },
        contactName: { type: String, required: true, trim: true, minLength: 3, maxLength: 80 },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9+\-\s()]{7,20}$/, "El teléfono no tiene un formato válido"]
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
            match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El correo no tiene un formato válido"]
        }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

const OrganizationModel = mongoose.model("Organization", organizationSchema);

module.exports = OrganizationModel;
module.exports.ORGANIZATION_TYPES = ORGANIZATION_TYPES;
