"use strict";

const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/jwt");
const { toAppError } = require("../utils/mongoErrors");

const SALT_ROUNDS = 10;

class UsersService {
    // Registro: valida correo duplicado y guarda la contraseña cifrada.
    async register({ name, email, password }) {
        const normalizedEmail = email.trim().toLowerCase();

        const exists = await UserModel.exists({ email: normalizedEmail });
        if (exists) {
            throw new AppError(400, "Ya existe una cuenta registrada con ese correo");
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        try {
            const user = await UserModel.create({
                name: name.trim(),
                email: normalizedEmail,
                password: passwordHash
            });
            return { user: user.toJSON(), token: signToken(user) };
        } catch (error) {
            throw toAppError(error, "usuario");
        }
    }

    // Login: busca el usuario y compara la contraseña con su hash.
    async login({ email, password }) {
        const user = await UserModel
            .findOne({ email: email.trim().toLowerCase() })
            .select("+password");

        const isValid = user ? await bcrypt.compare(password, user.password) : false;
        if (!isValid) {
            throw new AppError(401, "Correo o contraseña incorrectos");
        }

        return { user: user.toJSON(), token: signToken(user) };
    }

    async getById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new AppError(401, "El usuario de la sesión ya no existe");
        }
        return user.toJSON();
    }
}

module.exports = UsersService;
