"use strict";

const AppError = require("../utils/appError");

// 404: ninguna ruta coincidió con la petición.
function notFoundHandler(req, res, next) {
    next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}`));
}

// Registra el error en consola y lo pasa al siguiente manejador.
function logErrors(err, req, res, next) {
    const status = err.statusCode || 500;
    if (status >= 500) {
        console.error("\n--------------- ERROR ---------------");
        console.error("Fecha:", new Date().toISOString());
        console.error("Ruta:", req.method, req.originalUrl);
        console.error(err.stack || err);
        console.error("-------------------------------------\n");
    } else {
        console.warn(`[${status}] ${req.method} ${req.originalUrl} -> ${err.message}`);
    }
    next(err);
}

// Respuesta final y centralizada de errores.
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    // JSON mal escrito en el body
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: 400,
            message: "El cuerpo de la petición no es un JSON válido",
            details: null,
            path: req.originalUrl,
            timestamp: new Date().toISOString()
        });
    }

    const statusCode = err.isOperational ? err.statusCode : 500;
    const message = statusCode === 500 ? "Error interno del servidor" : err.message;

    res.status(statusCode).json({
        error: statusCode,
        message,
        details: err.details || null,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
}

module.exports = { notFoundHandler, logErrors, errorHandler };
