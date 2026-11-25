"use strict";

const { ORGANIZATION_TYPES } = require("../../models/organization.model");

const organizationSchema = {
    name: { type: "string", required: true, min: 3, max: 80, label: "nombre" },
    type: { type: "enum", required: true, values: ORGANIZATION_TYPES, label: "tipo" },
    contactName: { type: "string", required: true, min: 3, max: 80, label: "responsable" },
    phone: {
        type: "string",
        required: true,
        label: "teléfono",
        pattern: /^[0-9+\-\s()]{7,20}$/,
        patternMessage: "El teléfono debe tener entre 7 y 20 dígitos"
    },
    email: { type: "email", max: 120, label: "correo" }
};

module.exports = { organizationSchema };
