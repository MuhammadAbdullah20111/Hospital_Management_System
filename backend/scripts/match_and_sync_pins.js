import ZKLib from 'node-zklib';
import prisma from '../config/prismaClient.js';
import BiometricService from '../services/biometricService.js';

// Normalization function to compare names cleanly
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr[\.,\s]+|dr\b|mr[\.,\s]+|mr\b|ms[\.,\s]+|ms\b|mrs[\.,\s]+|mrs\b)/g, '') // remove titles
    .replace(/[^a-z0-9]/g, '') // remove spaces/special characters
    .trim();
}

async function main() {
  console.log('Fetching active biometric devices from database...');
  const devices = await prisma.biometricDevice.findMany({
    where: { isActive: true }
  });

  if (devices.length === 0) {
    console.log('No active biometric devices found in the database.');
    return;
  }

  const physicalDevice = devices.find(d => d.ipAddress !== '127.0.0.1');
  if (!physicalDevice) {
    console.log('No physical biometric devices found.');
    return;
  }

  const { ipAddress, port, name } = physicalDevice;
  console.log(`Connecting to physical device "${name}" at ${ipAddress}:${port}...`);

  const zkInstance = new ZKLib(ipAddress, port, 10000, 4000);
  try {
    await zkInstance.createSocket();
    console.log('Socket created successfully. Fetching users...');

    const response = await zkInstance.getUsers();
    await zkInstance.disconnect();

    if (!response || !response.data) {
      console.log('No user data returned from device.');
      return;
    }

    const deviceUsers = response.data;
    console.log(`Fetched ${deviceUsers.length} users from device.`);

    // Fetch active database staff
    const staffMembers = await prisma.staff.findMany({
      where: { isActive: true }
    });
    console.log(`Fetched ${staffMembers.length} active staff members from database.`);

    console.log('\nAnalyzing potential name matches between database and device...');
    const matchesToApply = [];

    for (const staff of staffMembers) {
      const dbNorm = normalizeName(staff.name);
      if (!dbNorm) continue;

      let bestMatch = null;
      let matchType = '';

      for (const dUser of deviceUsers) {
        const devNorm = normalizeName(dUser.name);
        if (!devNorm) continue;

        // Rule 1: Exact match
        if (dbNorm === devNorm) {
          bestMatch = dUser;
          matchType = 'Exact Name Match';
          break;
        }

        // Rule 2: Database name starts with device name or vice versa (for short/first name matching)
        if ((dbNorm.startsWith(devNorm) && devNorm.length >= 3) || (devNorm.startsWith(dbNorm) && dbNorm.length >= 3)) {
          bestMatch = dUser;
          matchType = 'Partial Match';
        }
      }

      if (bestMatch) {
        matchesToApply.push({
          staffId: staff.id,
          staffName: staff.name,
          currentPin: staff.biometricPin,
          newPin: String(bestMatch.userId),
          deviceName: bestMatch.name,
          matchType
        });
      }
    }

    if (matchesToApply.length === 0) {
      console.log('No matching staff profiles found.');
      return;
    }

    console.log(`\nFound ${matchesToApply.length} potential matches to apply:`);
    matchesToApply.forEach(m => {
      console.log(`- DB Staff "${m.staffName}" (ID: ${m.staffId}) [Current PIN: ${m.currentPin || 'None'}] -> Device User "${m.deviceName}" (Device PIN: ${m.newPin}) via ${m.matchType}`);
    });

    console.log('\nApplying updates in the database (Historical logs will be relinked)...');
    for (const match of matchesToApply) {
      const { staffId, staffName, currentPin, newPin } = match;
      
      if (currentPin === newPin) {
        console.log(`  Staff "${staffName}" is already linked to PIN ${newPin}. Skipping...`);
        continue;
      }

      console.log(`  Updating "${staffName}" to PIN ${newPin}...`);
      
      // Update database staff profile
      await prisma.staff.update({
        where: { id: staffId },
        data: { biometricPin: newPin }
      });

      // Trigger log relinking and summary recalculation
      await BiometricService.handleStaffPinMappingUpdate(staffId, currentPin, newPin);
    }

    console.log('\nMatches successfully applied and local database records updated!');
  } catch (err) {
    console.error('Error during matching and update:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
