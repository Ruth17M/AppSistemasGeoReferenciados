"use strict";

// Error "operacional": lleva el código HTTP que se debe responder.
class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
