"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

// Zona dibujada por el usuario (zona afectada, de cobertura, etc.)
// Se guarda como GeoJSON Polygon: [[ [lng, lat], [lng, lat], ..., [lng, lat] ]]
const zoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minLength: 3, maxLength: 80 },
        color: { type: String, default: "#2563eb", match: /^#[0-9a-fA-F]{6}$/ },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        area: {
            type: { type: String, enum: ["Polygon"], required: true, default: "Polygon" },
            coordinates: { type: [[[Number]]], required: true }
        }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

zoneSchema.index({ area: "2dsphere" });

module.exports = mongoose.model("Zone", zoneSchema);
