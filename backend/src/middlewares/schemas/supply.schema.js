"use strict";

const { SUPPLY_UNITS, SUPPLY_PRIORITIES } = require("../../models/supply.model");

const supplySchema = {
    name: { type: "string", required: true, min: 3, max: 80, label: "nombre" },
    quantity: { type: "number", required: true, min: 0, max: 1000000, label: "cantidad" },
    unit: { type: "enum", required: true, values: SUPPLY_UNITS, label: "unidad" },
    priority: { type: "enum", required: true, values: SUPPLY_PRIORITIES, label: "prioridad" },
    location: { type: "objectId", required: true, label: "centro de acopio" }
};

const supplyQuerySchema = {
    location: { type: "objectId", label: "centro de acopio" },
    priority: { type: "enum", values: SUPPLY_PRIORITIES, label: "prioridad" }
};

module.exports = { supplySchema, supplyQuerySchema };
