import prisma from '../config/prismaClient.js';
import BiometricService from '../services/biometricService.js';

async function main() {
  console.log('Starting relinking of attendance logs for all active staff PINs...');
  
  const staffMembers = await prisma.staff.findMany({
    where: { 
      isActive: true,
      biometricPin: { not: null }
    }
  });

  console.log(`Found ${staffMembers.length} active staff members with biometric PINs.`);

  for (const staff of staffMembers) {
    console.log(`Relinking logs for ${staff.name} (ID: ${staff.id}, PIN: ${staff.biometricPin})...`);
    // Pass null as oldPin and staff.biometricPin as newPin to trigger full mapping and recalculation
    await BiometricService.handleStaffPinMappingUpdate(staff.id, null, staff.biometricPin);
  }

  console.log('Relinking and daily summary recalculation complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
