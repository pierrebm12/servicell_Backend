"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@servicell.com' },
        update: {},
        create: {
            name: 'Admin ServiCell',
            email: 'admin@servicell.com',
            password: hashedPassword,
            phone: '+584141234567',
            role: client_1.Role.ADMIN,
        },
    });
    const recepcion = await prisma.user.upsert({
        where: { email: 'recepcion@servicell.com' },
        update: {},
        create: {
            name: 'Recepcionista',
            email: 'recepcion@servicell.com',
            password: hashedPassword,
            phone: '+584141234568',
            role: client_1.Role.RECEPCION,
        },
    });
    const tecnico = await prisma.user.upsert({
        where: { email: 'tecnico@servicell.com' },
        update: {},
        create: {
            name: 'Técnico Principal',
            email: 'tecnico@servicell.com',
            password: hashedPassword,
            phone: '+584141234569',
            role: client_1.Role.TECNICO,
        },
    });
    const config = await prisma.companyConfig.upsert({
        where: { id: 1 },
        update: {},
        create: {
            companyName: 'ServiCell',
            address: 'Cra 4 #12-34, Yopal, Casanare',
            phone: '3222570665',
            email: 'Servicellyopal13@gmail.com',
            primaryColor: '#1976D2',
            whatsappPhoneId: '3222570665',
            terms: 'Los equipos ingresados en nuestro taller serán revisados en un plazo máximo de 48 horas hábiles. El cliente autoriza la revisión y diagnóstico del equipo. El presupuesto tendrá una validez de 5 días hábiles. Una vez aprobado el presupuesto, el cliente acepta los tiempos estimados de reparación. ServiCell no se responsabiliza por daños causados por terceros o por el mal uso del equipo. Los datos personales del cliente serán tratados de acuerdo a la ley de protección de datos vigente.',
        },
    });
    console.log('Seed completed:');
    console.log(`  Admin: admin@servicell.com / admin123`);
    console.log(`  Recepcion: recepcion@servicell.com / admin123`);
    console.log(`  Tecnico: tecnico@servicell.com / admin123`);
    console.log(`  Company config created`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map