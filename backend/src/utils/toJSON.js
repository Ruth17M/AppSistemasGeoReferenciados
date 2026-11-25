"use strict";

// Opciones comunes de toJSON: expone "id" en lugar de "_id" y quita "__v".
const toJSONOptions = {
    virtuals: false,
    versionKey: false,
    transform(document, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        return ret;
    }
};

module.exports = toJSONOptions;
