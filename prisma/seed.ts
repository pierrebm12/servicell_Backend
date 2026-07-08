import { PrismaClient, Role, OrderStatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
      role: Role.ADMIN,
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
      role: Role.RECEPCION,
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
      role: Role.TECNICO,
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
