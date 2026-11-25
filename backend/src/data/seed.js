"use strict";

/**
 * Carga datos de ejemplo y el usuario de prueba.
 * ¡OJO! Borra las colecciones del proyecto antes de insertar.
 *   npm run seed
 */
const bcrypt = require("bcryptjs");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const UserModel = require("../models/user.model");
const CategoryModel = require("../models/category.model");
const OrganizationModel = require("../models/organization.model");
const LocationModel = require("../models/location.model");
const ZoneModel = require("../models/zone.model");
const SupplyModel = require("../models/supply.model");
const { toPoint, closeRing } = require("../utils/geo");

const DEMO_EMAIL = process.env.SEED_USER_EMAIL || "demo@acopiomap.mx";
const DEMO_PASSWORD = process.env.SEED_USER_PASSWORD || "Demo12345";

async function seed() {
    await connectDatabase();

    await Promise.all([
        UserModel.deleteMany({}),
        CategoryModel.deleteMany({}),
        OrganizationModel.deleteMany({}),
        LocationModel.deleteMany({}),
        ZoneModel.deleteMany({}),
        SupplyModel.deleteMany({})
    ]);

    const user = await UserModel.create({
        name: "Usuario Demo",
        email: DEMO_EMAIL,
        password: await bcrypt.hash(DEMO_PASSWORD, 10)
    });

    const [viveres, medicamentos, agua, ropa, albergue] = await CategoryModel.create([
        { name: "Víveres", color: "#ea580c", description: "Alimentos no perecederos" },
        { name: "Medicamentos", color: "#dc2626", description: "Material de curación y medicinas" },
        { name: "Agua potable", color: "#0284c7", description: "Garrafones y botellas de agua" },
        { name: "Ropa y cobijas", color: "#7c3aed", description: "Ropa en buen estado, cobijas y colchonetas" },
        { name: "Albergue", color: "#16a34a", description: "Espacio temporal para personas damnificadas" }
    ]);

    const [cruz, voluntarios, municipio] = await OrganizationModel.create([
        { name: "Brigada Ciudadana Centro", type: "voluntarios", contactName: "Laura Méndez", phone: "55 1234 5678", email: "brigada@ejemplo.mx" },
        { name: "Red de Apoyo Vecinal", type: "ong", contactName: "Jorge Salinas", phone: "55 8765 4321", email: "contacto@redvecinal.mx" },
        { name: "Protección Civil Municipal", type: "gobierno", contactName: "Ana Ruiz", phone: "55 5555 0101", email: "" }
    ]);

    const locationsData = [
        ["Parroquia San José", "Recibe víveres y artículos de limpieza de 9 a 19 h.", viveres, voluntarios, "activo", -99.1372, 19.4270],
        ["Centro Comunitario Doctores", "Acopio de medicinas; se requieren gasas y analgésicos.", medicamentos, cruz, "saturado", -99.1450, 19.4180],
        ["Deportivo Guelatao", "Albergue con 120 catres y cocina comunitaria.", albergue, municipio, "activo", -99.1250, 19.4400],
        ["Escuela Benito Juárez", "Recibe agua embotellada y garrafones.", agua, municipio, "activo", -99.1580, 19.4310],
        ["Bodega Mercado Jamaica", "Ropa, cobijas y colchonetas. Cierra temporalmente.", ropa, voluntarios, "cerrado", -99.1225, 19.4105],
        ["Casa de Cultura Tlatelolco", "Víveres y productos de higiene personal.", viveres, cruz, "activo", -99.1390, 19.4510],
        ["Clínica Popular Roma", "Primeros auxilios y medicamentos básicos.", medicamentos, null, "activo", -99.1620, 19.4150]
    ];

    const locations = await LocationModel.create(
        locationsData.map(([name, description, category, organization, status, lng, lat]) => ({
            name,
            description,
            category: category._id,
            organization: organization ? organization._id : null,
            status,
            createdBy: user._id,
            location: toPoint(lng, lat)
        }))
    );

    await ZoneModel.create([
        {
            name: "Zona afectada Centro",
            color: "#dc2626",
            createdBy: user._id,
            area: {
                type: "Polygon",
                coordinates: [closeRing([
                    [-99.1500, 19.4220], [-99.1300, 19.4220], [-99.1300, 19.4330], [-99.1500, 19.4330]
                ])]
            }
        },
        {
            name: "Cobertura Brigada Norte",
            color: "#2563eb",
            createdBy: user._id,
            area: {
                type: "Polygon",
                coordinates: [closeRing([
                    [-99.1480, 19.4380], [-99.1200, 19.4380], [-99.1200, 19.4560], [-99.1480, 19.4560]
                ])]
            }
        }
    ]);

    await SupplyModel.create([
        { name: "Arroz", quantity: 250, unit: "kg", priority: "alta", location: locations[0]._id },
        { name: "Frijol", quantity: 180, unit: "kg", priority: "media", location: locations[0]._id },
        { name: "Gasas estériles", quantity: 40, unit: "cajas", priority: "urgente", location: locations[1]._id },
        { name: "Paracetamol 500 mg", quantity: 60, unit: "cajas", priority: "alta", location: locations[1]._id },
        { name: "Catres", quantity: 120, unit: "piezas", priority: "baja", location: locations[2]._id },
        { name: "Garrafones de agua", quantity: 300, unit: "piezas", priority: "urgente", location: locations[3]._id },
        { name: "Cobijas", quantity: 95, unit: "piezas", priority: "media", location: locations[4]._id }
    ]);

    console.log("Datos de ejemplo cargados.");
    console.log(`Usuario de prueba: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

seed()
    .catch((error) => {
        console.error("Error al cargar datos:", error);
        process.exitCode = 1;
    })
    .finally(() => disconnectDatabase());
