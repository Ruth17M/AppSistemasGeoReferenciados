"use strict";

const mongoose = require("mongoose");
const toJSONOptions = require("../utils/toJSON");

// Tipo de centro de acopio (víveres, medicamentos, agua, ropa, albergue...)
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true, minLength: 3, maxLength: 50 },
        description: { type: String, trim: true, maxLength: 200, default: "" },
        color: {
            type: String,
            required: true,
            match: [/^#[0-9a-fA-F]{6}$/, "El color debe ser hexadecimal, por ejemplo #e11d48"]
        }
    },
    { timestamps: true, toJSON: toJSONOptions }
);

module.exports = mongoose.model("Category", categorySchema);
