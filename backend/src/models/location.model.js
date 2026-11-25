"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

const LOCATION_STATUSES = ["activo", "saturado", "cerrado"];

// Ubicación exacta: un centro de acopio. Se guarda como GeoJSON Point [lng, lat].
const locationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minLength: 3, maxLength: 80 },
        description: { type: String, required: true, trim: true, minLength: 5, maxLength: 300 },
        // Relaciones por referencia (ObjectId + populate)
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: LOCATION_STATUSES, default: "activo" },
        location: {
            type: { type: String, enum: ["Point"], required: true, default: "Point" },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (value) =>
                        value.length === 2 &&
                        value[0] >= -180 && value[0] <= 180 &&
                        value[1] >= -90 && value[1] <= 90,
                    message: "Las coordenadas deben ser [longitud, latitud] válidas"
                }
            }
        }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

locationSchema.index({ location: "2dsphere" });

const LocationModel = mongoose.model("Location", locationSchema);

module.exports = LocationModel;
module.exports.LOCATION_STATUSES = LOCATION_STATUSES;
