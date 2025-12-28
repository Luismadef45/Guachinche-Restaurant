import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLE_SEEDS = [
  {
    name: "Customer",
    description: "Customer ordering and loyalty access."
  },
  {
    name: "Waiter",
    description: "Front-of-house service operations."
  },
  {
    name: "Chef",
    description: "Kitchen operations and ticket management."
  },
  {
    name: "Shift Manager",
    description: "Shift oversight and staff coordination."
  },
  {
    name: "General Manager",
    description: "Restaurant operations and reporting."
  },
  {
    name: "Admin/Owner",
    description: "Full system administration."
  },
  {
    name: "Accountant/Analyst",
    description: "Read-only access to metrics and exports."
  }
];

const PERMISSION_SEEDS = [
  { key: "menu.read", description: "View menus and pricing." },
  { key: "menu.write", description: "Create and update menu items." },
  { key: "booking.read", description: "View bookings." },
  { key: "booking.write", description: "Create and update bookings." },
  { key: "order.read", description: "View orders." },
  { key: "order.write", description: "Update order status." },
  { key: "inventory.read", description: "View inventory levels." },
  { key: "inventory.write", description: "Adjust inventory levels." },
  { key: "staff.read", description: "View staff schedules." },
  { key: "staff.write", description: "Manage staff schedules." }
];

async function seedRolesAndPermissions() {
  for (const role of ROLE_SEEDS) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role
    });
  }

  for (const permission of PERMISSION_SEEDS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission
    });
  }
}

async function seedLocationAndTables() {
  const location = await prisma.restaurantLocation.upsert({
    where: { slug: "guachince-main" },
    update: {},
    create: {
      name: "Guachince Main Dining Room",
      slug: "guachince-main",
      timezone: "Atlantic/Canary",
      addressLine1: "Calle Principal 1",
      city: "Santa Cruz",
      country: "ES",
      phone: "+34 600 000 000",
      email: "hola@guachince.local"
    }
  });

  const tables = Array.from({ length: 12 }, (_, index) => ({
    name: `T${index + 1}`,
    capacity: index < 6 ? 2 : 4,
    locationId: location.id
  }));

  await prisma.table.createMany({
    data: tables,
    skipDuplicates: true
  });
}

async function main() {
  await seedRolesAndPermissions();
  await seedLocationAndTables();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
