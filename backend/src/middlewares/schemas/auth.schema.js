"use strict";

const registerSchema = {
    name: { type: "string", required: true, min: 3, max: 80, label: "nombre" },
    email: { type: "email", required: true, max: 120, label: "correo" },
    password: {
        type: "string",
        required: true,
        min: 8,
        max: 64,
        label: "contraseña",
        pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
        patternMessage: "La contraseña debe incluir al menos una letra y un número"
    }
};

const loginSchema = {
    email: { type: "email", required: true, label: "correo" },
    password: { type: "string", required: true, label: "contraseña" }
};

module.exports = { registerSchema, loginSchema };
