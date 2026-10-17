"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const result = await prisma.$executeRawUnsafe(`
      UPDATE ordenes_servicio 
      SET status = 'EN_REPARACION' 
      WHERE status IN ('DIAGNOSTICO','ESPERANDO_APROBACION','ESPERANDO_REPUESTO','REPARADO','LISTO_ENTREGA','CANCELADO')
        OR status NOT IN ('RECIBIDO','EN_REPARACION','ENTREGADO')
    `);
        console.log(`[normalize-statuses] Updated rows: ${result}`);
    }
    catch (error) {
        console.error('[normalize-statuses] Error normalizing statuses:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=normalize-statuses.js.map