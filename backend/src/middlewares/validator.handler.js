"use strict";

const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const { isValidPosition } = require("../utils/geo");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function isEmpty(value) {
    return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

// Revisa UN campo contra sus reglas y regresa la lista de errores encontrados.
function checkField(field, value, rules) {
    const label = rules.label || field;
    const errors = [];

    switch (rules.type) {
        case "string":
        case "email":
            if (typeof value !== "string") {
                errors.push(`"${label}" debe ser texto`);
                break;
            }
            if (rules.min && value.trim().length < rules.min) {
                errors.push(`"${label}" debe tener al menos ${rules.min} caracteres`);
            }
            if (rules.max && value.trim().length > rules.max) {
                errors.push(`"${label}" no debe superar ${rules.max} caracteres`);
            }
            if (rules.type === "email" && value.trim() !== "" && !EMAIL_REGEX.test(value.trim())) {
                errors.push(`"${label}" no es un correo válido`);
            }
            if (rules.pattern && !rules.pattern.test(value.trim())) {
                errors.push(rules.patternMessage || `"${label}" no tiene un formato válido`);
            }
            break;
        case "number": {
            const number = Number(value);
            if (value === "" || !Number.isFinite(number)) {
                errors.push(`"${label}" debe ser numérico`);
            } else if (rules.min !== undefined && number < rules.min) {
                errors.push(`"${label}" debe ser mayor o igual a ${rules.min}`);
            } else if (rules.max !== undefined && number > rules.max) {
                errors.push(`"${label}" debe ser menor o igual a ${rules.max}`);
            }
            break;
        }
        case "enum":
            if (!rules.values.includes(value)) {
                errors.push(`"${label}" debe ser uno de: ${rules.values.join(", ")}`);
            }
            break;
        case "color":
            if (typeof value !== "string" || !COLOR_REGEX.test(value)) {
                errors.push(`"${label}" debe ser un color hexadecimal (#rrggbb)`);
            }
            break;
        case "objectId":
            if (!mongoose.Types.ObjectId.isValid(value)) {
                errors.push(`"${label}" no es un identificador válido`);
            }
            break;
        case "polygon":
            // Se espera un arreglo de vértices [[lng, lat], [lng, lat], ...]
            if (!Array.isArray(value) || value.length < 3) {
                errors.push(`"${label}" debe tener al menos 3 vértices`);
            } else if (!value.every((position) => isValidPosition(position))) {
                errors.push(`"${label}" contiene vértices inválidos; usa [longitud, latitud]`);
            }
            break;
        default:
            break;
    }
    return errors;
}

/**
 * Crea un middleware que valida req.body con un "esquema" sencillo:
 *   { campo: { type, required, min, max, values, nullable, label } }
 * partial = true se usa en PATCH/PUT (los campos son opcionales, pero
 * debe venir al menos uno).
 */
function validateBody(schema, { partial = false } = {}) {
    return function bodyValidator(req, res, next) {
        const body = req.body;
        const errors = [];

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return next(new AppError(400, "El cuerpo de la petición debe ser un objeto JSON"));
        }

        const unknown = Object.keys(body).filter((key) => !(key in schema));
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}`);
        }

        const provided = Object.keys(schema).filter((key) => body[key] !== undefined);
        if (partial && provided.length === 0) {
            errors.push("Debes enviar al menos un campo para actualizar");
        }

        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];
            if (isEmpty(value)) {
                if (!partial && rules.required) {
                    errors.push(`El campo "${rules.label || field}" es obligatorio`);
                } else if (partial && rules.required && value !== undefined) {
                    errors.push(`El campo "${rules.label || field}" no puede quedar vacío`);
                }
                continue;
            }
            errors.push(...checkField(field, value, rules));
        }

        if (errors.length > 0) {
            return next(new AppError(400, "La información enviada no es válida", errors));
        }
        next();
    };
}

// Valida que :id sea un ObjectId; si no, el recurso "no existe" (404).
function validateIdParam(entityName = "el registro") {
    return function idValidator(req, res, next) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new AppError(404, `No se encontró ${entityName} con ID ${req.params.id}`));
        }
        next();
    };
}

// Valida parámetros de consulta (?search=&category=...)
function validateQuery(schema) {
    return function queryValidator(req, res, next) {
        const errors = [];
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.query[field];
            if (isEmpty(value) || value === "all") continue;
            errors.push(...checkField(field, value, rules));
        }
        if (errors.length > 0) {
            return next(new AppError(400, "Los parámetros de búsqueda no son válidos", errors));
        }
        next();
    };
}

module.exports = { validateBody, validateIdParam, validateQuery };
