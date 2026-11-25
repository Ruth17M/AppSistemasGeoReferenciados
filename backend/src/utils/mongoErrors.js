"use strict";

const mongoose = require("mongoose");
const AppError = require("./appError");

// Traduce errores de Mongoose/MongoDB a AppError con el código HTTP correcto.
function toAppError(error, entityName = "registro") {
    if (error instanceof AppError) return error;

    if (error instanceof mongoose.Error.ValidationError) {
        const details = Object.values(error.errors).map((item) => item.message);
        return new AppError(400, "La información enviada no es válida", details);
    }

    if (error instanceof mongoose.Error.CastError) {
        return new AppError(400, `El valor de "${error.path}" no es válido`);
    }

    if (error && error.code === 11000) {
        const FIELD_NAMES = { name: "nombre", email: "correo" };
        const field = Object.keys(error.keyValue || {})[0];
        return new AppError(400, `Ya existe un registro de ${entityName} con ese ${FIELD_NAMES[field] || field}`);
    }

    // 16755: "Can't extract geo keys" -> polígono inválido (se cruza, etc.)
    if (error && error.code === 16755) {
        return new AppError(400, "La geometría no es válida (revisa que el polígono no se cruce consigo mismo)");
    }

    return error;
}

function assertObjectId(id, entityName = "el registro") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(404, `No se encontró ${entityName} con ID ${id}`);
    }
}

module.exports = { toAppError, assertObjectId };
