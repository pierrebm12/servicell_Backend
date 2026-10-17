"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const resultOrders = await prisma.$executeRawUnsafe(`
      UPDATE ordenes_servicio 
      SET status = 'EN_REPARACION' 
      WHERE status IN ('DIAGNOSTICO','ESPERANDO_APROBACION','ESPERANDO_REPUESTO','REPARADO','LISTO_ENTREGA','CANCELADO')
        OR status NOT IN ('RECIBIDO','EN_REPARACION','ENTREGADO')
    `);
        console.log(`[normalize-statuses] Updated ordenes_servicio rows: ${resultOrders}`);
        const resultStatusTo = await prisma.$executeRawUnsafe(`
      UPDATE orden_estados 
      SET toStatus = 'EN_REPARACION' 
      WHERE toStatus IN ('DIAGNOSTICO','ESPERANDO_APROBACION','ESPERANDO_REPUESTO','REPARADO','LISTO_ENTREGA','CANCELADO')
        OR toStatus NOT IN ('RECIBIDO','EN_REPARACION','ENTREGADO')
    `);
        console.log(`[normalize-statuses] Updated orden_estados.toStatus rows: ${resultStatusTo}`);
        const resultStatusFrom = await prisma.$executeRawUnsafe(`
      UPDATE orden_estados 
      SET fromStatus = 'EN_REPARACION' 
      WHERE fromStatus IS NOT NULL 
        AND (fromStatus IN ('DIAGNOSTICO','ESPERANDO_APROBACION','ESPERANDO_REPUESTO','REPARADO','LISTO_ENTREGA','CANCELADO')
             OR fromStatus NOT IN ('RECIBIDO','EN_REPARACION','ENTREGADO'))
    `);
        console.log(`[normalize-statuses] Updated orden_estados.fromStatus rows: ${resultStatusFrom}`);
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