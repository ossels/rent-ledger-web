import { PrismaClient, OwnerKind, EntryKind, EntryStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Seed mirrors the design system's mock ledger: two owners, five buildings,
// eight months of history ending at the current month.
async function main() {
  await prisma.entry.deleteMany();
  await prisma.building.deleteMany();
  await prisma.party.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.party.createMany({
    data: [
      { key: "a", name: "Ravi", note: "You" },
      { key: "b", name: "Meera", note: "Wife" },
    ],
  });

  await prisma.settings.create({ data: { id: 1 } });

  const buildings = [
    { name: "Sai Nivas", unit: "2F", area: "Kothrud", tenant: "Deshpande family", rent: 6000, splitA: 4000, splitB: 2000, owner: OwnerKind.SHARED },
    { name: "Anand Apartments", unit: "B-3", area: "Karve Nagar", tenant: "Iqbal Shaikh", rent: 12000, splitA: 12000, splitB: 0, owner: OwnerKind.A },
    { name: "Green Villa", unit: "Ground", area: "Baner", tenant: "Nair family", rent: 8000, splitA: 0, splitB: 8000, owner: OwnerKind.B },
    { name: "Shanti Chawl", unit: "Room 4", area: "Hadapsar", tenant: "Sunita Pawar", rent: 6000, splitA: 3000, splitB: 3000, owner: OwnerKind.SHARED },
    { name: "Laxmi Complex", unit: "3C", area: "Wakad", tenant: "Bhosale & Co.", rent: 12000, splitA: 9000, splitB: 3000, owner: OwnerKind.SHARED },
  ];

  const created = [];
  for (const b of buildings) {
    created.push(await prisma.building.create({ data: b }));
  }

  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const currentKey = monthKeys[monthKeys.length - 1];

  const expenseSeed = [
    { idx: 0, note: "Plumbing — 2F bathroom", total: 1800, day: 9 },
    { idx: 4, note: "Lift servicing", total: 2700, day: 14 },
    { idx: 3, note: "Whitewash", total: 3200, day: 6 },
    { idx: 2, note: "Water tank cleaning", total: 1200, day: 18 },
  ];

  for (let mi = 0; mi < monthKeys.length; mi++) {
    const key = monthKeys[mi];
    const isCurrent = key === currentKey;
    for (let bi = 0; bi < created.length; bi++) {
      const b = created[bi];
      const collected = !isCurrent || bi < 3;
      await prisma.entry.create({
        data: {
          buildingId: b.id,
          kind: EntryKind.RENT,
          month: key,
          day: 3 + bi,
          total: b.rent,
          splitA: b.splitA,
          splitB: b.splitB,
          status: collected ? EntryStatus.COLLECTED : EntryStatus.AWAITED,
          note: b.tenant,
        },
      });
    }
    if (mi % 2 === 0 || isCurrent) {
      const ex = expenseSeed[(mi + 1) % expenseSeed.length];
      const half = Math.round(ex.total / 2);
      await prisma.entry.create({
        data: {
          buildingId: created[ex.idx].id,
          kind: EntryKind.EXPENSE,
          month: key,
          day: ex.day,
          total: ex.total,
          splitA: half,
          splitB: ex.total - half,
          status: EntryStatus.PAID,
          note: ex.note,
        },
      });
    }
  }

  console.log(`Seeded ${created.length} buildings across ${monthKeys.length} months (${monthKeys[0]} … ${currentKey}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
