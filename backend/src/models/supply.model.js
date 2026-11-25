"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

const SUPPLY_UNITS = ["piezas", "kg", "litros", "cajas", "paquetes"];
const SUPPLY_PRIORITIES = ["baja", "media", "alta", "urgente"];

// Insumo que necesita / tiene un centro de acopio (relación supply -> location).
const supplySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minLength: 3, maxLength: 80 },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true, enum: SUPPLY_UNITS },
        priority: { type: String, required: true, enum: SUPPLY_PRIORITIES, default: "media" },
        location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

const SupplyModel = mongoose.model("Supply", supplySchema);

module.exports = SupplyModel;
module.exports.SUPPLY_UNITS = SUPPLY_UNITS;
module.exports.SUPPLY_PRIORITIES = SUPPLY_PRIORITIES;
