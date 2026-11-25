"use strict";

// "coordinates" es el anillo exterior: [[lng, lat], [lng, lat], ...]
const zoneSchema = {
    name: { type: "string", required: true, min: 3, max: 80, label: "nombre" },
    color: { type: "color", label: "color" },
    coordinates: { type: "polygon", required: true, label: "vértices" }
};

module.exports = { zoneSchema };
