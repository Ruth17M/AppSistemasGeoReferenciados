"use strict";

const categorySchema = {
    name: { type: "string", required: true, min: 3, max: 50, label: "nombre" },
    description: { type: "string", max: 200, label: "descripción" },
    color: { type: "color", required: true, label: "color" }
};

module.exports = { categorySchema };
