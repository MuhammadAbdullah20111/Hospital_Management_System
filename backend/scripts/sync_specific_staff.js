import prisma from '../config/prismaClient.js';
import BiometricService from '../services/biometricService.js';

async function main() {
  const name = 'Nasir Khan';
  console.log(`Looking up staff member with name containing "${name}"...`);
  
  const staff = await prisma.staff.findFirst({
    where: { name: { contains: name, mode: 'insensitive' } }
  });

  if (!staff) {
    console.log(`Staff member containing "${name}" not found in database.`);
    return;
  }

  console.log(`Found Staff: "${staff.name}" (ID: ${staff.id}, PIN: ${staff.biometricPin})`);
  console.log('Attempting to sync this staff profile to ZKTeco terminal...');

  const results = await BiometricService.syncStaffToDevices(staff);
  console.log('Sync results:', JSON.stringify(results, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
