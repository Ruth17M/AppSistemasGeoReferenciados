"use strict";

// Utilidades GeoJSON. Recordatorio: GeoJSON SIEMPRE usa [longitud, latitud].

function toPoint(longitude, latitude) {
    return { type: "Point", coordinates: [Number(longitude), Number(latitude)] };
}

function isValidPosition(position) {
    return (
        Array.isArray(position) &&
        position.length >= 2 &&
        Number.isFinite(position[0]) && position[0] >= -180 && position[0] <= 180 &&
        Number.isFinite(position[1]) && position[1] >= -90 && position[1] <= 90
    );
}

// Cierra el anillo del polígono (el último vértice debe ser igual al primero).
function closeRing(ring) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
        return [...ring, [first[0], first[1]]];
    }
    return ring;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { toPoint, isValidPosition, closeRing, escapeRegex };
