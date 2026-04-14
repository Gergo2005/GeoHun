import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adatbázis seedelés...');

  // Tagok beszúrása
  const members = [
    {
      id: 1,
      name: 'Hajdu Mátyás',
      gender: 'M' as const,
      birth_date: new Date('2007-02-12'),
      banned: false,
      created_at: new Date('2022-01-03 07:17:01'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 2,
      name: 'Orsós Kornél PhD',
      gender: 'M' as const,
      birth_date: new Date('2006-05-19'),
      banned: false,
      created_at: new Date('2022-03-05 12:49:04'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 3,
      name: 'id. Novák Szandra PhD',
      gender: 'F' as const,
      birth_date: new Date('1995-10-29'),
      banned: false,
      created_at: new Date('2022-03-18 08:12:05'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 4,
      name: 'Török Géza PhD',
      gender: 'M' as const,
      birth_date: new Date('1997-04-04'),
      banned: false,
      created_at: new Date('2022-01-06 21:57:16'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 5,
      name: 'id. Balla Gréta',
      gender: 'F' as const,
      birth_date: new Date('2006-02-18'),
      banned: false,
      created_at: new Date('2022-01-15 22:00:08'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 6,
      name: 'Dr. Hegedüs Zoltán PhD',
      gender: 'M' as const,
      birth_date: new Date('1984-10-18'),
      banned: false,
      created_at: new Date('2022-03-24 17:02:29'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 7,
      name: 'ifj. Balogh Endrené',
      gender: null,
      birth_date: new Date('2007-01-04'),
      banned: false,
      created_at: new Date('2022-04-01 02:31:09'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 8,
      name: 'Prof. Fehér Kevin PhD',
      gender: null,
      birth_date: new Date('1992-05-12'),
      banned: false,
      created_at: new Date('2022-03-17 00:16:55'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 9,
      name: 'id. Török Zsóka PhD',
      gender: 'F' as const,
      birth_date: new Date('1978-01-06'),
      banned: false,
      created_at: new Date('2022-03-09 15:15:21'),
      updated_at: new Date('2022-04-10 18:35:20')
    },
    {
      id: 10,
      name: 'Szalai Mátyás PhD',
      gender: 'M' as const,
      birth_date: new Date('1988-11-07'),
      banned: false,
      created_at: new Date('2022-02-13 00:55:22'),
      updated_at: new Date('2022-04-10 18:35:20')
    }
  ];

  for (const member of members) {
    await prisma.members.upsert({
      where: { id: member.id },
      update: {},
      create: member
    });
  }

  console.log('✅ Seedelés befejezve');
}

main()
  .catch((e) => {
    console.error('❌ Seedelési hiba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });