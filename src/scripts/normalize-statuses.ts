import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRawUnsafe(`
      UPDATE ordenes_servicio 
      SET status = 'EN_REPARACION' 
      WHERE status IN ('DIAGNOSTICO','ESPERANDO_APROBACION','ESPERANDO_REPUESTO','REPARADO','LISTO_ENTREGA','CANCELADO')
        OR status NOT IN ('RECIBIDO','EN_REPARACION','ENTREGADO')
    `);
    console.log(`[normalize-statuses] Updated rows: ${result}`);
  } catch (error) {
    console.error('[normalize-statuses] Error normalizing statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
