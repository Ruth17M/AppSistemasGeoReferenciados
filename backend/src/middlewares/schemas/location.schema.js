"use strict";

const { LOCATION_STATUSES } = require("../../models/location.model");

const locationSchema = {
    name: { type: "string", required: true, min: 3, max: 80, label: "nombre" },
    description: { type: "string", required: true, min: 5, max: 300, label: "descripción" },
    category: { type: "objectId", required: true, label: "categoría" },
    organization: { type: "objectId", label: "organización" },
    status: { type: "enum", values: LOCATION_STATUSES, label: "estado" },
    latitude: { type: "number", required: true, min: -90, max: 90, label: "latitud" },
    longitude: { type: "number", required: true, min: -180, max: 180, label: "longitud" }
};

// Filtros: ?search=&category=&status=&zone=
const locationQuerySchema = {
    search: { type: "string", max: 80, label: "search" },
    category: { type: "objectId", label: "category" },
    status: { type: "enum", values: LOCATION_STATUSES, label: "status" },
    zone: { type: "objectId", label: "zone" }
};

module.exports = { locationSchema, locationQuerySchema };
