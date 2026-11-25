"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minLength: 3, maxLength: 80 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El correo no tiene un formato válido"]
        },
        // Se guarda SOLO el hash generado con bcrypt, nunca la contraseña en texto plano.
        password: { type: String, required: true, select: false }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

module.exports = mongoose.model("User", userSchema);
