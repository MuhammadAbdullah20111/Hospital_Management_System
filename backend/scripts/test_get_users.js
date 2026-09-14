import ZKLib from 'zk-attendance-sdk';
import prisma from '../config/prismaClient.js';

async function main() {
  console.log('Fetching active biometric devices from database...');
  const devices = await prisma.biometricDevice.findMany({
    where: { isActive: true }
  });

  if (devices.length === 0) {
    console.log('No active biometric devices found in the database.');
    return;
  }

  // Find physical device (exclude simulated 127.0.0.1)
  const physicalDevice = devices.find(d => d.ipAddress !== '127.0.0.1');
  if (!physicalDevice) {
    console.log('No physical biometric devices (IP != 127.0.0.1) found.');
    return;
  }

  const { ipAddress, port, name } = physicalDevice;
  console.log(`Connecting to physical device "${name}" at ${ipAddress}:${port}...`);

  const zkInstance = new ZKLib(ipAddress, port, 10000, 4000);
  try {
    await zkInstance.createSocket();
    console.log('Socket created successfully. Fetching users...');

    const response = await zkInstance.getUsers();
    console.log('Response status:', {
      hasResponse: !!response,
      keys: response ? Object.keys(response) : null,
      err: response && response.err ? response.err.message : null,
      dataLength: response && response.data ? response.data.length : null
    });

    if (response && response.data) {
      console.log('\n--- Registered Users on Device ---');
      response.data.forEach(user => {
        console.log(`UID: ${user.uid}, UserID (PIN): ${user.userId}, Name: "${user.name}", Role: ${user.role}`);
      });
    } else {
      console.log('No user data returned from device.');
    }

    await zkInstance.disconnect();
    console.log('\nDisconnected.');
  } catch (err) {
    console.error('Error connecting or pulling users:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
